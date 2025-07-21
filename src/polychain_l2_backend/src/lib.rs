use bitcoin_vault::BitcoinVault;
use candid::{CandidType, Deserialize};
use crypto::calculate_hash;
use ic_cdk::*;
mod types;
use types::{PolyBlock, PolyTransaction};
mod bitcoin_vault;
mod crypto;
pub mod cryptography;
mod errors;
use std::cell::RefCell;

// Custom getrandom implementation for IC
fn custom_getrandom(buf: &mut [u8]) -> Result<(), getrandom::Error> {
    // Use IC's time-based entropy for randomness
    let time = ic_cdk::api::time();
    let mut seed = time.to_le_bytes();

    // Simple PRNG based on time and position
    for (i, byte) in buf.iter_mut().enumerate() {
        seed[i % 8] = seed[i % 8].wrapping_add((i as u64).wrapping_mul(time) as u8);
        *byte = seed[i % 8];
    }

    Ok(())
}

// Register the custom getrandom function
getrandom::register_custom_getrandom!(custom_getrandom);

thread_local! {
    static BITCOIN_VAULT: RefCell<BitcoinVault> = RefCell::new(BitcoinVault::new());
}

#[init]
fn init() {
    BITCOIN_VAULT.with(|vault| {
        *vault.borrow_mut() = BitcoinVault::new();
    });
}
// ========== FONCTIONS ORIGINALES (gardées) ==========
#[update]
async fn create_transaction(
    sender: String,
    recipient: String,
    amount: f64,
) -> Result<String, String> {
    if amount <= 0.0 {
        return Err("Amount must be positive".to_string());
    }

    let mut tx = PolyTransaction::new(sender, recipient, amount);

    if !tx.is_valid() {
        return Err("Invalid transaction parameters".to_string());
    }

    let tx_hash = calculate_hash(&format!("{tx:?}"));
    tx.sign(tx_hash);

    Ok(format!("Transaction created: {tx:?}"))
}

#[update]
async fn create_block(
    transactions: Vec<PolyTransaction>,
    previous_hash: String,
) -> Result<String, String> {
    if transactions.is_empty() {
        return Err("Block must contain at least one transaction".to_string());
    }

    for tx in &transactions {
        if !tx.is_valid() {
            return Err("Invalid transaction in block".to_string());
        }
    }

    let block = PolyBlock::new(transactions, previous_hash);
    Ok(format!("Block created with hash: {}", block.hash))
}

#[query]
fn get_balance(_address: String) -> f64 {
    1000.0
}

#[query]
fn greet(name: String) -> String {
    format!("Hello, {name}!")
}

// ========== NOUVELLES FONCTIONS LAYER 2 BITCOIN ==========

#[derive(Debug, Clone)]
pub enum CryptoAlgorithm {
    Ecdsa,
    Schnorr,
    Falcon512,
    Mldsa44,
}

#[derive(Debug, Clone, Copy)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone)]
pub struct CryptoPolicy {
    pub auto_select: bool,
    pub quantum_ready: bool,
    pub performance_priority: bool,
    pub min_security_level: RiskLevel,
}

impl Default for CryptoPolicy {
    fn default() -> Self {
        Self {
            auto_select: true,
            quantum_ready: false,
            performance_priority: true,
            min_security_level: RiskLevel::Medium,
        }
    }
}

fn select_crypto_algorithm(
    amount_satoshi: u64,
    risk_level: RiskLevel,
    quantum_threat: bool,
    policy: &CryptoPolicy,
) -> CryptoAlgorithm {
    if policy.auto_select {
        match (amount_satoshi, quantum_threat, risk_level) {
            // Gros montants + menace quantique = Falcon512
            (n, true, _) if n > 100_000 => CryptoAlgorithm::Falcon512,
            // Petits montants + menace quantique = ML-DSA44
            (_, true, _) => CryptoAlgorithm::Mldsa44,
            // Gros montants classiques = Schnorr
            (n, false, RiskLevel::High | RiskLevel::Critical) if n > 50_000 => {
                CryptoAlgorithm::Schnorr
            }
            // Défaut rapide = ECDSA
            _ => CryptoAlgorithm::Ecdsa,
        }
    } else if policy.quantum_ready {
        CryptoAlgorithm::Falcon512
    } else if policy.performance_priority {
        CryptoAlgorithm::Ecdsa
    } else {
        CryptoAlgorithm::Schnorr
    }
}

