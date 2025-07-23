use crate::{
    cryptography::bridge::CryptographyBridge,
    errors::CryptographyError,
    types::{PolyBlock, PolyTransaction},
};
use std::collections::HashMap;

/// Transaction Sequencer for fair and deterministic ordering
#[derive(Debug)]
pub struct TransactionSequencer<C: CryptographyBridge> {
    pending_transactions: Vec<PolyTransaction>,
    sequence_counter: u64,
    ordering_strategy: OrderingStrategy,
    cryptography: C,
    private_keys: HashMap<String, C::SecretKey>,
}

#[derive(Debug, Clone)]
pub enum OrderingStrategy {
    FirstComeFirstServed,
    PriorityFee,
    FairOrdering,
    VrfRandom,
}

impl<C: CryptographyBridge> TransactionSequencer<C> {
    pub fn new(cryptography: C, private_keys: HashMap<String, C::SecretKey>) -> Self {
        Self {
            pending_transactions: Vec::new(),
            sequence_counter: 0,
            ordering_strategy: OrderingStrategy::FairOrdering,
            cryptography,
            private_keys,
        }
    }

    pub fn add_transaction(&mut self, transaction: PolyTransaction) -> Result<String, String> {
        if !transaction.is_valid() {
            return Err("Invalid transaction".to_string());
        }

        self.pending_transactions.push(transaction);
        self.sequence_counter += 1;
        Ok(format!("seq_tx_{}", self.sequence_counter))
    }

    pub fn sequence_batch(&mut self, batch_size: usize) -> Vec<PolyTransaction> {
        let take_count = batch_size.min(self.pending_transactions.len());

        match self.ordering_strategy {
            OrderingStrategy::FirstComeFirstServed => {
                // Simple FIFO
                self.pending_transactions.drain(0..take_count).collect()
            }
            OrderingStrategy::FairOrdering => {
                // Anti-MEV fair ordering
                self.pending_transactions.sort_by_key(|tx| {
                    use std::collections::hash_map::DefaultHasher;
                    use std::hash::{Hash, Hasher};
                    let mut hasher = DefaultHasher::new();
                    tx.sender.hash(&mut hasher);
                    tx.time_stamp.hash(&mut hasher);
                    hasher.finish()
                });
                self.pending_transactions.drain(0..take_count).collect()
            }
            _ => {
                // Default to FIFO for other strategies
                self.pending_transactions.drain(0..take_count).collect()
            }
        }
    }

    pub fn pending_count(&self) -> usize {
        self.pending_transactions.len()
    }

    pub fn set_ordering_strategy(&mut self, strategy: OrderingStrategy) {
        self.ordering_strategy = strategy;
    }
}

/// PoS Consensus with VRF (ton code)
// Removed std::time::Instant import for IC compatibility

type ProposerResult<C> = Result<Vec<(String, Vec<u8>, C)>, CryptographyError>;

#[derive(Debug)]
pub struct AlgoConsensus<C: CryptographyBridge>
where
    C::SignedMessage: std::fmt::Debug + Clone + Sync,
{
    participation_threshold: f64,
    max_proposers: usize,
    validators: usize,
    round_timeout: u64,
    cryptography: C,
    private_keys: HashMap<String, C::SecretKey>,
}

