use candid::{CandidType, Deserialize};

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PolyTransaction {
    pub sender: String,
    pub recipient: String,
    pub amount: f64,
    pub time_stamp: i64,
    pub signature: Option<String>,
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
            .unwrap()
            .as_nanos() as i64
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
            .unwrap()
            .as_nanos() as i64
    }

    pub fn calculate_hash(&self) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        self.previous_hash.hash(&mut hasher);
        self.timestamp.hash(&mut hasher);
        self.nonce.hash(&mut hasher);

        for tx in &self.transactions {
            tx.sender.hash(&mut hasher);
            tx.recipient.hash(&mut hasher);
            tx.amount.to_bits().hash(&mut hasher);
            tx.time_stamp.hash(&mut hasher);
        }

        format!("{:x}", hasher.finish())
    }
}
