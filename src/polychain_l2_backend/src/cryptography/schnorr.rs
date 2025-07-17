//! Implementation of the Schnorr signature scheme
//! Using the `k256` crate for secp256k1 curve operations

use k256::{
    elliptic_curve::rand_core::OsRng,
    schnorr::{
        signature::{Signer, Verifier},
        Signature, SigningKey, VerifyingKey,
    },
};

use super::bridge::CryptographyBridge;

/// Schnorr signature scheme
/// # Security
/// - Based on the discrete logarithm problem
/// - Provides signature aggregation capabilities
/// - Non-malleable signatures
///
/// # Features
/// - Key generation using secure OS randomness
/// - Signing and verification of messages
/// - Compact signatures

#[derive(Debug, Clone)]
pub struct Schnorr;

impl CryptographyBridge for Schnorr {
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
        public_key.to_bytes().to_vec()
    }
}

#[cfg(test)]
mod tests {
    use crate::cryptography::{bridge::CryptographyBridge, schnorr::Schnorr};
    use log::{debug, info};

    fn start_log() {
        let _ = env_logger::builder().is_test(true).try_init();
    }

    #[test]
    fn schnorr_key_generator() {
        start_log();
        info!("Testing key generator for schnorr");
        let cryptography = Schnorr;

        let generation = cryptography.key_generator();
        assert!(generation.is_ok(), "Failed to generate schnorr keypair");

        let (public_key, secret_key) = generation.unwrap();

        assert_eq!(
            secret_key.to_bytes().len(),
            32,
            "Schnorr secret key size mismatch"
        );

        debug!("Public key len {:?}", public_key.to_bytes().len());
        assert_eq!(
            public_key.to_bytes().len(),
            32,
            "Schnorr public key size mismatch"
        );
    }

    #[test]
    fn schnorr_sign_verify() {
        start_log();
        info!("Testing sign and verify for schnorr");
        let cryptography = Schnorr;
        let generation = cryptography.key_generator();

        let (public_key, secret_key) = generation.unwrap();
        let message = b"Testing message to sign";

        match cryptography.sign(&secret_key, message) {
            Ok(signature) => {
                let signature_bytes = signature.to_bytes();
                debug!("Signature bytes : {:?}", signature_bytes.len());
                assert_eq!(signature_bytes.len(), 64);

                match cryptography.verify(&public_key, message, &signature) {
                    Ok(is_valid) => {
                        assert!(is_valid, "Signature verification failed");
                        debug!("Validity :  {is_valid}");
                        info!("Signature verification successful");
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
    fn schnorr_reject_invalid_signature() {
        start_log();
        info!("Testing rejection of invalid signatures for schnorr");

        let cryptography = Schnorr;

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
                    "Signature verification should have failed with wrong public key"
                );
                info!("Correctly rejected signature with wrong public key");
            }
            Err(e) => {
                info!("Verification returned error as expected : {e}")
            }
        }

        let oth_message = b"Testing signing with different message";
        match cryptography.verify(&public_key1, oth_message, &signature) {
            Ok(is_valid) => {
                assert!(
                    !is_valid,
                    "Signature verification should have failed with wrong message"
                );
                info!("Correctly rejected signature with wrong message");
            }
            Err(e) => {
                info!("Verification returned error as expected : {e}")
            }
        }
    }
}
