/// Realistic data generator for hackathon demonstrations
/// Generates ICP-like transactions with realistic addresses, amounts, and patterns

use crate::types::PolyTransaction;
use ic_cdk::api::time;
use rand::{Rng, SeedableRng};
use rand_chacha::ChaCha8Rng;

pub struct RealisticDataGenerator {
    rng: ChaCha8Rng,
    real_icp_addresses: Vec<&'static str>,
    transaction_patterns: Vec<TransactionPattern>,
}

#[derive(Clone)]
pub struct TransactionPattern {
    pub name: &'static str,
    pub amount_range: (f64, f64),
    pub frequency_weight: u32,
    pub description: &'static str,
}

impl RealisticDataGenerator {
    pub fn new() -> Self {
        let seed = time() as u64;
        let rng = ChaCha8Rng::seed_from_u64(seed);
        
        Self {
            rng,
            real_icp_addresses: Self::get_real_icp_addresses(),
            transaction_patterns: Self::get_transaction_patterns(),
        }
    }

    /// Generate realistic ICP-style transactions
    pub fn generate_realistic_batch(&mut self, count: u64) -> Vec<PolyTransaction> {
        (0..count).map(|_| self.generate_realistic_transaction()).collect()
    }

    /// Generate a single realistic transaction
    pub fn generate_realistic_transaction(&mut self) -> PolyTransaction {
        let pattern = self.select_transaction_pattern().clone();
        let amount = self.generate_amount(&pattern);
        let (sender, recipient) = self.select_addresses();
        let timestamp = self.generate_realistic_timestamp();

        PolyTransaction {
            sender,
            recipient,
            amount,
            time_stamp: timestamp,
            signature: Some(self.generate_mock_signature()),
        }
    }

    /// Generate high-frequency trading simulation
    pub fn generate_hft_batch(&mut self, count: u64) -> Vec<PolyTransaction> {
        let base_time = time() / 1_000_000_000; // Convert to seconds
        (0..count).enumerate().map(|(i, _)| {
            let amount = self.rng.gen_range(0.001..50.0);
            let (sender, recipient) = self.select_trading_addresses();
            
            PolyTransaction {
                sender,
                recipient,
                amount,
                time_stamp: base_time + (i as u64 * 100), // 100ms intervals
                signature: Some(format!("hft_sig_{}", i)),
            }
        }).collect()
    }

    /// Generate DeFi-style transactions (larger amounts, specific patterns)
    pub fn generate_defi_batch(&mut self, count: u64) -> Vec<PolyTransaction> {
        (0..count).map(|_| {
            let amount = match self.rng.gen_range(0..100) {
                0..=30 => self.rng.gen_range(1000.0..10000.0), // Large transactions
                31..=60 => self.rng.gen_range(100.0..1000.0),   // Medium transactions  
                _ => self.rng.gen_range(10.0..100.0),           // Small transactions
            };
            
            let (sender, recipient) = self.select_addresses();
            
            PolyTransaction {
                sender,
                recipient,
                amount,
                time_stamp: self.generate_realistic_timestamp(),
                signature: Some(self.generate_defi_signature()),
            }
        }).collect()
    }

    fn select_transaction_pattern(&mut self) -> &TransactionPattern {
        let total_weight: u32 = self.transaction_patterns.iter().map(|p| p.frequency_weight).sum();
        let mut random = self.rng.gen_range(0..total_weight);
        
        for pattern in &self.transaction_patterns {
            if random < pattern.frequency_weight {
                return pattern;
            }
            random -= pattern.frequency_weight;
        }
        
        &self.transaction_patterns[0]
    }

    fn generate_amount(&mut self, pattern: &TransactionPattern) -> f64 {
        let (min, max) = pattern.amount_range;
        let amount = self.rng.gen_range(min..max);
        
        // Round to realistic precision
        (amount * 100.0).round() / 100.0
    }

    fn select_addresses(&mut self) -> (String, String) {
        let sender_idx = self.rng.gen_range(0..self.real_icp_addresses.len());
        let mut recipient_idx = self.rng.gen_range(0..self.real_icp_addresses.len());
        
        // Ensure sender != recipient
        while recipient_idx == sender_idx {
            recipient_idx = self.rng.gen_range(0..self.real_icp_addresses.len());
        }
        
        (
            self.real_icp_addresses[sender_idx].to_string(),
            self.real_icp_addresses[recipient_idx].to_string(),
        )
    }

    fn select_trading_addresses(&mut self) -> (String, String) {
        // High-frequency trading uses a smaller set of addresses
        let trading_addresses = &self.real_icp_addresses[0..8]; // First 8 addresses
        let sender_idx = self.rng.gen_range(0..trading_addresses.len());
        let mut recipient_idx = self.rng.gen_range(0..trading_addresses.len());
        
        while recipient_idx == sender_idx {
            recipient_idx = self.rng.gen_range(0..trading_addresses.len());
        }
        
        (
            trading_addresses[sender_idx].to_string(),
            trading_addresses[recipient_idx].to_string(),
        )
    }

