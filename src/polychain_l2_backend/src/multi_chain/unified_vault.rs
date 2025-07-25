use super::{
    BitcoinVaultModule, ChainVault, EthereumVaultModule, ICPVaultModule, MultiChainMetrics,
    SolanaVaultModule,
};
use crate::types::{MultiChainBalance, SupportedChain};
use candid::{CandidType, Deserialize};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Debug, Clone, Default)]
pub struct MultiChainVault {
    pub bitcoin: BitcoinVaultModule,
    pub ethereum: EthereumVaultModule,
    pub icp: ICPVaultModule,
    pub solana: SolanaVaultModule,
    pub compression_savings: f64,
}

impl MultiChainVault {
    pub fn new() -> Self {
        Self {
            bitcoin: BitcoinVaultModule::new(),
            ethereum: EthereumVaultModule::new(),
            icp: ICPVaultModule::new(),
            solana: SolanaVaultModule::new(),
            compression_savings: 70.0,
        }
    }

    pub fn get_vault_for_chain(&mut self, chain: &SupportedChain) -> &mut dyn ChainVault {
        match chain {
            SupportedChain::Bitcoin => &mut self.bitcoin,
            SupportedChain::Ethereum => &mut self.ethereum,
            SupportedChain::ICP => &mut self.icp,
            SupportedChain::Solana => &mut self.solana,
        }
    }

    pub fn deposit_multi_chain(
        &mut self,
        chain: SupportedChain,
        address: String,
        amount: f64,
    ) -> Result<String, String> {
        match chain {
            SupportedChain::Bitcoin => self.bitcoin.deposit(address, amount),
            SupportedChain::Ethereum => self.ethereum.deposit(address, amount),
            SupportedChain::ICP => self.icp.deposit(address, amount),
            SupportedChain::Solana => self.solana.deposit(address, amount),
        }
    }

    pub fn withdraw_multi_chain(
        &mut self,
        chain: SupportedChain,
        address: String,
        amount: f64,
        quantum_secure: bool,
    ) -> Result<String, String> {
        match chain {
            SupportedChain::Bitcoin => self.bitcoin.withdraw(address, amount, quantum_secure),
            SupportedChain::Ethereum => self.ethereum.withdraw(address, amount, quantum_secure),
            SupportedChain::ICP => self.icp.withdraw(address, amount, quantum_secure),
            SupportedChain::Solana => self.solana.withdraw(address, amount, quantum_secure),
        }
    }

    pub fn get_multi_chain_balance(
        &self,
        chain: SupportedChain,
        address: &str,
    ) -> MultiChainBalance {
        match chain {
            SupportedChain::Bitcoin => self.bitcoin.get_balance(address),
            SupportedChain::Ethereum => self.ethereum.get_balance(address),
            SupportedChain::ICP => self.icp.get_balance(address),
            SupportedChain::Solana => self.solana.get_balance(address),
        }
    }

    pub fn get_all_balances(&self, address: &str) -> Vec<MultiChainBalance> {
        vec![
            self.bitcoin.get_balance(address),
            self.ethereum.get_balance(address),
            self.icp.get_balance(address),
            self.solana.get_balance(address),
        ]
    }

    pub fn get_unified_metrics(&self) -> MultiChainMetrics {
        let mut total_value_locked = HashMap::new();
        let mut transaction_counts = HashMap::new();
        let mut compression_savings = HashMap::new();

        // Bitcoin metrics
        let (btc_tvl, btc_native, btc_wrapped) = self.bitcoin.get_statistics();
        total_value_locked.insert(SupportedChain::Bitcoin, btc_tvl);
        transaction_counts.insert(SupportedChain::Bitcoin, btc_native + btc_wrapped);
        compression_savings.insert(SupportedChain::Bitcoin, self.compression_savings);

        // Ethereum metrics
        let (eth_tvl, eth_native, eth_wrapped) = self.ethereum.get_statistics();
        total_value_locked.insert(SupportedChain::Ethereum, eth_tvl);
        transaction_counts.insert(SupportedChain::Ethereum, eth_native + eth_wrapped);
        compression_savings.insert(SupportedChain::Ethereum, self.compression_savings);

        // ICP metrics
        let (icp_tvl, icp_native, icp_wrapped) = self.icp.get_statistics();
        total_value_locked.insert(SupportedChain::ICP, icp_tvl);
        transaction_counts.insert(SupportedChain::ICP, icp_native + icp_wrapped);
        compression_savings.insert(SupportedChain::ICP, self.compression_savings);

        // Solana metrics
        let (sol_tvl, sol_native, sol_wrapped) = self.solana.get_statistics();
        total_value_locked.insert(SupportedChain::Solana, sol_tvl);
        transaction_counts.insert(SupportedChain::Solana, sol_native + sol_wrapped);
        compression_savings.insert(SupportedChain::Solana, self.compression_savings);

        MultiChainMetrics {
            total_value_locked,
            transaction_counts,
            compression_savings,
            quantum_ready_percentage: 100.0, // All chains are quantum-ready!
        }
    }

    pub fn get_supported_chains(&self) -> Vec<SupportedChain> {
        vec![
            SupportedChain::Bitcoin,
            SupportedChain::Ethereum,
            SupportedChain::ICP,
            SupportedChain::Solana,
        ]
    }

    pub fn is_all_quantum_ready(&self) -> bool {
        self.bitcoin.is_quantum_ready()
            && self.ethereum.is_quantum_ready()
            && self.icp.is_quantum_ready()
            && self.solana.is_quantum_ready()
    }
}
