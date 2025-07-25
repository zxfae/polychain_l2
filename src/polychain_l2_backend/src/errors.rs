#[derive(thiserror::Error, Debug)]
pub enum CryptographyError {
    #[error("Failed to generate keys")]
    FailedToGenerateKey(),
    #[error("Failed to sign transaction: {0}")]
    FailedToSignTx(String),
    #[error("Key generation failed")]
    KeyGeneration,
    #[error("Signing error")]
    SigningError,
}