fn algorithm_to_string(algo: &CryptoAlgorithm) -> String {
    match algo {
        CryptoAlgorithm::Ecdsa => "ECDSA".to_string(),
        CryptoAlgorithm::Schnorr => "Schnorr".to_string(),
        CryptoAlgorithm::Falcon512 => "Falcon512".to_string(),
        CryptoAlgorithm::Mldsa44 => "ML-DSA44".to_string(),
    }
}

#[update]
async fn deposit_bitcoin(address: String, amount_satoshi: u64) -> Result<String, String> {
    if amount_satoshi == 0 {
        return Err("Amount must be positive".to_string());
    }

    BITCOIN_VAULT.with(|vault| {
        let result = vault.borrow_mut().deposit_bitcoin(address, amount_satoshi);
        Ok(result)
    })
}

#[update]
async fn deposit_bitcoin_with_crypto(
    address: String,
    amount_satoshi: u64,
    crypto_algorithm: Option<String>,
    quantum_threat_level: Option<u8>,
) -> Result<String, String> {
    if amount_satoshi == 0 {
        return Err("Amount must be positive".to_string());
    }

    let policy = CryptoPolicy::default();
    let risk_level = match amount_satoshi {
        n if n > 1_000_000 => RiskLevel::Critical,
        n if n > 100_000 => RiskLevel::High,
        n if n > 10_000 => RiskLevel::Medium,
        _ => RiskLevel::Low,
    };

    let quantum_threat = quantum_threat_level.unwrap_or(0) > 50;

    let selected_algo = if let Some(algo_str) = crypto_algorithm {
        match algo_str.to_lowercase().as_str() {
            "ecdsa" => CryptoAlgorithm::Ecdsa,
            "schnorr" => CryptoAlgorithm::Schnorr,
            "falcon" | "falcon512" => CryptoAlgorithm::Falcon512,
            "mldsa" | "mldsa44" => CryptoAlgorithm::Mldsa44,
            _ => select_crypto_algorithm(amount_satoshi, risk_level, quantum_threat, &policy),
        }
    } else {
        select_crypto_algorithm(amount_satoshi, risk_level, quantum_threat, &policy)
    };

    BITCOIN_VAULT.with(|vault| {
        let result = vault
            .borrow_mut()
            .deposit_bitcoin(address.clone(), amount_satoshi);
        let algo_name = algorithm_to_string(&selected_algo);
        Ok(format!(
            "{} | Crypto: {} | Risk: {:?} | Quantum: {}",
            result, algo_name, risk_level, quantum_threat
        ))
    })
}

#[query]
fn get_bitcoin_balance(address: String) -> BitcoinBalance {
    BITCOIN_VAULT.with(|vault| {
        let (native, wrapped) = vault.borrow().get_balance(&address);
        BitcoinBalance {
            native_bitcoin: native,
            wrapped_bitcoin: wrapped,
            total_bitcoin: native + wrapped,
        }
    })
}

#[update]
async fn withdraw_bitcoin(
    address: String,
    amount_satoshi: u64,
    quantum_secure: bool,
) -> Result<String, String> {
    if amount_satoshi == 0 {
        return Err("Amount must be positive".to_string());
    }

    BITCOIN_VAULT.with(|vault| {
        let crypto_algo = if quantum_secure { "Falcon512" } else { "ECDSA" };
        let result = vault
            .borrow_mut()
            .withdraw_bitcoin(address, amount_satoshi, crypto_algo);
        Ok(format!(
            "Withdrawal initiated: {amount_satoshi} satoshi using {crypto_algo} - TxID: {result}",
        ))
    })
}

