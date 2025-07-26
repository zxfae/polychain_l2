//! Input validation and sanitization module
//! Critical security component for production-ready DeFi platform

use crate::errors::CryptographyError;

/// Maximum allowed string length for addresses and identifiers
const MAX_STRING_LENGTH: usize = 256;
/// Maximum allowed transaction amount (in smallest unit)
const MAX_TRANSACTION_AMOUNT: u64 = 21_000_000 * 100_000_000; // 21M Bitcoin in satoshi
/// Maximum allowed batch size for operations
const MAX_BATCH_SIZE: usize = 10_000;
/// Minimum allowed transaction amount (to prevent dust)
const MIN_TRANSACTION_AMOUNT: u64 = 546; // Bitcoin dust limit in satoshi

/// Validation result type
pub type ValidationResult<T> = Result<T, ValidationError>;

/// Comprehensive validation error types
#[derive(Debug, Clone)]
pub enum ValidationError {
    InvalidAddress(String),
    InvalidAmount(String),
    InvalidString(String),
    InvalidBatchSize(String),
    InvalidHash(String),
    InvalidAlgorithm(String),
    InvalidQuantumLevel(String),
    EmptyInput(String),
    TooLarge(String),
    TooSmall(String),
    InvalidFormat(String),
    SecurityThreat(String),
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ValidationError::InvalidAddress(msg) => write!(f, "Invalid address: {}", msg),
            ValidationError::InvalidAmount(msg) => write!(f, "Invalid amount: {}", msg),
            ValidationError::InvalidString(msg) => write!(f, "Invalid string: {}", msg),
            ValidationError::InvalidBatchSize(msg) => write!(f, "Invalid batch size: {}", msg),
            ValidationError::InvalidHash(msg) => write!(f, "Invalid hash: {}", msg),
            ValidationError::InvalidAlgorithm(msg) => write!(f, "Invalid algorithm: {}", msg),
            ValidationError::InvalidQuantumLevel(msg) => write!(f, "Invalid quantum level: {}", msg),
            ValidationError::EmptyInput(msg) => write!(f, "Empty input: {}", msg),
            ValidationError::TooLarge(msg) => write!(f, "Input too large: {}", msg),
            ValidationError::TooSmall(msg) => write!(f, "Input too small: {}", msg),
            ValidationError::InvalidFormat(msg) => write!(f, "Invalid format: {}", msg),
            ValidationError::SecurityThreat(msg) => write!(f, "Security threat detected: {}", msg),
        }
    }
}

impl From<ValidationError> for String {
    fn from(error: ValidationError) -> Self {
        error.to_string()
    }
}

/// Address validation utilities
pub struct AddressValidator;

impl AddressValidator {
    /// Validate a generic blockchain address
    pub fn validate_address(address: &str, chain: &str) -> ValidationResult<()> {
        if address.is_empty() {
            return Err(ValidationError::EmptyInput("Address cannot be empty".to_string()));
        }

        if address.len() > MAX_STRING_LENGTH {
            return Err(ValidationError::TooLarge(format!(
                "Address too long: {} > {} characters",
                address.len(),
                MAX_STRING_LENGTH
            )));
        }

        // Check for malicious patterns
        if Self::contains_malicious_patterns(address) {
            return Err(ValidationError::SecurityThreat(
                "Address contains potentially malicious patterns".to_string(),
            ));
        }

        match chain.to_lowercase().as_str() {
            "bitcoin" | "btc" => Self::validate_bitcoin_address(address),
            "ethereum" | "eth" => Self::validate_ethereum_address(address),
            "icp" => Self::validate_icp_address(address),
            "solana" | "sol" => Self::validate_solana_address(address),
            _ => Ok(()), // Generic validation passed
        }
    }

