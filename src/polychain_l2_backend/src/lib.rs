use crypto::calculate_hash;
use ic_cdk::*;
mod types;
use types::{PolyBlock, PolyTransaction};
mod crypto;
mod cryptographybridge;
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
}