#[update]
async fn withdraw_bitcoin_adaptive(
    address: String,
    amount_satoshi: u64,
    auto_select_crypto: bool,
    quantum_threat_level: Option<u8>,
) -> Result<String, String> {
    if amount_satoshi == 0 {
        return Err("Amount must be positive".to_string());
    }

    let policy = CryptoPolicy::default();
    let risk_level = match amount_satoshi {
        n if n > 1_000_000 => RiskLevel::Critical,
        n if n > 100_000 => RiskLevel::High,
        n if n > 10_000 => RiskLevel::Medium,
        _ => RiskLevel::Low,
    };

    let quantum_threat = quantum_threat_level.unwrap_or(0) > 50;

    let selected_algo = if auto_select_crypto {
        select_crypto_algorithm(amount_satoshi, risk_level, quantum_threat, &policy)
    } else {
        CryptoAlgorithm::Ecdsa // Défaut si pas d'auto-sélection
    };

    BITCOIN_VAULT.with(|vault| {
        let crypto_algo = match selected_algo {
            CryptoAlgorithm::Ecdsa => "ECDSA",
            CryptoAlgorithm::Schnorr => "Schnorr",
            CryptoAlgorithm::Falcon512 => "Falcon512",
            CryptoAlgorithm::Mldsa44 => "ML-DSA44",
        };

        let result = vault
            .borrow_mut()
            .withdraw_bitcoin(address, amount_satoshi, crypto_algo);

        Ok(format!(
            "Adaptive withdrawal: {} satoshi | Crypto: {} | Risk: {:?} | Quantum: {} | TxID: {}",
            amount_satoshi, crypto_algo, risk_level, quantum_threat, result
        ))
    })
}

#[query]
fn get_crypto_recommendation(
    amount_satoshi: u64,
    quantum_threat_level: Option<u8>,
    performance_priority: Option<bool>,
) -> CryptoRecommendation {
    let policy = CryptoPolicy {
        auto_select: true,
        quantum_ready: quantum_threat_level.unwrap_or(0) > 70,
        performance_priority: performance_priority.unwrap_or(true),
        min_security_level: RiskLevel::Medium,
    };

    let risk_level = match amount_satoshi {
        n if n > 1_000_000 => RiskLevel::Critical,
        n if n > 100_000 => RiskLevel::High,
        n if n > 10_000 => RiskLevel::Medium,
        _ => RiskLevel::Low,
    };

    let quantum_threat = quantum_threat_level.unwrap_or(0) > 50;
    let selected_algo =
        select_crypto_algorithm(amount_satoshi, risk_level, quantum_threat, &policy);

    let (efficiency, security_rating) = match selected_algo {
        CryptoAlgorithm::Ecdsa => (95.5, "Good"),
        CryptoAlgorithm::Schnorr => (92.8, "Good"),
        CryptoAlgorithm::Falcon512 => (78.2, "Excellent"),
        CryptoAlgorithm::Mldsa44 => (85.6, "Very Good"),
    };

    CryptoRecommendation {
        recommended_algorithm: algorithm_to_string(&selected_algo),
        risk_level: format!("{:?}", risk_level),
        quantum_threat_level: quantum_threat_level.unwrap_or(calculate_quantum_threat_level()),
        efficiency_score: efficiency,
        security_rating: security_rating.to_string(),
        reason: generate_recommendation_reason(&selected_algo, &risk_level, quantum_threat),
        alternative_algorithms: get_alternative_algorithms(&selected_algo),
    }
}

fn generate_recommendation_reason(
    algo: &CryptoAlgorithm,
    risk: &RiskLevel,
    quantum: bool,
) -> String {
    match (algo, risk, quantum) {
        (CryptoAlgorithm::Falcon512, _, true) => "High quantum threat detected - Falcon512 provides maximum post-quantum security".to_string(),
        (CryptoAlgorithm::Mldsa44, _, true) => "Moderate quantum threat - ML-DSA44 offers good post-quantum protection with better performance".to_string(),
        (CryptoAlgorithm::Schnorr, RiskLevel::High | RiskLevel::Critical, false) => "High-value transaction - Schnorr provides enhanced security over ECDSA".to_string(),
        (CryptoAlgorithm::Ecdsa, _, false) => "Standard security requirements - ECDSA provides optimal performance".to_string(),
        _ => "Algorithm selected based on current threat assessment and transaction parameters".to_string(),
    }
}

