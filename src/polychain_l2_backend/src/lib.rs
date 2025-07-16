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
fn get_balance(address: String) -> f64 {
    1000.0
}
