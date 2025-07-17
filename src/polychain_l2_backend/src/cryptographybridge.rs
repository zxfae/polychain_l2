use crate::errors::CryptographyError;

pub trait CryptographyBridge {
    type PublicKey;
    type SecretKey;
    type SignedMessage;

    fn key_generator(&self) -> Result<(Self::PublicKey, Self::SecretKey), CryptographyError>;
    fn sign(&self, secret_key: &Self::SecretKey, message: &[u8])
        -> Result<Self::SignedMessage, CryptographyError>;
    fn verify(&self, public_key: &Self::PublicKey, message: &[u8], signature: &Self::SignedMessage) 
        -> Result<bool, CryptographyError>;
    fn public_key_to_bytes(&self, public_key: &Self::PublicKey) -> Vec<u8>;
}
