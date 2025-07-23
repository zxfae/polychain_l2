// POLYCHAIN L2 UNIVERSAL MULTI-CHAIN MODULE
// Supports Bitcoin, Ethereum, ICP, and Solana

pub mod bitcoin_vault;
pub mod ethereum_vault;
pub mod icp_vault;
pub mod solana_vault;
pub mod unified_vault;

pub use bitcoin_vault::BitcoinVaultModule;
pub use ethereum_vault::EthereumVaultModule;
pub use icp_vault::ICPVaultModule;
pub use solana_vault::SolanaVaultModule;
pub use unified_vault::MultiChainVault;

use crate::types::{SupportedChain, MultiChainBalance};
use candid::{CandidType, Deserialize};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct MultiChainMetrics {
    pub total_value_locked: HashMap<SupportedChain, f64>,
    pub transaction_counts: HashMap<SupportedChain, f64>,
    pub compression_savings: HashMap<SupportedChain, f64>,
    pub quantum_ready_percentage: f64,
}

pub trait ChainVault {
    fn deposit(&mut self, address: String, amount: f64) -> Result<String, String>;
    fn withdraw(&mut self, address: String, amount: f64, quantum_secure: bool) -> Result<String, String>;
    fn get_balance(&self, address: &str) -> MultiChainBalance;
    fn get_chain(&self) -> SupportedChain;
    fn is_quantum_ready(&self) -> bool;
}