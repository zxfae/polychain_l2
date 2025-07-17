use crypto::calculate_hash;
use ic_cdk::*;
mod types;
use types::{PolyBlock, PolyTransaction};
mod crypto;
pub mod cryptography;
mod errors;

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

        // Simulate signing blockchain data with different cryptographic schemes
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