    fn validate_bitcoin_address(address: &str) -> ValidationResult<()> {
        // Bitcoin address basic validation
        if address.len() < 26 || address.len() > 62 {
            return Err(ValidationError::InvalidAddress(
                "Bitcoin address length invalid".to_string(),
            ));
        }

        // Check for valid Bitcoin address characters
        if !address.chars().all(|c| c.is_alphanumeric()) {
            return Err(ValidationError::InvalidAddress(
                "Bitcoin address contains invalid characters".to_string(),
            ));
        }

        Ok(())
    }

    fn validate_ethereum_address(address: &str) -> ValidationResult<()> {
        // Ethereum address validation (0x + 40 hex chars)
        if !address.starts_with("0x") {
            return Err(ValidationError::InvalidAddress(
                "Ethereum address must start with 0x".to_string(),
            ));
        }

        if address.len() != 42 {
            return Err(ValidationError::InvalidAddress(
                "Ethereum address must be 42 characters long".to_string(),
            ));
        }

        if !address[2..].chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(ValidationError::InvalidAddress(
                "Ethereum address contains invalid hex characters".to_string(),
            ));
        }

        Ok(())
    }

    fn validate_icp_address(address: &str) -> ValidationResult<()> {
        // ICP principal validation (basic)
        if address.len() < 10 || address.len() > 100 {
            return Err(ValidationError::InvalidAddress(
                "ICP address length invalid".to_string(),
            ));
        }

        // ICP addresses use alphanumeric + dashes
        if !address.chars().all(|c| c.is_alphanumeric() || c == '-') {
            return Err(ValidationError::InvalidAddress(
                "ICP address contains invalid characters".to_string(),
            ));
        }

        Ok(())
    }

    fn validate_solana_address(address: &str) -> ValidationResult<()> {
        // Solana address validation (base58, 32-44 chars typically)
        if address.len() < 32 || address.len() > 44 {
            return Err(ValidationError::InvalidAddress(
                "Solana address length invalid".to_string(),
            ));
        }

        // Basic base58 character check
        const BASE58_CHARS: &str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        if !address.chars().all(|c| BASE58_CHARS.contains(c)) {
            return Err(ValidationError::InvalidAddress(
                "Solana address contains invalid base58 characters".to_string(),
            ));
        }

        Ok(())
    }

    fn contains_malicious_patterns(input: &str) -> bool {
        let malicious_patterns = [
            "<script", "javascript:", "data:", "vbscript:", "onload=", "onerror=",
            "../", "..\\", "null", "undefined", "eval(", "exec(",
        ];

        let lower_input = input.to_lowercase();
        malicious_patterns.iter().any(|&pattern| lower_input.contains(pattern))
    }
}

/// Amount validation utilities
pub struct AmountValidator;

impl AmountValidator {
    /// Validate transaction amount (in smallest unit, e.g., satoshi)
    pub fn validate_amount(amount: u64, min_amount: Option<u64>) -> ValidationResult<()> {
        let minimum = min_amount.unwrap_or(MIN_TRANSACTION_AMOUNT);

        if amount == 0 {
            return Err(ValidationError::InvalidAmount(
                "Amount cannot be zero".to_string(),
            ));
        }

        if amount < minimum {
            return Err(ValidationError::TooSmall(format!(
                "Amount {} is below minimum {}",
                amount, minimum
            )));
        }

        if amount > MAX_TRANSACTION_AMOUNT {
            return Err(ValidationError::TooLarge(format!(
                "Amount {} exceeds maximum {}",
                amount, MAX_TRANSACTION_AMOUNT
            )));
        }

        Ok(())
    }

    /// Validate floating point amount and convert to integer
    pub fn validate_and_convert_float_amount(amount: f64, decimals: u8) -> ValidationResult<u64> {
        if amount <= 0.0 {
            return Err(ValidationError::InvalidAmount(
                "Amount must be positive".to_string(),
            ));
        }

        if !amount.is_finite() {
            return Err(ValidationError::InvalidAmount(
                "Amount must be a finite number".to_string(),
            ));
        }

        let multiplier = 10_u64.pow(decimals as u32);
        let amount_int = (amount * multiplier as f64) as u64;

        Self::validate_amount(amount_int, None)?;
        Ok(amount_int)
    }
}

