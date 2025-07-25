import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BatchConfig {
  'compression_algorithm' : string,
  'max_size' : [] | [bigint],
  'priority' : string,
}
export interface BitcoinBalance {
  'total_bitcoin' : bigint,
  'native_bitcoin' : bigint,
  'wrapped_bitcoin' : bigint,
}
export interface BlockchainStats {
  'chain_height' : bigint,
  'latest_block_time' : bigint,
  'average_tx_per_block' : number,
  'total_transactions' : bigint,
  'total_blocks' : bigint,
}
export interface CompressedBatch {
  'algorithm' : string,
  'batch_id' : string,
  'created_at' : bigint,
  'compressed_size' : bigint,
  'original_size' : bigint,
  'transaction_count' : number,
  'compression_ratio' : number,
}
export interface CompressionPerformanceMetrics {
  'algorithm' : string,
  'storage_savings_percentage' : number,
  'decompression_speed_mbps' : number,
  'total_batches_processed' : bigint,
  'compression_speed_mbps' : number,
  'compression_ratio' : number,
  'average_batch_size' : number,
}
export interface CryptoBenchmarkResult {
  'algorithm' : string,
  'message_length' : bigint,
  'total_time_ns' : bigint,
  'quantum_resistant' : boolean,
  'success' : boolean,
}
export interface CryptoEfficiency {
  'worst_algorithm' : string,
  'falcon_efficiency' : number,
  'ecdsa_efficiency' : number,
  'best_algorithm' : string,
  'schnorr_efficiency' : number,
  'mldsa_efficiency' : number,
}
export interface CryptoRecommendation {
  'efficiency_score' : number,
  'recommended_algorithm' : string,
  'risk_level' : string,
  'alternative_algorithms' : Array<string>,
  'security_rating' : string,
  'quantum_threat_level' : number,
  'reason' : string,
}
export interface DemoTransaction {
  'id' : string,
  'recipient' : string,
  'sender' : string,
  'timestamp' : bigint,
  'tx_type' : string,
  'amount' : number,
}
export interface EthereumBalance {
  'native_ethereum' : bigint,
  'wrapped_ethereum' : bigint,
  'total_ethereum' : bigint,
}
export interface IcpBalance {
  'native_icp' : bigint,
  'total_icp' : bigint,
  'wrapped_icp' : bigint,
}
export interface Layer2AdvancedMetrics {
  'total_classical_transactions' : bigint,
  'quantum_ready_percentage' : number,
  'performance_impact_quantum' : number,
  'auto_selection_enabled' : boolean,
  'security_score' : number,
  'migration_readiness' : number,
  'total_quantum_transactions' : bigint,
  'threat_detection_active' : boolean,
  'quantum_threat_level' : number,
  'avg_risk_level' : string,
  'crypto_efficiency' : CryptoEfficiency,
  'adaptive_security_enabled' : boolean,
}
export interface MultiChainMetrics {
  'cross_chain_volume_24h' : number,
  'bridge_uptime' : number,
  'average_bridge_time' : number,
  'active_validators' : number,
  'total_bridges' : number,
  'bridge_security_score' : number,
  'total_locked_value' : number,
  'supported_chains' : Array<string>,
}
export interface PerformanceMetrics {
  'hybrid_vault_active' : boolean,
  'vault_statistics' : VaultStats,
  'quantum_resistant' : boolean,
  'bitcoin_integration' : boolean,
  'supported_algorithms' : Array<string>,
  'transactions_per_second' : number,
}
export interface PolyBlock {
  'hash' : string,
  'previous_hash' : string,
  'nonce' : bigint,
  'timestamp' : bigint,
  'transactions' : Array<PolyTransaction>,
}
export interface PolyTransaction {
  'signature' : [] | [string],
  'hash' : [] | [string],
  'recipient' : string,
  'sender' : string,
  'amount' : number,
  'time_stamp' : bigint,
}
export interface SequencerBatchResult {
  'fairness_score' : number,
  'batch_id' : string,
  'sequencing_time_ms' : bigint,
  'success' : boolean,
  'ordering_strategy' : string,
  'transaction_count' : bigint,
}
export interface SequencerMetrics {
  'fairness_score' : number,
  'total_transactions_sequenced' : bigint,
  'total_batches_created' : bigint,
  'current_pending_count' : bigint,
  'average_sequencing_time_ms' : number,
  'ordering_strategy' : string,
  'average_batch_size' : number,
}
export interface SequencingBenefits {
  'throughput_improvement' : number,
  'fairness_improvement' : number,
  'front_running_prevention' : boolean,
  'deterministic_ordering' : boolean,
  'recommended_strategy' : string,
  'mev_protection_score' : number,
  'multi_chain_support' : boolean,
  'gas_savings_percentage' : number,
}
export interface SolanaBalance {
  'wrapped_solana' : bigint,
  'total_solana' : bigint,
  'native_solana' : bigint,
}
export interface VaultStatistics {
  'total_deposits_satoshi' : bigint,
  'vault_active' : boolean,
  'deposit_threshold' : bigint,
  'total_transactions' : bigint,
  'wrapped_addresses' : number,
  'native_addresses' : number,
}
export interface VaultStats {
  'wrapped_count' : bigint,
  'total_deposits' : number,
  'native_count' : bigint,
  'transaction_count' : bigint,
}
export interface _SERVICE {
  'add_transaction_to_sequencer' : ActorMethod<
    [string, string, number],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'analyze_icp_compression_benefits' : ActorMethod<
    [Array<PolyTransaction>],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'analyze_sequencing_benefits' : ActorMethod<[], SequencingBenefits>,
  'create_compressed_batch' : ActorMethod<
    [Array<PolyTransaction>, [] | [BatchConfig]],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'create_transaction' : ActorMethod<
    [string, string, number],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'create_transaction_sequencer' : ActorMethod<
    [string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'crypto_algorithm_benchmark' : ActorMethod<
    [string, string],
    { 'Ok' : CryptoBenchmarkResult } |
      { 'Err' : string }
  >,
  'deposit_bitcoin' : ActorMethod<
    [string, bigint],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'deposit_bitcoin_with_crypto' : ActorMethod<
    [string, bigint, [] | [string], [] | [number]],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'deposit_ethereum' : ActorMethod<
    [string, bigint],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'deposit_icp' : ActorMethod<
    [string, bigint],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'deposit_solana' : ActorMethod<
    [string, bigint],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'fetch_real_icp_data' : ActorMethod<
    [number],
    { 'Ok' : Array<DemoTransaction> } |
      { 'Err' : string }
  >,
  'generate_realistic_demo_data' : ActorMethod<
    [string, number],
    { 'Ok' : Array<DemoTransaction> } |
      { 'Err' : string }
  >,
  'get_all_transactions' : ActorMethod<[], Array<PolyTransaction>>,
  'get_api_performance_info' : ActorMethod<[], string>,
  'get_balance' : ActorMethod<[string], number>,
  'get_bitcoin_balance' : ActorMethod<[string], BitcoinBalance>,
  'get_block_by_hash' : ActorMethod<[string], [] | [PolyBlock]>,
  'get_blockchain' : ActorMethod<[], Array<PolyBlock>>,
  'get_blockchain_stats' : ActorMethod<[], BlockchainStats>,
  'get_compressed_batch' : ActorMethod<[string], [] | [CompressedBatch]>,
  'get_compression_performance_metrics' : ActorMethod<
    [],
    CompressionPerformanceMetrics
  >,
  'get_crypto_recommendation' : ActorMethod<
    [bigint, [] | [number], [] | [boolean]],
    CryptoRecommendation
  >,
  'get_ethereum_balance' : ActorMethod<[string], EthereumBalance>,
  'get_icp_balance' : ActorMethod<[string], IcpBalance>,
  'get_layer2_advanced_metrics' : ActorMethod<[], Layer2AdvancedMetrics>,
  'get_multi_chain_metrics' : ActorMethod<[], MultiChainMetrics>,
  'get_performance_metrics' : ActorMethod<[], PerformanceMetrics>,
  'get_recent_blocks' : ActorMethod<[number], Array<PolyBlock>>,
  'get_sequencer_created_blocks' : ActorMethod<
    [[] | [number]],
    Array<PolyBlock>
  >,
  'get_sequencer_metrics' : ActorMethod<[], SequencerMetrics>,
  'get_solana_balance' : ActorMethod<[string], SolanaBalance>,
  'get_vault_statistics' : ActorMethod<[], VaultStatistics>,
  'greet' : ActorMethod<[string], string>,
  'is_quantum_ready_all_chains' : ActorMethod<[], boolean>,
  'list_compressed_batches' : ActorMethod<[], Array<CompressedBatch>>,
  'run_compression_benchmark' : ActorMethod<
    [Uint32Array | number[], [] | [string]],
    { 'Ok' : Array<CompressionPerformanceMetrics> } |
      { 'Err' : string }
  >,
  'sequence_transaction_batch' : ActorMethod<
    [[] | [bigint]],
    { 'Ok' : SequencerBatchResult } |
      { 'Err' : string }
  >,
  'simulate_network_stress_test' : ActorMethod<
    [Array<PolyTransaction>, string],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'test_pos_consensus' : ActorMethod<
    [],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'verify_transaction_in_blockchain' : ActorMethod<
    [string, string, number],
    [] | [string]
  >,
  'withdraw_bitcoin' : ActorMethod<
    [string, bigint, boolean],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'withdraw_bitcoin_adaptive' : ActorMethod<
    [string, bigint, boolean, [] | [number]],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'withdraw_ethereum' : ActorMethod<
    [string, bigint, boolean],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'withdraw_icp' : ActorMethod<
    [string, bigint, boolean],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'withdraw_solana' : ActorMethod<
    [string, bigint, boolean],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
