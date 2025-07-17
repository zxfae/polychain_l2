use candid::{CandidType, Deserialize};
use ic_cdk::*;

#[derive(CandidType, Deserialize, Debug, Clone)]
pub struct PolyTransaction {
    pub sender: String,
    pub recipient: String,
    pub amount: f64,
    pub time_stamp: i64,
}

#[update]
async fn create_transaction(
    sender: String,
    recipient: String,
    amount: f64,
) -> Result<String, String> {
    let tx = PolyTransaction {
        sender: sender.clone(),
        recipient: recipient.clone(),
        amount,
        time_stamp: ic_cdk::api::time() as i64,
    };

    Ok(format!("Transaction created: {tx:?}"))
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
        let tx = PolyTransaction {
            sender: "alice".to_string(),
            recipient: "bob".to_string(),
            amount: 100.0,
            time_stamp: 1234567890,
        };
        assert_eq!(tx.sender, "alice");
        assert_eq!(tx.recipient, "bob");
        assert_eq!(tx.amount, 100.0);
    }
}