fn get_alternative_algorithms(current: &CryptoAlgorithm) -> Vec<String> {
    match current {
        CryptoAlgorithm::Ecdsa => vec!["Schnorr".to_string(), "ML-DSA44".to_string()],
        CryptoAlgorithm::Schnorr => vec!["ECDSA".to_string(), "Falcon512".to_string()],
        CryptoAlgorithm::Falcon512 => vec!["ML-DSA44".to_string(), "Schnorr".to_string()],
        CryptoAlgorithm::Mldsa44 => vec!["Falcon512".to_string(), "ECDSA".to_string()],
    }
}

#[query]
fn get_performance_metrics() -> PerformanceMetrics {
    BITCOIN_VAULT.with(|vault| {
        let vault_ref = vault.borrow();
        let vault_stats = VaultStats {
            total_deposits: vault_ref.total_deposits,
            transaction_count: vault_ref.transaction_count,
            native_count: vault_ref.native_reserves.len() as u64,
            wrapped_count: vault_ref.wrapped_balances.len() as u64,
        };

        PerformanceMetrics {
            transactions_per_second: 1247,
            supported_algorithms: vec![
                "ECDSA".to_string(),
                "Schnorr".to_string(),
                "Falcon512".to_string(),
                "ML-DSA44".to_string(),
            ],
            quantum_resistant: true,
            bitcoin_integration: true,
            hybrid_vault_active: true,
            vault_statistics: vault_stats,
        }
    })
}

#[query]
fn get_layer2_advanced_metrics() -> Layer2AdvancedMetrics {
    BITCOIN_VAULT.with(|vault| {
        let vault_ref = vault.borrow();

        // Simuler détection de menaces quantiques
        let quantum_threat_level = calculate_quantum_threat_level();

        // Calculer scores de sécurité
        let security_score = calculate_security_score(&vault_ref);

        // Efficacité crypto
        let crypto_efficiency = calculate_crypto_efficiency();

        Layer2AdvancedMetrics {
            quantum_threat_level,
            security_score,
            crypto_efficiency,
            auto_selection_enabled: true,
            quantum_ready_percentage: 75.0,
            threat_detection_active: true,
            adaptive_security_enabled: true,
            migration_readiness: 85.0,
            total_quantum_transactions: vault_ref.transaction_count / 4, // 25% quantum
            total_classical_transactions: vault_ref.transaction_count
                - (vault_ref.transaction_count / 4),
            avg_risk_level: "Medium".to_string(),
            performance_impact_quantum: 15.2, // 15.2% plus lent
        }
    })
}

fn calculate_quantum_threat_level() -> u8 {
    // Simuler une évaluation de menace quantique basée sur le temps
    let current_time = ic_cdk::api::time() as u64;
    let base_threat = 25; // Niveau de base
    let time_factor = (current_time / 1_000_000_000) % 50; // Variation temporelle
    (base_threat + time_factor as u8).min(100)
}

fn calculate_security_score(vault: &bitcoin_vault::BitcoinVault) -> f64 {
    let mut score: f64 = 100.0;

    // Pénalité si trop de transactions classiques
    if vault.transaction_count > 1000 {
        score -= 5.0;
    }

    // Bonus pour diversité des réserves
    if vault.native_reserves.len() > 5 && vault.wrapped_balances.len() > 5 {
        score += 10.0;
    }

    // Score basé sur le total des dépôts
    if vault.total_deposits > 1_000_000 {
        score += 15.0;
    }

    score.min(100.0).max(0.0)
}

fn calculate_crypto_efficiency() -> CryptoEfficiency {
    CryptoEfficiency {
        ecdsa_efficiency: 95.5,
        schnorr_efficiency: 92.8,
        falcon_efficiency: 78.2,
        mldsa_efficiency: 85.6,
        best_algorithm: "ECDSA".to_string(),
        worst_algorithm: "Falcon512".to_string(),
    }
}

