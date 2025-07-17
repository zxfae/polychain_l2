use k256::{
    ecdsa::{
        signature::{Signer, Verifier},
        Signature, SigningKey, VerifyingKey,
    },
    elliptic_curve::rand_core::OsRng,
};

use super::bridge::CryptographyBridge;

/// ECDSA signature scheme
/// # Security
/// - This crate has been audited by NCC Group
/// - See : https://crates.io/crates/k256
///
/// # Features
/// - Key generation using secure OS randomness
/// - Signing and verification of messages
/// - VRF generation and verification using blake3 hashing

#[derive(Debug, Clone)]
pub struct Ecdsa;

impl CryptographyBridge for Ecdsa {
    type PublicKey = VerifyingKey;
    type SecretKey = SigningKey;
    type SignedMessage = Signature;

    fn key_generator(
        &self,
    ) -> Result<(Self::PublicKey, Self::SecretKey), crate::errors::CryptographyError> {
        let secret_key = SigningKey::random(&mut OsRng);
        let public_key = secret_key.verifying_key();
        Ok((*public_key, secret_key))
    }

    fn sign(
        &self,
        secret_key: &Self::SecretKey,
        message: &[u8],
    ) -> Result<Self::SignedMessage, crate::errors::CryptographyError> {
        Ok(secret_key.sign(message))
    }

    fn verify(
        &self,
        public_key: &Self::PublicKey,
        message: &[u8],
        signature: &Self::SignedMessage,
    ) -> Result<bool, crate::errors::CryptographyError> {
        Ok(public_key.verify(message, signature).is_ok())
    }

    fn public_key_to_bytes(&self, public_key: &Self::PublicKey) -> Vec<u8> {
        public_key.to_encoded_point(true).to_bytes().to_vec()
    }
}

#[cfg(test)]
mod tests {

    use crate::cryptography::{bridge::CryptographyBridge, ecdsa::Ecdsa};
    use log::{debug, info};
    fn start_log() {
        let _ = env_logger::builder().is_test(true).try_init();
    }

    #[test]
    fn ecdsakey_generator() {
        start_log();
        info!("Testing key generator for ecdsa");
        let cryptography = Ecdsa;

        let generation = cryptography.key_generator();
        assert!(generation.is_ok(), "Failed to generate ecdsa keypair");

        let (public_key, secret_key) = generation.unwrap();
        debug!("Private key : {secret_key:?}");
        assert_eq!(
            secret_key.to_bytes().len(),
            32,
            "ECDSA secret key size mismatch"
        );

        debug!(
            "Public key len {:?}",
            public_key.to_encoded_point(true).len()
        );
        debug!(
            "Public key len {:?}",
            public_key.to_encoded_point(false).len()
        );
        assert_eq!(
            public_key.to_encoded_point(true).len(),
            33,
            "ECDSA public key (compressed) size mismatch"
        );
        assert_eq!(
            public_key.to_encoded_point(false).len(),
            65,
            "ECDSA public key (uncompressed) size mismatch"
        );
    }

    #[test]
    fn ecdsa_sign_verify() {
        start_log();
        info!("Testing sign and verify for ecdsa");
        let cryptograhy = Ecdsa;
        let generation = cryptograhy.key_generator();

        let (public_key, secret_key) = generation.unwrap();
        let message = b"Testing message to sign";

        match cryptograhy.sign(&secret_key, message) {
            Ok(signature) => {
                let signature_bytes = signature.to_bytes();
                debug!("Signature bytes : {:?}", signature_bytes.len());
                assert_eq!(signature_bytes.len(), 64);

                match cryptograhy.verify(&public_key, message, &signature) {
                    Ok(is_valid) => {
                        assert!(is_valid, "Signature verification failed");
                        debug!("Validity :  {is_valid}");
                        info!("Signature verification successfull");
                    }
                    Err(e) => {
                        panic!("Verification error: {e}");
                    }
                }
            }
            Err(e) => {
                panic!("Failed to sign message {e}")
            }
        }
    }

    #[test]
    fn ecdsa_reject_invalid_signature() {
        start_log();
        info!("Testing rejection of invalid signatures for ecdsa");

        let cryptography = Ecdsa;

        let (public_key1, secret_key1) =
            cryptography.key_generator().expect("Key generation failed");
        let (public_key2, _) = cryptography.key_generator().expect("Key generation failed");

        let message = b"Testing message for signing";
        let signature = cryptography
            .sign(&secret_key1, message)
            .expect("Signing failed");

        match cryptography.verify(&public_key2, message, &signature) {
            Ok(is_valid) => {
                assert!(
                    !is_valid,
                    "Signature verification have failed with wrong public key"
                );
                info!("Correctly rejected signature with wrong public key");
            }
            Err(e) => {
                info!("Verification returned error as expected : {e}")
            }
        }

        let oth_message = b"Testing signing with oth";
        match cryptography.verify(&public_key1, oth_message, &signature) {
            Ok(is_valid) => {
                assert!(
                    !is_valid,
                    "Signature verification have failed with wrong public key"
                );
                info!("Correctly rejected signature with wrong message");
            }
            Err(e) => {
                info!("Verification returned error as expected : {e}")
            }
        }
    }
}
