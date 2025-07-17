//! Implementation of the PQ Falcon signature scheme
//! Part of the NIST PQC standardization effort  
//! Using FIPS 205 parameters (security level 1, 128bit security)
//! Pure Rust implementation for WASM compatibility

use std::fmt;

use super::bridge::CryptographyBridge;
use fips205::{
    slh_dsa_sha2_128f::{self, PrivateKey, PublicKey},
    traits::{SerDes, Signer, Verifier},
};
use rand::rngs::OsRng;

#[derive(Clone)]
pub struct FALCONSignature(Vec<u8>);

impl fmt::Debug for FALCONSignature {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "SLH-DSA-SHA2-128f Signature ({} bytes)", self.0.len())
    }
}

#[derive(Clone)]
pub struct FALCONPublicKey(PublicKey);

impl fmt::Debug for FALCONPublicKey {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "SLH-DSA-SHA2-128f PublicKey")
    }
}

/// Implementation of the SLH-DSA-SHA2-128f Post-Quantum signature scheme
/// Pure Rust implementation for WASM compatibility
///
/// # Features
/// - Key generation with secure randomness
/// - Message signing/verification via SLH-DSA-SHA2-128f
/// - Cross-Compatibility through CryptographyBridge Trait
#[derive(Debug, Clone)]
pub struct Falcon512;

impl CryptographyBridge for Falcon512 {
    type PublicKey = FALCONPublicKey;
    type SecretKey = PrivateKey;
    type SignedMessage = FALCONSignature;

    fn key_generator(
        &self,
    ) -> Result<(Self::PublicKey, Self::SecretKey), crate::errors::CryptographyError> {
        let mut rng = OsRng;
        let (private_key, public_key) = slh_dsa_sha2_128f::try_keygen_with_rng(&mut rng)
            .map_err(|_| crate::errors::CryptographyError::KeyGeneration)?;
        Ok((FALCONPublicKey(private_key), public_key))
    }

    fn sign(
        &self,
        secret_key: &Self::SecretKey,
        message: &[u8],
    ) -> Result<Self::SignedMessage, crate::errors::CryptographyError> {
        let mut rng = OsRng;
        let signature = secret_key
            .try_sign_with_rng(&mut rng, message, &[], false)
            .map_err(|_| crate::errors::CryptographyError::SigningError)?;
        Ok(FALCONSignature(signature.to_vec()))
    }

    fn verify(
        &self,
        public_key: &Self::PublicKey,
        message: &[u8],
        signature: &Self::SignedMessage,
    ) -> Result<bool, crate::errors::CryptographyError> {
        let sig_array: [u8; 17088] = signature.0.clone().try_into().unwrap_or([0; 17088]);
        let is_valid = public_key.0.verify(message, &sig_array, &[]);
        Ok(is_valid)
    }

    fn public_key_to_bytes(&self, public_key: &Self::PublicKey) -> Vec<u8> {
        public_key.0.clone().into_bytes().to_vec()
    }
}

#[cfg(test)]
mod tests {
    use log::{debug, info};

    use crate::cryptography::{bridge::CryptographyBridge, falcon::Falcon512};
    fn start_log() {
        let _ = env_logger::builder().is_test(true).try_init();
    }

    #[test]
    fn falcon512key_generator() {
        start_log();
        info!("Testing key generator for SLH-DSA-SHA2-128f");

        let cryptography = Falcon512;

        let generation = cryptography.key_generator();
        assert!(
            generation.is_ok(),
            "Failed to generate SLH-DSA-SHA2-128f keypair"
        );

        if let Ok((public_key, _secret_key)) = generation {
            debug!("Secret Key generated successfully");
            let public_key_bytes = cryptography.public_key_to_bytes(&public_key);
            debug!("Public key length : {:?}", public_key_bytes.len());
            let pkl = public_key_bytes.len();
            assert!(pkl > 0, "Public key should not be empty");
        }
    }

    #[test]
    fn falcon512_sign_verify() {
        start_log();
        info!("Testing sign and verify for SLH-DSA-SHA2-128f");
        let cryptography = Falcon512;

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
}