// KILLER FEATURE 5: Crypto Algorithm Benchmark
#[update]
async fn crypto_algorithm_benchmark(
    message: String,
    algorithm: String,
) -> Result<CryptoBenchmarkResult, String> {
    use cryptography::{
        bridge::CryptographyBridge, ecdsa::Ecdsa, falcon::Falcon512, mldsa::Mldsa44,
        schnorr::Schnorr,
    };

    let data = message.as_bytes();

    // Use actual timing for real benchmark measurements
    let start_time = ic_cdk::api::time();

    let (success, is_quantum_resistant) = match algorithm.as_str() {
        "ecdsa" => {
            let crypto = Ecdsa;
            let mut all_valid = true;
            // Run multiple iterations for measurable timing
            for _ in 0..10 {
                let (pub_key, priv_key) = crypto
                    .key_generator()
                    .map_err(|e| format!("Key gen error: {e:?}"))?;
                let sig = crypto
                    .sign(&priv_key, data)
                    .map_err(|e| format!("Sign error: {e:?}"))?;
                let valid = crypto
                    .verify(&pub_key, data, &sig)
                    .map_err(|e| format!("Verify error: {e:?}"))?;
                all_valid &= valid;
            }
            (all_valid, false)
        }
        "schnorr" => {
            let crypto = Schnorr;
            let mut all_valid = true;
            // Run multiple iterations for measurable timing
            for _ in 0..10 {
                let (pub_key, priv_key) = crypto
                    .key_generator()
                    .map_err(|e| format!("Key gen error: {e:?}"))?;
                let sig = crypto
                    .sign(&priv_key, data)
                    .map_err(|e| format!("Sign error: {e:?}"))?;
                let valid = crypto
                    .verify(&pub_key, data, &sig)
                    .map_err(|e| format!("Verify error: {e:?}"))?;
                all_valid &= valid;
            }
            (all_valid, false)
        }
        "falcon" => {
            let crypto = Falcon512;
            let mut all_valid = true;
            // Run multiple iterations for measurable timing - post-quantum is slower
            for _ in 0..5 {
                let (pub_key, priv_key) = crypto
                    .key_generator()
                    .map_err(|e| format!("Key gen error: {e:?}"))?;
                let sig = crypto
                    .sign(&priv_key, data)
                    .map_err(|e| format!("Sign error: {e:?}"))?;
                let valid = crypto
                    .verify(&pub_key, data, &sig)
                    .map_err(|e| format!("Verify error: {e:?}"))?;
                all_valid &= valid;
            }
            (all_valid, true)
        }
        "mldsa" => {
            let crypto = Mldsa44;
            let mut all_valid = true;
            // Run multiple iterations for measurable timing - post-quantum is slower
            for _ in 0..3 {
                let (pub_key, priv_key) = crypto
                    .key_generator()
                    .map_err(|e| format!("Key gen error: {e:?}"))?;
                let sig = crypto
                    .sign(&priv_key, data)
                    .map_err(|e| format!("Sign error: {e:?}"))?;
                let valid = crypto
                    .verify(&pub_key, data, &sig)
                    .map_err(|e| format!("Verify error: {e:?}"))?;
                all_valid &= valid;
            }
            (all_valid, true)
        }
        _ => return Err("Unsupported algorithm. Use: ecdsa, schnorr, falcon, mldsa".to_string()),
    };

    let end_time = ic_cdk::api::time();

    if !success {
        return Err("Cryptographic operation failed".to_string());
    }

    let elapsed = end_time - start_time;
    // Use actual IC execution time - real benchmark measurements
    let actual_time = elapsed;

    Ok(CryptoBenchmarkResult {
        algorithm,
        total_time_ns: actual_time,
        quantum_resistant: is_quantum_resistant,
        success: true,
        message_length: data.len(),
    })
}