/// String and batch validation utilities
pub struct GeneralValidator;

impl GeneralValidator {
    /// Validate and sanitize generic string input
    pub fn validate_string(input: &str, field_name: &str, max_length: Option<usize>) -> ValidationResult<String> {
        if input.is_empty() {
            return Err(ValidationError::EmptyInput(format!(
                "{} cannot be empty",
                field_name
            )));
        }

        let max_len = max_length.unwrap_or(MAX_STRING_LENGTH);
        if input.len() > max_len {
            return Err(ValidationError::TooLarge(format!(
                "{} too long: {} > {} characters",
                field_name,
                input.len(),
                max_len
            )));
        }

        // Check for malicious patterns
        if AddressValidator::contains_malicious_patterns(input) {
            return Err(ValidationError::SecurityThreat(format!(
                "{} contains potentially malicious patterns",
                field_name
            )));
        }

        // Sanitize by removing control characters
        let sanitized = input
            .chars()
            .filter(|c| !c.is_control() || *c == '\n' || *c == '\t')
            .collect::<String>();

        Ok(sanitized)
    }

    /// Validate batch size
    pub fn validate_batch_size(size: usize) -> ValidationResult<()> {
        if size == 0 {
            return Err(ValidationError::InvalidBatchSize(
                "Batch size cannot be zero".to_string(),
            ));
        }

        if size > MAX_BATCH_SIZE {
            return Err(ValidationError::TooLarge(format!(
                "Batch size {} exceeds maximum {}",
                size, MAX_BATCH_SIZE
            )));
        }

        Ok(())
    }

    /// Validate cryptographic algorithm name
    pub fn validate_crypto_algorithm(algorithm: &str) -> ValidationResult<()> {
        let valid_algorithms = ["ecdsa", "schnorr", "falcon", "falcon512", "mldsa", "mldsa44"];
        
        let normalized = algorithm.to_lowercase();
        if !valid_algorithms.contains(&normalized.as_str()) {
            return Err(ValidationError::InvalidAlgorithm(format!(
                "Unsupported algorithm: {}. Valid options: {:?}",
                algorithm, valid_algorithms
            )));
        }

        Ok(())
    }

    /// Validate quantum threat level (0-100)
    pub fn validate_quantum_threat_level(level: u8) -> ValidationResult<()> {
        if level > 100 {
            return Err(ValidationError::InvalidQuantumLevel(
                "Quantum threat level must be 0-100".to_string(),
            ));
        }
        Ok(())
    }

    /// Validate hash string format
    pub fn validate_hash(hash: &str) -> ValidationResult<()> {
        if hash.is_empty() {
            return Err(ValidationError::EmptyInput("Hash cannot be empty".to_string()));
        }

        // Hash should be hex string, typically 64 characters for SHA256
        if hash.len() < 32 || hash.len() > 128 {
            return Err(ValidationError::InvalidHash(
                "Hash length invalid".to_string(),
            ));
        }

        if !hash.chars().all(|c| c.is_ascii_hexdigit()) {
            return Err(ValidationError::InvalidHash(
                "Hash must contain only hexadecimal characters".to_string(),
            ));
        }

        Ok(())
    }
}

/// Rate limiting and DOS protection
pub struct SecurityValidator;

impl SecurityValidator {
    /// Validate request frequency (basic rate limiting concept)
    pub fn validate_request_frequency(requests_count: u64, time_window_seconds: u64) -> ValidationResult<()> {
        const MAX_REQUESTS_PER_MINUTE: u64 = 100;
        const MAX_REQUESTS_PER_HOUR: u64 = 1000;

        match time_window_seconds {
            60 => {
                if requests_count > MAX_REQUESTS_PER_MINUTE {
                    return Err(ValidationError::SecurityThreat(
                        "Rate limit exceeded: too many requests per minute".to_string(),
                    ));
                }
            }
            3600 => {
                if requests_count > MAX_REQUESTS_PER_HOUR {
                    return Err(ValidationError::SecurityThreat(
                        "Rate limit exceeded: too many requests per hour".to_string(),
                    ));
                }
            }
            _ => {} // No validation for other time windows
        }

        Ok(())
    }

