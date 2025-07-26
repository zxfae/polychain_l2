use candid::{CandidType, Deserialize};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct BitcoinVault {
    pub native_reserves: HashMap<String, u64>,
    pub wrapped_balances: HashMap<String, u64>,
    pub deposit_threshold: u64,
    pub total_deposits: u64,
    pub transaction_count: u64,
}

impl BitcoinVault {
    pub fn new() -> Self {
        Self {
            native_reserves: HashMap::new(),
            wrapped_balances: HashMap::new(),
            deposit_threshold: 100_000,
            total_deposits: 0,
            transaction_count: 0,
        }
    }

    pub fn deposit_bitcoin(&mut self, address: String, amount: u64) -> String {
        self.total_deposits += amount;
        self.transaction_count += 1;

        if amount >= self.deposit_threshold {
            // Gros montant = Bitcoin natif (sécurité max)
            *self.native_reserves.entry(address.clone()).or_insert(0) += amount;
            format!("Deposited {amount} satoshi as NATIVE Bitcoin for {address}",)
        } else {
            // Micro-montant = Wrapped optimisé (performance max)
            *self.wrapped_balances.entry(address.clone()).or_insert(0) += amount;
            format!("Deposited {amount} satoshi as WRAPPED Bitcoin for {address}",)
        }
    }

    pub fn get_balance(&self, address: &str) -> (u64, u64) {
        let native = self.native_reserves.get(address).copied().unwrap_or(0);
        let wrapped = self.wrapped_balances.get(address).copied().unwrap_or(0);
        (native, wrapped)
    }

    pub fn withdraw_bitcoin(&mut self, address: String, amount: u64, _crypto_algo: &str) -> String {
        // Generate cryptographically secure transaction ID using Blake3
        let tx_data = format!("{}:{}:{}", address, amount, self.transaction_count);
        let tx_id = blake3::hash(tx_data.as_bytes());
        self.transaction_count += 1;

        hex::encode(tx_id.as_bytes())
    }
}