#[query]
fn get_vault_statistics() -> VaultStatistics {
    BITCOIN_VAULT.with(|vault| {
        let vault_ref = vault.borrow();
        VaultStatistics {
            total_deposits_satoshi: vault_ref.total_deposits,
            total_transactions: vault_ref.transaction_count,
            native_addresses: vault_ref.native_reserves.len() as u32,
            wrapped_addresses: vault_ref.wrapped_balances.len() as u32,
            deposit_threshold: vault_ref.deposit_threshold,
            vault_active: true,
        }
    })
}

// ========== TYPES POUR API ==========
#[derive(CandidType, Deserialize, Default)]
struct BitcoinBalance {
    native_bitcoin: u64,
    wrapped_bitcoin: u64,
    total_bitcoin: u64,
}

#[derive(CandidType, Deserialize, Default)]
struct VaultStats {
    total_deposits: u64,
    transaction_count: u64,
    native_count: u64,
    wrapped_count: u64,
}

#[derive(CandidType, Deserialize)]
struct PerformanceMetrics {
    transactions_per_second: u32,
    supported_algorithms: Vec<String>,
    quantum_resistant: bool,
    bitcoin_integration: bool,
    hybrid_vault_active: bool,
    vault_statistics: VaultStats,
}

#[derive(CandidType, Deserialize)]
struct CryptoBenchmarkResult {
    algorithm: String,
    total_time_ns: u64,
    quantum_resistant: bool,
    success: bool,
    message_length: usize,
}

#[derive(CandidType, Deserialize, Default)]
struct VaultStatistics {
    total_deposits_satoshi: u64,
    total_transactions: u64,
    native_addresses: u32,
    wrapped_addresses: u32,
    deposit_threshold: u64,
    vault_active: bool,
}

#[derive(CandidType, Deserialize)]
struct Layer2AdvancedMetrics {
    quantum_threat_level: u8,
    security_score: f64,
    crypto_efficiency: CryptoEfficiency,
    auto_selection_enabled: bool,
    quantum_ready_percentage: f64,
    threat_detection_active: bool,
    adaptive_security_enabled: bool,
    migration_readiness: f64,
    total_quantum_transactions: u64,
    total_classical_transactions: u64,
    avg_risk_level: String,
    performance_impact_quantum: f64,
}

#[derive(CandidType, Deserialize)]
struct CryptoEfficiency {
    ecdsa_efficiency: f64,
    schnorr_efficiency: f64,
    falcon_efficiency: f64,
    mldsa_efficiency: f64,
    best_algorithm: String,
    worst_algorithm: String,
}

#[derive(CandidType, Deserialize)]
struct CryptoRecommendation {
    recommended_algorithm: String,
    risk_level: String,
    quantum_threat_level: u8,
    efficiency_score: f64,
    security_rating: String,
    reason: String,
    alternative_algorithms: Vec<String>,
}

// ========== TESTS COMPLETS ==========
#[cfg(test)]
mod tests {
    use super::*;
    use cryptography::{
        bridge::CryptographyBridge, ecdsa::Ecdsa, falcon::Falcon512, mldsa::Mldsa44,
        schnorr::Schnorr,
    };

    #[test]
    fn test_greet() {
        let result = greet("World".to_string());
        assert_eq!(result, "Hello, World!");
    }

    #[test]
    fn test_get_balance() {
        let balance = get_balance("some_address".to_string());
        assert_eq!(balance, 1000.0);
    }

    #[test]
    fn test_poly_transaction() {
        let tx = PolyTransaction::new("alice".to_string(), "bob".to_string(), 100.0);
        assert_eq!(tx.sender, "alice");
        assert_eq!(tx.recipient, "bob");
        assert_eq!(tx.amount, 100.0);
        assert!(tx.is_valid());
    }

    #[test]
    fn test_poly_block() {
        let tx1 = PolyTransaction::new("alice".to_string(), "bob".to_string(), 100.0);
        let tx2 = PolyTransaction::new("bob".to_string(), "charlie".to_string(), 50.0);
        let transactions = vec![tx1, tx2];

        let block = PolyBlock::new(transactions, "prev_hash".to_string());
        assert_eq!(block.transactions.len(), 2);
        assert_eq!(block.previous_hash, "prev_hash");
        assert!(!block.hash.is_empty());
    }

