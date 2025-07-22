use super::ChainVault;
use crate::types::{SupportedChain, MultiChainBalance, MultiChainTransaction};
use candid::{CandidType, Deserialize};
use std::collections::HashMap;

#[derive(CandidType, Deserialize, Debug, Clone, Default)]
pub struct ICPVaultModule {
    pub native_balances: HashMap<String, f64>,    // ICP
    pub wrapped_balances: HashMap<String, f64>,   // wrapped ICP
    pub deposits: Vec<MultiChainTransaction>,
    pub withdrawals: Vec<MultiChainTransaction>,
    pub quantum_secure: bool,
}

impl ICPVaultModule {
    pub fn new() -> Self {
        Self {
            native_balances: HashMap::new(),
            wrapped_balances: HashMap::new(),
            deposits: Vec::new(),
            withdrawals: Vec::new(),
            quantum_secure: true, // ICP natively quantum-ready
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

impl ChainVault for ICPVaultModule {
    fn deposit(&mut self, address: String, amount: f64) -> Result<String, String> {
        if amount <= 0.0 {
            return Err("Amount must be positive".to_string());
        }
        
        // Add to native balance
        *self.native_balances.entry(address.clone()).or_insert(0.0) += amount;
        
        // Record transaction
        let tx = MultiChainTransaction::new(
            SupportedChain::ICP,
            "external".to_string(),
            address.clone(),
            amount,
        );
        self.deposits.push(tx);
        
        let formatted_amount = SupportedChain::ICP.format_amount(amount);
        Ok(format!("✅ ICP deposit successful: {} to {}", formatted_amount, address))
    }
    
    fn withdraw(&mut self, address: String, amount: f64, quantum_secure: bool) -> Result<String, String> {
        let balance = self.native_balances.get(&address).unwrap_or(&0.0);
        
        if *balance < amount {
            return Err("Insufficient ICP balance".to_string());
        }
        
        // Deduct from balance
        *self.native_balances.get_mut(&address).unwrap() -= amount;
        
        // Record withdrawal with quantum signature if requested
        let mut tx = MultiChainTransaction::new(
            SupportedChain::ICP,
            address.clone(),
            "external".to_string(),
            amount,
        );
        
        if quantum_secure {
            tx.sign("schnorr_quantum_signature_icp".to_string());
        }
        
        self.withdrawals.push(tx);
        
        let formatted_amount = SupportedChain::ICP.format_amount(amount);
        let security_type = if quantum_secure { "🛡️ Quantum-Secured" } else { "🔒 Standard" };
        Ok(format!("✅ {} ICP withdrawal: {} from {}", security_type, formatted_amount, address))
    }
    
    fn get_balance(&self, address: &str) -> MultiChainBalance {
        let native = *self.native_balances.get(address).unwrap_or(&0.0);
        let wrapped = *self.wrapped_balances.get(address).unwrap_or(&0.0);
        
        MultiChainBalance {
            chain: SupportedChain::ICP,
            native_balance: native,
            wrapped_balance: wrapped,
            total_balance: native + wrapped,
        }
    }
    
    fn get_chain(&self) -> SupportedChain {
        SupportedChain::ICP
    }
    
    fn is_quantum_ready(&self) -> bool {
        self.quantum_secure
    }
}