    /// Detect potentially malicious input patterns
    pub fn detect_malicious_input(input: &str) -> ValidationResult<()> {
        // SQL injection patterns
        let sql_patterns = ["'", "--", "/*", "*/", "xp_", "sp_", "drop", "delete", "insert", "update"];
        let lower_input = input.to_lowercase();
        
        for pattern in &sql_patterns {
            if lower_input.contains(pattern) {
                return Err(ValidationError::SecurityThreat(
                    "Input contains potentially malicious SQL patterns".to_string(),
                ));
            }
        }

        // Script injection patterns (already covered in AddressValidator, but additional check)
        if AddressValidator::contains_malicious_patterns(input) {
            return Err(ValidationError::SecurityThreat(
                "Input contains potentially malicious script patterns".to_string(),
            ));
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_address_validation() {
        // Valid addresses
        assert!(AddressValidator::validate_address("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2", "bitcoin").is_ok());
        assert!(AddressValidator::validate_address("0x742d35cc6527c85b8c1e80b71d5e12c5de7b3b5b", "ethereum").is_ok());
        assert!(AddressValidator::validate_address("rdmx6-jaaaa-aaaah-qcaiq-cai", "icp").is_ok());
        
        // Invalid addresses
        assert!(AddressValidator::validate_address("", "bitcoin").is_err());
        assert!(AddressValidator::validate_address("invalid_eth", "ethereum").is_err());
        assert!(AddressValidator::validate_address("0xinvalid", "ethereum").is_err());
    }

    #[test]
    fn test_amount_validation() {
        // Valid amounts
        assert!(AmountValidator::validate_amount(1000, None).is_ok());
        assert!(AmountValidator::validate_amount(1_000_000, None).is_ok());
        
        // Invalid amounts
        assert!(AmountValidator::validate_amount(0, None).is_err());
        assert!(AmountValidator::validate_amount(100, Some(500)).is_err()); // Below minimum
        assert!(AmountValidator::validate_amount(u64::MAX, None).is_err()); // Too large
    }

    #[test]
    fn test_string_validation() {
        // Valid strings
        assert!(GeneralValidator::validate_string("test", "field", None).is_ok());
        assert!(GeneralValidator::validate_string("normal_string_123", "field", None).is_ok());
        
        // Invalid strings
        assert!(GeneralValidator::validate_string("", "field", None).is_err());
        assert!(GeneralValidator::validate_string("<script>alert('xss')</script>", "field", None).is_err());
        assert!(GeneralValidator::validate_string(&"x".repeat(1000), "field", Some(100)).is_err());
    }

    #[test]
    fn test_crypto_algorithm_validation() {
        // Valid algorithms
        assert!(GeneralValidator::validate_crypto_algorithm("ecdsa").is_ok());
        assert!(GeneralValidator::validate_crypto_algorithm("FALCON512").is_ok());
        assert!(GeneralValidator::validate_crypto_algorithm("mldsa44").is_ok());
        
        // Invalid algorithms
        assert!(GeneralValidator::validate_crypto_algorithm("invalid_algo").is_err());
        assert!(GeneralValidator::validate_crypto_algorithm("").is_err());
    }

    #[test]
    fn test_security_validation() {
        // Safe inputs
        assert!(SecurityValidator::detect_malicious_input("normal text").is_ok());
        assert!(SecurityValidator::detect_malicious_input("address123").is_ok());
        
        // Malicious inputs
        assert!(SecurityValidator::detect_malicious_input("'; DROP TABLE users; --").is_err());
        assert!(SecurityValidator::detect_malicious_input("<script>alert('xss')</script>").is_err());
        assert!(SecurityValidator::detect_malicious_input("javascript:alert(1)").is_err());
    }
}