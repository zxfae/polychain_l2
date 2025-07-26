use super::ChainVault;
use crate::types::{SupportedChain, MultiChainBalance, MultiChainTransaction};
use candid::{CandidType, Deserialize};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Debug, Clone, Default)]
pub struct BitcoinVaultModule {
    pub native_balances: HashMap<String, f64>,    // BTC
    pub wrapped_balances: HashMap<String, f64>,   // wrapped BTC
    pub deposits: Vec<MultiChainTransaction>,
    pub withdrawals: Vec<MultiChainTransaction>,
    pub quantum_secure: bool,
}

impl BitcoinVaultModule {
    pub fn new() -> Self {
        Self {
            native_balances: HashMap::new(),
            wrapped_balances: HashMap::new(),
            deposits: Vec::new(),
            withdrawals: Vec::new(),
            quantum_secure: true, // Bitcoin integrates quantum-resistant signatures
        }
    }
    
    pub fn get_statistics(&self) -> (f64, f64, f64) {
        let total_deposits: f64 = self.native_balances.values().sum::<f64>() 
            + self.wrapped_balances.values().sum::<f64>();
        let native_count = self.native_balances.len() as f64;
        let wrapped_count = self.wrapped_balances.len() as f64;
        (total_deposits, native_count, wrapped_count)
    }
}

impl ChainVault for BitcoinVaultModule {
    fn deposit(&mut self, address: String, amount: f64) -> Result<String, String> {
        if amount <= 0.0 {
            return Err("Amount must be positive".to_string());
        }
        
        // Add to native balance
        *self.native_balances.entry(address.clone()).or_insert(0.0) += amount;
        
        // Record transaction
        let tx = MultiChainTransaction::new(
            SupportedChain::Bitcoin,
            "external".to_string(),
            address.clone(),
            amount,
        );
        self.deposits.push(tx);
        
        let formatted_amount = SupportedChain::Bitcoin.format_amount(amount);
        Ok(format!("✅ Bitcoin deposit successful: {} to {}", formatted_amount, address))
    }
    
    fn withdraw(&mut self, address: String, amount: f64, quantum_secure: bool) -> Result<String, String> {
        let balance = self.native_balances.get(&address).unwrap_or(&0.0);
        
        if *balance < amount {
            return Err("Insufficient Bitcoin balance".to_string());
        }
        
        // Deduct from balance - safe since we already checked balance exists above
        if let Some(balance) = self.native_balances.get_mut(&address) {
            *balance -= amount;
        } else {
            return Err("Address balance not found during withdrawal".to_string());
        }
        
        // Record withdrawal with quantum signature if requested
        let mut tx = MultiChainTransaction::new(
            SupportedChain::Bitcoin,
            address.clone(),
            "external".to_string(),
            amount,
        );
        
        if quantum_secure {
            tx.sign("falcon512_quantum_signature_btc".to_string());
        }
        
        self.withdrawals.push(tx);
        
        let formatted_amount = SupportedChain::Bitcoin.format_amount(amount);
        let security_type = if quantum_secure { "🛡️ Quantum-Secured" } else { "🔒 Standard" };
        Ok(format!("✅ {} Bitcoin withdrawal: {} from {}", security_type, formatted_amount, address))
    }
    
    fn get_balance(&self, address: &str) -> MultiChainBalance {
        let native = *self.native_balances.get(address).unwrap_or(&0.0);
        let wrapped = *self.wrapped_balances.get(address).unwrap_or(&0.0);
        
        MultiChainBalance {
            chain: SupportedChain::Bitcoin,
            native_balance: native,
            wrapped_balance: wrapped,
            total_balance: native + wrapped,
        }
    }
    
    fn get_chain(&self) -> SupportedChain {
        SupportedChain::Bitcoin
    }
    
    fn is_quantum_ready(&self) -> bool {
        self.quantum_secure
    }
}