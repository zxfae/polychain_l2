use candid::{CandidType, Deserialize};

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PolyTransaction {
    pub sender: String,
    pub recipient: String,
    pub amount: f64,
    pub time_stamp: i64,
    pub signature: Option<String>,
    pub hash: Option<String>,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PolyBlock {
    pub transactions: Vec<PolyTransaction>,
    pub hash: String,
    pub previous_hash: String,
    pub timestamp: i64,
    pub nonce: u64,
}

impl PolyTransaction {
    pub fn new(sender: String, recipient: String, amount: f64) -> Self {
        Self {
            sender,
            recipient,
            amount,
            time_stamp: Self::get_current_time(),
            signature: None,
            hash: None,
        }
    }

    #[cfg(target_arch = "wasm32")]
    fn get_current_time() -> i64 {
        ic_cdk::api::time() as i64
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn get_current_time() -> i64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos() as i64)
            .unwrap_or_else(|_| {
                // Fallback to a fixed timestamp if system clock is before UNIX_EPOCH
                // This is extremely unlikely but provides safety
                ic_cdk::api::time() as i64
            })
    }

    pub fn sign(&mut self, signature: String) {
        self.signature = Some(signature);
    }

    pub fn is_valid(&self) -> bool {
        self.amount > 0.0 && !self.sender.is_empty() && !self.recipient.is_empty()
    }
}

impl PolyBlock {
    pub fn new(transactions: Vec<PolyTransaction>, previous_hash: String) -> Self {
        let timestamp = Self::get_current_time();
        let mut block = Self {
            transactions,
            hash: String::new(),
            previous_hash,
            timestamp,
            nonce: 0,
        };
        block.hash = block.calculate_hash();
        block
    }

    #[cfg(target_arch = "wasm32")]
    fn get_current_time() -> i64 {
        ic_cdk::api::time() as i64
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn get_current_time() -> i64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos() as i64)
            .unwrap_or_else(|_| {
                // Fallback to a fixed timestamp if system clock is before UNIX_EPOCH
                // This is extremely unlikely but provides safety
                ic_cdk::api::time() as i64
            })
    }

    pub fn calculate_hash(&self) -> String {
        // Use Blake3 for cryptographically secure block hashing
        let mut hasher = blake3::Hasher::new();
        
        // Hash block metadata
        hasher.update(self.previous_hash.as_bytes());
        hasher.update(&self.timestamp.to_le_bytes());
        hasher.update(&self.nonce.to_le_bytes());

        // Hash all transactions deterministically
        for tx in &self.transactions {
            hasher.update(tx.sender.as_bytes());
            hasher.update(tx.recipient.as_bytes());
            hasher.update(&tx.amount.to_le_bytes());
            hasher.update(&tx.time_stamp.to_le_bytes());
            
            // Include transaction signature if present
            if let Some(ref sig) = tx.signature {
                hasher.update(sig.as_bytes());
            }
        }

        hex::encode(hasher.finalize().as_bytes())
    }
}

// Multi-chain types

#[derive(CandidType, Deserialize, Debug, Clone, PartialEq, Eq, Hash)]
pub enum SupportedChain {
    Bitcoin,
    Ethereum,
    ICP,
    Solana,
}

impl SupportedChain {
    pub fn format_amount(&self, amount: f64) -> String {
        match self {
            SupportedChain::Bitcoin => format!("{:.8} BTC", amount / 100_000_000.0), // satoshi to BTC
            SupportedChain::Ethereum => format!("{:.18} ETH", amount / 1e18), // wei to ETH
            SupportedChain::ICP => format!("{:.8} ICP", amount / 100_000_000.0), // e8s to ICP
            SupportedChain::Solana => format!("{:.9} SOL", amount / 1e9), // lamports to SOL
        }
    }
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct MultiChainBalance {
    pub chain: SupportedChain,
    pub native_balance: f64,
    pub wrapped_balance: f64,
    pub total_balance: f64,
}

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct MultiChainTransaction {
    pub chain: SupportedChain,
    pub sender: String,
    pub recipient: String,
    pub amount: f64,
    pub timestamp: i64,
    pub signature: Option<String>,
    pub tx_hash: Option<String>,
}

impl MultiChainTransaction {
    pub fn new(chain: SupportedChain, sender: String, recipient: String, amount: f64) -> Self {
        Self {
            chain,
            sender,
            recipient,
            amount,
            timestamp: Self::get_current_time(),
            signature: None,
            tx_hash: None,
        }
    }

    #[cfg(target_arch = "wasm32")]
    fn get_current_time() -> i64 {
        ic_cdk::api::time() as i64
    }

    #[cfg(not(target_arch = "wasm32"))]
    fn get_current_time() -> i64 {
        use std::time::{SystemTime, UNIX_EPOCH};
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map(|duration| duration.as_nanos() as i64)
            .unwrap_or_else(|_| {
                // Fallback to a fixed timestamp if system clock is before UNIX_EPOCH
                // This is extremely unlikely but provides safety
                ic_cdk::api::time() as i64
            })
    }

    pub fn sign(&mut self, signature: String) {
        self.signature = Some(signature);
    }

    pub fn set_hash(&mut self, hash: String) {
        self.tx_hash = Some(hash);
    }
}
