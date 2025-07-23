pub mod batch;
pub mod algorithms;
pub mod metrics;

// Simplified compression module for initial implementation
use candid::{CandidType, Deserialize};

/// Compression configuration for different algorithms
#[derive(Debug, Clone, CandidType, Deserialize)]
pub struct CompressionConfig {
    pub algorithm: CompressionAlgorithm,
    pub compression_level: u8,  // 1-9, where 9 is maximum compression
    pub enable_aggregation: bool,
    pub batch_size_limit: usize,
}

/// Supported compression algorithms
#[derive(Debug, Clone, CandidType, Deserialize)]
pub enum CompressionAlgorithm {
    /// Fast compression with moderate ratio
    Zstd,
    /// Maximum compression ratio
    Brotli,
    /// Specialized for cryptographic signatures
    CryptoOptimized,
    /// Post-quantum signature aggregation
    QuantumAggregated,
}

impl Default for CompressionConfig {
    fn default() -> Self {
        Self {
            algorithm: CompressionAlgorithm::CryptoOptimized,
            compression_level: 6,
            enable_aggregation: true,
            batch_size_limit: 1000,
        }
    }
}

/// Compression metrics for performance tracking
#[derive(Debug, Clone, CandidType, Deserialize, Default)]
pub struct CompressionMetrics {
    pub original_size: u64,
    pub compressed_size: u64,
    pub compression_ratio: f64,
    pub compression_time_ms: u64,
    pub decompression_time_ms: u64,
    pub energy_efficiency_score: f64,
    pub algorithm_used: String,
}

impl CompressionMetrics {
    pub fn calculate_compression_ratio(original: usize, compressed: usize) -> f64 {
        if original == 0 {
            return 0.0;
        }
        (1.0 - (compressed as f64 / original as f64)) * 100.0
    }

    pub fn calculate_energy_efficiency(
        compression_ratio: f64,
        compression_time_ms: u64,
    ) -> f64 {
        if compression_time_ms == 0 {
            return 0.0;
        }
        // Energy efficiency = compression benefit per time unit
        compression_ratio / (compression_time_ms as f64)
    }
}

// Simplified version - complex traits removed for initial implementation