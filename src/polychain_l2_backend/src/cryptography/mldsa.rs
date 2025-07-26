//! Implementation of the PQ ML-DSA signature scheme
//! Part of the NIST PQC standardization effort
//! Using FIPS 204 parameters (security level 2, 128bit security)
//! Pure Rust implementation for WASM compatibility

use std::fmt;

use crate::errors::CryptographyError;

use super::bridge::CryptographyBridge;
use fips204::{
    ml_dsa_44::{self, PrivateKey, PublicKey},
    traits::{SerDes, Signer, Verifier},
};
use rand::rngs::OsRng;

#[derive(Clone)]
pub struct MLDSASignature(Vec<u8>);

impl fmt::Debug for MLDSASignature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "ML-DSA-44 Signature ({} bytes)", self.0.len())
    }
}

#[derive(Clone)]
pub struct MLDSAPublicKey(PublicKey);

impl fmt::Debug for MLDSAPublicKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "ML-DSA-44 PublicKey")
    }
}

/// ML-DSA-44 Post-Quantum signature scheme
/// Pure Rust implementation for WASM compatibility
/// # Features
/// - Key generation with randomness
/// - Message signing/verification via ML-DSA-44
/// - Cross-Compatibility through CryptographyBridge trait
#[derive(Debug, Clone)]
pub struct Mldsa44;

impl CryptographyBridge for Mldsa44 {
    type PublicKey = MLDSAPublicKey;
    type SecretKey = PrivateKey;
    type SignedMessage = MLDSASignature;

    fn key_generator(&self) -> Result<(Self::PublicKey, Self::SecretKey), CryptographyError> {
        let mut rng = OsRng;
        let (private_key, public_key) = ml_dsa_44::try_keygen_with_rng(&mut rng)
            .map_err(|_| CryptographyError::KeyGeneration)?;
        Ok((MLDSAPublicKey(private_key), public_key))
    }

    fn sign(
        &self,
        secret_key: &Self::SecretKey,
        message: &[u8],
    ) -> Result<Self::SignedMessage, CryptographyError> {
        let mut rng = OsRng;
        let signature = secret_key
            .try_sign_with_rng(&mut rng, message, &[])
            .map_err(|_| CryptographyError::SigningError)?;
        Ok(MLDSASignature(signature.to_vec()))
    }

    fn verify(
        &self,
        public_key: &Self::PublicKey,
        message: &[u8],
        signature: &Self::SignedMessage,
    ) -> Result<bool, CryptographyError> {
        // Validate signature length first - critical for security
        if signature.0.len() != 2420 {
            return Err(CryptographyError::SigningError);
        }
        
        let sig_array: [u8; 2420] = signature.0.clone().try_into()
            .map_err(|_| CryptographyError::SigningError)?;
        let is_valid = public_key.0.verify(message, &sig_array, &[]);
        Ok(is_valid)
    }

    fn public_key_to_bytes(&self, public_key: &Self::PublicKey) -> Vec<u8> {
        public_key.0.clone().into_bytes().to_vec()
    }
}

#[cfg(test)]
mod tests {
    use super::Mldsa44;
    use crate::cryptography::bridge::CryptographyBridge;
    use log::{debug, info};

    fn start_log() {
        let _ = env_logger::builder().is_test(true).try_init();
    }

    #[test]
    fn mldsa44key_generator() {
        start_log();
        info!("Testing key generator for ML-DSA-44");
        let cryptography = Mldsa44;

        let generation = cryptography.key_generator();
        assert!(generation.is_ok(), "Failed to generate ML-DSA-44 keypair");

        if let Ok((public_key, _secret_key)) = generation {
            debug!("Secret key generated successfully");
            let public_key_bytes = cryptography.public_key_to_bytes(&public_key);
            debug!("Public key length : {:?}", public_key_bytes.len());
            let pkl = public_key_bytes.len();
            assert!(pkl > 0, "Public key should not be empty");
            info!("Key generation successful with correct key size");
        }
    }

    #[test]
    fn mldsa44_sign_verify() {
        start_log();
        info!("Testing sign and verify for ML-DSA-44");
        let cryptography = Mldsa44;

        match cryptography.key_generator() {
            Ok((public_key, secret_key)) => {
                let message = b"Test message for signing";
                match cryptography.sign(&secret_key, message) {
                    Ok(signature) => {
                        debug!("Signature generated successfully");

                        match cryptography.verify(&public_key, message, &signature) {
                            Ok(is_valid) => {
                                assert!(is_valid, "Signature verification failed");
                                info!("Signature verification successfull")
                            }
                            Err(e) => {
                                panic!("Verification error : {e}");
                            }
                        }
                    }
                    Err(e) => {
                        panic!("Failed to sign message: {e}")
                    }
                }
            }
            Err(e) => {
                panic!("Failed to generate keys: {e}");
            }
        }
    }

    #[test]
    fn mldsa44_reject_invalid_signature() {
        start_log();
        info!("Testing rejection of invalid signatures for ML-DSA-44");

        let cryptography = Mldsa44;

        let (public_key1, secret_key1) = cryptography
            .key_generator()
            .expect("Key generation one failed");

        let (public_key2, _) = cryptography
            .key_generator()
            .expect("Key generation two failed");

        let message = b"testing message for signing";
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
                info!("Verification returned error as expected: {e}")
            }
        }

        let oth_message = b"Testing with different message";
        match cryptography.verify(&public_key1, oth_message, &signature) {
            Ok(is_valid) => {
                assert!(
                    !is_valid,
                    "Signature verification should have failed with wrong message"
                );
                info!("Correctly rejected signature with wrong message");
            }
            Err(e) => {
                info!("verification returned error as expected: {e}")
            }
        }
    }
}