impl<C: CryptographyBridge> AlgoConsensus<C>
where
    C::SignedMessage: std::fmt::Debug + Clone + Sync,
{
    pub fn new(
        participation_threshold: f64,
        max_proposers: usize,
        validators: usize,
        round_timeout: u64,
        cryptography: C,
        private_keys: HashMap<String, C::SecretKey>,
    ) -> Result<Self, CryptographyError> {
        let (_pk, sk) = cryptography.key_generator()?;

        // Test basique de signature au lieu de VRF
        if cryptography.sign(&sk, b"test").is_err() {
            return Err(CryptographyError::SigningError);
        }
        Ok(Self {
            participation_threshold,
            max_proposers,
            validators,
            round_timeout,
            cryptography,
            private_keys,
        })
    }

    pub fn create_instance(
        cryptography: C,
        private_keys: HashMap<String, C::SecretKey>,
    ) -> Result<Self, CryptographyError> {
        Self::new(0.1, 5, 3, 5000, cryptography, private_keys)
    }

    fn create_seed(&self, prev_hash: &[u8; 32], time_stamp: i64) -> [u8; 32] {
        use blake3::Hasher;
        let mut hasher = Hasher::new();
        hasher.update(prev_hash);
        hasher.update(&time_stamp.to_le_bytes());
        hasher.finalize().into()
    }

    fn select_proposers(
        &self,
        balances: &HashMap<String, f64>,
        seed: &[u8; 32],
        _public_keys: &HashMap<String, C::PublicKey>,
    ) -> ProposerResult<C::SignedMessage> {
        let total_stake: f64 = balances.values().sum();
        if total_stake <= 0.0 {
            return Err(CryptographyError::SigningError);
        }

        let mut candidates: Vec<(String, f64, Vec<u8>, C::SignedMessage)> = Vec::new();

        for (address, stake) in balances.iter().filter(|(_, balance)| **balance > 0.0) {
            let weight = *stake / total_stake;
            if weight < self.participation_threshold {
                continue;
            }

            if let Some(private_key) = self.private_keys.get(address) {
                if let Ok((vrf_output, proof)) = self.vrf_generate_internal(private_key, seed) {
                    let priority = self.vrf_output(&vrf_output) * weight;
                    candidates.push((address.clone(), priority, vrf_output.to_vec(), proof));
                }
            }
        }

        candidates.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

        let selected = candidates
            .into_iter()
            .take(self.max_proposers)
            .map(|(addr, _, output, proof)| (addr, output, proof))
            .collect();

        Ok(selected)
    }

    fn vrf_output(&self, output: &[u8]) -> f64 {
        use blake3::Hasher;
        let mut hasher = Hasher::new();
        hasher.update(output);
        let hash = hasher.finalize();
        let first_bytes = &hash.as_bytes()[0..8];
        u64::from_le_bytes(first_bytes.try_into().unwrap()) as f64 / u64::MAX as f64
    }

    pub fn run_consensus_round(
        &self,
        prev_hash: &[u8; 32],
        transactions: Vec<PolyTransaction>,
        balances: &HashMap<String, f64>,
        public_keys: &HashMap<String, C::PublicKey>,
    ) -> Result<PolyBlock, CryptographyError> {
        let start_time = ic_cdk::api::time();

        // Convert hash for compatibility
        let prev_hash_string = hex::encode(prev_hash);
        let block = PolyBlock::new(transactions, prev_hash_string);
        let seed = self.create_seed(prev_hash, block.timestamp);

        let proposers = self.select_proposers(balances, &seed, public_keys)?;
        if proposers.is_empty() {
            return Err(CryptographyError::SigningError);
        }

        // Simplified consensus check
        let is_approved = proposers.len() >= self.validators.min(2);
        if !is_approved {
            return Err(CryptographyError::SigningError);
        }

        // Check timeout using IC time (nanoseconds)
        let elapsed_ns = ic_cdk::api::time() - start_time;
        let elapsed_ms = elapsed_ns / 1_000_000; // Convert to milliseconds
        if elapsed_ms > self.round_timeout {
            return Err(CryptographyError::SigningError);
        }

        Ok(block)
    }
}

// Extension VRF pour le consensus
impl<C: CryptographyBridge> AlgoConsensus<C>
where
    C::SignedMessage: std::fmt::Debug + Clone + Sync,
{
    // Méthode VRF intégrée qui utilise les méthodes crypto existantes
    fn vrf_generate_internal(
        &self,
        secret_key: &C::SecretKey,
        seed: &[u8],
    ) -> Result<(Vec<u8>, C::SignedMessage), CryptographyError> {
        // Fallback: utilise signature normale comme VRF
        let signature = self.cryptography.sign(secret_key, seed)?;
        Ok((seed.to_vec(), signature))
    }
}