    fn generate_realistic_timestamp(&mut self) -> u64 {
        let now = time() / 1_000_000_000; // Convert to seconds
        let variation = self.rng.gen_range(0..=300); // Up to 5 minutes ago
        now.saturating_sub(variation)
    }

    fn generate_mock_signature(&mut self) -> String {
        // Generate realistic-looking signatures
        let signature_types = vec!["ecdsa", "schnorr", "falcon", "ml_dsa"];
        let sig_type = signature_types[self.rng.gen_range(0..signature_types.len())];
        let random_hex: String = (0..64).map(|_| {
            format!("{:x}", self.rng.gen_range(0..16))
        }).collect();
        
        format!("{}_{}", sig_type, random_hex)
    }

    fn generate_defi_signature(&mut self) -> String {
        // DeFi signatures tend to be more complex
        let random_hex: String = (0..128).map(|_| {
            format!("{:x}", self.rng.gen_range(0..16))
        }).collect();
        
        format!("defi_multisig_{}", random_hex)
    }

    /// Real ICP mainnet addresses (anonymized but realistic format)
    fn get_real_icp_addresses() -> Vec<&'static str> {
        vec![
            "rrkah-fqaaa-aaaah-qcuaq-cai",
            "rdmx6-jaaaa-aaaah-qcuya-cai", 
            "renrk-eyaaa-aaaah-qcoma-cai",
            "rh2pm-ryaaa-aaaah-qcuqa-cai",
            "rkp4c-7iaaa-aaaah-qcuwa-cai",
            "rno2w-sqaaa-aaaah-qcuwa-cai",
            "ryjl3-tyaaa-aaaah-qcuma-cai",
            "rbtfr-riaaa-aaaah-qcuya-cai",
            "rdccc-6qaaa-aaaah-qcuya-cai",
            "rmtqs-3aaaa-aaaah-qcuma-cai",
            "rz4gf-iqaaa-aaaah-qcvaa-cai",
            "r7fwx-giaaa-aaaah-qcuya-cai",
            "rxu7c-tiaaa-aaaah-qcuya-cai",
            "rew42-tyaaa-aaaah-qcuwa-cai",
            "r4cbd-wiaaa-aaaah-qcuma-cai",
            "rn4kk-yqaaa-aaaah-qcuya-cai",
            "rvhrd-yaaaa-aaaah-qcuma-cai",
            "rbtnu-iyaaa-aaaah-qcuma-cai",
            "rlfz3-jqaaa-aaaah-qcuma-cai",
            "rwzgl-biaaa-aaaah-qcuma-cai",
        ]
    }

    /// Realistic transaction patterns found in blockchain data
    fn get_transaction_patterns() -> Vec<TransactionPattern> {
        vec![
            TransactionPattern {
                name: "Micro Payments",
                amount_range: (0.001, 1.0),
                frequency_weight: 40,
                description: "Small everyday transactions",
            },
            TransactionPattern {
                name: "Regular Transfers",
                amount_range: (1.0, 100.0),
                frequency_weight: 35,
                description: "Common P2P transfers",
            },
            TransactionPattern {
                name: "Business Payments",
                amount_range: (100.0, 1000.0),
                frequency_weight: 15,
                description: "Merchant and business transactions",
            },
            TransactionPattern {
                name: "Large Transfers",
                amount_range: (1000.0, 50000.0),
                frequency_weight: 8,
                description: "High-value transfers",
            },
            TransactionPattern {
                name: "Institutional",
                amount_range: (50000.0, 1000000.0),
                frequency_weight: 2,
                description: "Institutional and exchange movements",
            },
        ]
    }
}

/// Simulate network conditions for realistic testing
pub struct NetworkSimulator {
    latency_ms: u64,
    packet_loss: f64,
    throughput_mbps: f64,
}

impl NetworkSimulator {
    pub fn new_mainnet_conditions() -> Self {
        Self {
            latency_ms: 150,      // Realistic ICP mainnet latency
            packet_loss: 0.001,   // Very low packet loss
            throughput_mbps: 100.0, // High throughput
        }
    }

    pub fn new_stressed_conditions() -> Self {
        Self {
            latency_ms: 800,      // High latency
            packet_loss: 0.01,    // 1% packet loss
            throughput_mbps: 10.0, // Limited throughput
        }
    }

    pub async fn simulate_network_delay(&self) {
        // In a real implementation, this would add actual delays
        // For demo purposes, we just track the metrics
    }

    pub fn get_performance_impact(&self) -> f64 {
        // Calculate performance impact based on network conditions
        let latency_impact = (self.latency_ms as f64 / 100.0).min(3.0);
        let loss_impact = self.packet_loss * 100.0;
        let throughput_impact = (100.0 / self.throughput_mbps).min(5.0);
        
        1.0 + (latency_impact + loss_impact + throughput_impact) / 10.0
    }
}