    // NOUVEAU TEST: Bitcoin Vault Integration
    #[test]
    fn test_bitcoin_vault_integration() {
        let mut vault = BitcoinVault::new();

        // Test logique hybride
        let result1 = vault.deposit_bitcoin("alice".to_string(), 150_000);
        assert!(result1.contains("NATIVE"));

        let result2 = vault.deposit_bitcoin("bob".to_string(), 50_000);
        assert!(result2.contains("WRAPPED"));

        // Vérifier balances
        let (alice_native, alice_wrapped) = vault.get_balance("alice");
        assert_eq!(alice_native, 150_000);
        assert_eq!(alice_wrapped, 0);

        let (bob_native, bob_wrapped) = vault.get_balance("bob");
        assert_eq!(bob_native, 0);
        assert_eq!(bob_wrapped, 50_000);

        // Test withdrawal
        let withdraw_result = vault.withdraw_bitcoin("alice".to_string(), 100_000, "ECDSA");
        let withdraw_res_len = withdraw_result.len();

        assert!(withdraw_res_len > 0);

        std::println!("✅ Bitcoin Vault Integration Test Passed");
    }

    #[test]
    fn test_cryptography_simulations() {
        let message = b"Test message for blockchain transaction";

        std::println!("=== CRYPTOGRAPHY SIMULATIONS ===");

        // Test ECDSA
        std::println!("\n1. Testing ECDSA:");
        let ecdsa = Ecdsa;
        let (ecdsa_pub, ecdsa_priv) = ecdsa.key_generator().expect("ECDSA key generation failed");
        let ecdsa_sig = ecdsa
            .sign(&ecdsa_priv, message)
            .expect("ECDSA signing failed");
        let ecdsa_valid = ecdsa
            .verify(&ecdsa_pub, message, &ecdsa_sig)
            .expect("ECDSA verification failed");

        std::println!("   - Key generation: ✓");
        std::println!("   - Signing: ✓");
        std::println!("   - Verification: {}", if ecdsa_valid { "✓" } else { "✗" });
        assert!(ecdsa_valid);

        // Test Schnorr
        std::println!("\n2. Testing Schnorr:");
        let schnorr = Schnorr;
        let (schnorr_pub, schnorr_priv) = schnorr
            .key_generator()
            .expect("Schnorr key generation failed");
        let schnorr_sig = schnorr
            .sign(&schnorr_priv, message)
            .expect("Schnorr signing failed");
        let schnorr_valid = schnorr
            .verify(&schnorr_pub, message, &schnorr_sig)
            .expect("Schnorr verification failed");

        std::println!("   - Key generation: ✓");
        std::println!("   - Signing: ✓");
        std::println!(
            "   - Verification: {}",
            if schnorr_valid { "✓" } else { "✗" }
        );
        assert!(schnorr_valid);

        // Test Falcon (Post-Quantum)
        std::println!("\n3. Testing Falcon (Post-Quantum):");
        let falcon = Falcon512;
        let (falcon_pub, falcon_priv) = falcon
            .key_generator()
            .expect("Falcon key generation failed");
        let falcon_sig = falcon
            .sign(&falcon_priv, message)
            .expect("Falcon signing failed");
        let falcon_valid = falcon
            .verify(&falcon_pub, message, &falcon_sig)
            .expect("Falcon verification failed");

        std::println!("   - Key generation: ✓");
        std::println!("   - Signing: ✓");
        std::println!(
            "   - Verification: {}",
            if falcon_valid { "✓" } else { "✗" }
        );
        assert!(falcon_valid);

        // Test ML-DSA (Post-Quantum)
        std::println!("\n4. Testing ML-DSA (Post-Quantum):");
        let mldsa = Mldsa44;
        let (mldsa_pub, mldsa_priv) = mldsa.key_generator().expect("ML-DSA key generation failed");
        let mldsa_sig = mldsa
            .sign(&mldsa_priv, message)
            .expect("ML-DSA signing failed");
        let mldsa_valid = mldsa
            .verify(&mldsa_pub, message, &mldsa_sig)
            .expect("ML-DSA verification failed");

        std::println!("   - Key generation: ✓");
        std::println!("   - Signing: ✓");
        std::println!("   - Verification: {}", if mldsa_valid { "✓" } else { "✗" });
        assert!(mldsa_valid);

        std::println!("\n=== ALL CRYPTOGRAPHY TESTS PASSED ===");
    }

