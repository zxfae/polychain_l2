import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BlockchainStats {
  'chain_height' : bigint,
  'latest_block_time' : bigint,
  'average_tx_per_block' : number,
  'total_transactions' : bigint,
  'total_blocks' : bigint,
}
export interface CryptoEfficiency {
  'worst_algorithm' : string,
  'falcon_efficiency' : number,
  'ecdsa_efficiency' : number,
  'best_algorithm' : string,
  'schnorr_efficiency' : number,
  'mldsa_efficiency' : number,
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
  'analyze_sequencing_benefits' : ActorMethod<[], SequencingBenefits>,
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
  'get_all_transactions' : ActorMethod<[], Array<PolyTransaction>>,
  'get_balance' : ActorMethod<[string], number>,
  'get_block_by_hash' : ActorMethod<[string], [] | [PolyBlock]>,
  'get_blockchain' : ActorMethod<[], Array<PolyBlock>>,
  'get_blockchain_stats' : ActorMethod<[], BlockchainStats>,
  'get_layer2_advanced_metrics' : ActorMethod<[], Layer2AdvancedMetrics>,
  'get_multi_chain_metrics' : ActorMethod<[], MultiChainMetrics>,
  'get_performance_metrics' : ActorMethod<[], PerformanceMetrics>,
  'get_recent_blocks' : ActorMethod<[number], Array<PolyBlock>>,
  'get_sequencer_metrics' : ActorMethod<[], SequencerMetrics>,
  'greet' : ActorMethod<[string], string>,
  'sequence_transaction_batch' : ActorMethod<
    [[] | [bigint]],
    { 'Ok' : SequencerBatchResult } |
      { 'Err' : string }
  >,
  'test_pos_consensus' : ActorMethod<
    [],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