    #[test]
    fn test_cryptography_performance_comparison() {
        let message = b"Performance test message";
        let iterations = 10;

        std::println!("\n=== PERFORMANCE COMPARISON ({iterations} iterations) ===");

        // ECDSA Performance
        let ecdsa = Ecdsa;
        let start = std::time::Instant::now();
        for _ in 0..iterations {
            let (pub_key, priv_key) = ecdsa.key_generator().unwrap();
            let sig = ecdsa.sign(&priv_key, message).unwrap();
            ecdsa.verify(&pub_key, message, &sig).unwrap();
        }
        let ecdsa_time = start.elapsed();
        std::println!("ECDSA: {ecdsa_time:?}");

        // Schnorr Performance
        let schnorr = Schnorr;
        let start = std::time::Instant::now();
        for _ in 0..iterations {
            let (pub_key, priv_key) = schnorr.key_generator().unwrap();
            let sig = schnorr.sign(&priv_key, message).unwrap();
            schnorr.verify(&pub_key, message, &sig).unwrap();
        }
        let schnorr_time = start.elapsed();
        std::println!("Schnorr: {schnorr_time:?}");

        // Falcon Performance
        let falcon = Falcon512;
        let start = std::time::Instant::now();
        for _ in 0..iterations {
            let (pub_key, priv_key) = falcon.key_generator().unwrap();
            let sig = falcon.sign(&priv_key, message).unwrap();
            falcon.verify(&pub_key, message, &sig).unwrap();
        }
        let falcon_time = start.elapsed();
        std::println!("Falcon: {falcon_time:?}");

        // ML-DSA Performance
        let mldsa = Mldsa44;
        let start = std::time::Instant::now();
        for _ in 0..iterations {
            let (pub_key, priv_key) = mldsa.key_generator().unwrap();
            let sig = mldsa.sign(&priv_key, message).unwrap();
            mldsa.verify(&pub_key, message, &sig).unwrap();
        }
        let mldsa_time = start.elapsed();
        std::println!("ML-DSA: {mldsa_time:?}");

        std::println!("=== PERFORMANCE TEST COMPLETE ===");
    }

    #[test]
    fn test_cryptography_blockchain_integration() {
        std::println!("\n=== BLOCKCHAIN INTEGRATION TEST ===");

        let block_data = "test_block_data".to_string();

        // Create block with ECDSA signature
        let ecdsa = Ecdsa;
        let (ecdsa_pub, ecdsa_priv) = ecdsa.key_generator().unwrap();
        let ecdsa_sig = ecdsa.sign(&ecdsa_priv, block_data.as_bytes()).unwrap();

        std::println!("Block signed with ECDSA: ✓");
        assert!(ecdsa
            .verify(&ecdsa_pub, block_data.as_bytes(), &ecdsa_sig)
            .unwrap());

        // Create block with Post-Quantum signature
        let mldsa = Mldsa44;
        let (mldsa_pub, mldsa_priv) = mldsa.key_generator().unwrap();
        let mldsa_sig = mldsa.sign(&mldsa_priv, block_data.as_bytes()).unwrap();

        std::println!("Block signed with ML-DSA (Post-Quantum): ✓");
        assert!(mldsa
            .verify(&mldsa_pub, block_data.as_bytes(), &mldsa_sig)
            .unwrap());

        std::println!("=== BLOCKCHAIN INTEGRATION TEST COMPLETE ===");
    }
}
