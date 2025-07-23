export const idlFactory = ({ IDL }) => {
  const SequencingBenefits = IDL.Record({
    'throughput_improvement' : IDL.Float64,
    'fairness_improvement' : IDL.Float64,
    'front_running_prevention' : IDL.Bool,
    'deterministic_ordering' : IDL.Bool,
    'recommended_strategy' : IDL.Text,
    'mev_protection_score' : IDL.Float64,
    'multi_chain_support' : IDL.Bool,
    'gas_savings_percentage' : IDL.Float64,
  });
  const PolyTransaction = IDL.Record({
    'signature' : IDL.Opt(IDL.Text),
    'hash' : IDL.Opt(IDL.Text),
    'recipient' : IDL.Text,
    'sender' : IDL.Text,
    'amount' : IDL.Float64,
    'time_stamp' : IDL.Int64,
  });
  const PolyBlock = IDL.Record({
    'hash' : IDL.Text,
    'previous_hash' : IDL.Text,
    'nonce' : IDL.Nat64,
    'timestamp' : IDL.Int64,
    'transactions' : IDL.Vec(PolyTransaction),
  });
  const BlockchainStats = IDL.Record({
    'chain_height' : IDL.Nat64,
    'latest_block_time' : IDL.Int64,
    'average_tx_per_block' : IDL.Float64,
    'total_transactions' : IDL.Nat64,
    'total_blocks' : IDL.Nat64,
  });
  const CryptoEfficiency = IDL.Record({
    'worst_algorithm' : IDL.Text,
    'falcon_efficiency' : IDL.Float64,
    'ecdsa_efficiency' : IDL.Float64,
    'best_algorithm' : IDL.Text,
    'schnorr_efficiency' : IDL.Float64,
    'mldsa_efficiency' : IDL.Float64,
  });
  const Layer2AdvancedMetrics = IDL.Record({
    'total_classical_transactions' : IDL.Nat64,
    'quantum_ready_percentage' : IDL.Float64,
    'performance_impact_quantum' : IDL.Float64,
    'auto_selection_enabled' : IDL.Bool,
    'security_score' : IDL.Float64,
    'migration_readiness' : IDL.Float64,
    'total_quantum_transactions' : IDL.Nat64,
    'threat_detection_active' : IDL.Bool,
    'quantum_threat_level' : IDL.Nat8,
    'avg_risk_level' : IDL.Text,
    'crypto_efficiency' : CryptoEfficiency,
    'adaptive_security_enabled' : IDL.Bool,
  });
  const MultiChainMetrics = IDL.Record({
    'cross_chain_volume_24h' : IDL.Float64,
    'bridge_uptime' : IDL.Float64,
    'average_bridge_time' : IDL.Float64,
    'active_validators' : IDL.Nat32,
    'total_bridges' : IDL.Nat32,
    'bridge_security_score' : IDL.Float64,
    'total_locked_value' : IDL.Float64,
    'supported_chains' : IDL.Vec(IDL.Text),
  });
  const VaultStats = IDL.Record({
    'wrapped_count' : IDL.Nat64,
    'total_deposits' : IDL.Float64,
    'native_count' : IDL.Nat64,
    'transaction_count' : IDL.Nat64,
  });
  const PerformanceMetrics = IDL.Record({
    'hybrid_vault_active' : IDL.Bool,
    'vault_statistics' : VaultStats,
    'quantum_resistant' : IDL.Bool,
    'bitcoin_integration' : IDL.Bool,
    'supported_algorithms' : IDL.Vec(IDL.Text),
    'transactions_per_second' : IDL.Nat32,
  });
  const SequencerMetrics = IDL.Record({
    'fairness_score' : IDL.Float64,
    'total_transactions_sequenced' : IDL.Nat64,
    'total_batches_created' : IDL.Nat64,
    'current_pending_count' : IDL.Nat64,
    'average_sequencing_time_ms' : IDL.Float64,
    'ordering_strategy' : IDL.Text,
    'average_batch_size' : IDL.Float64,
  });
  const SequencerBatchResult = IDL.Record({
    'fairness_score' : IDL.Float64,
    'batch_id' : IDL.Text,
    'sequencing_time_ms' : IDL.Nat64,
    'success' : IDL.Bool,
    'ordering_strategy' : IDL.Text,
    'transaction_count' : IDL.Nat64,
  });
  return IDL.Service({
    'add_transaction_to_sequencer' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'analyze_sequencing_benefits' : IDL.Func(
        [],
        [SequencingBenefits],
        ['query'],
      ),
    'create_transaction' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'create_transaction_sequencer' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'get_all_transactions' : IDL.Func(
        [],
        [IDL.Vec(PolyTransaction)],
        ['query'],
      ),
    'get_balance' : IDL.Func([IDL.Text], [IDL.Float64], ['query']),
    'get_block_by_hash' : IDL.Func([IDL.Text], [IDL.Opt(PolyBlock)], ['query']),
    'get_blockchain' : IDL.Func([], [IDL.Vec(PolyBlock)], ['query']),
    'get_blockchain_stats' : IDL.Func([], [BlockchainStats], ['query']),
    'get_layer2_advanced_metrics' : IDL.Func(
        [],
        [Layer2AdvancedMetrics],
        ['query'],
      ),
    'get_multi_chain_metrics' : IDL.Func([], [MultiChainMetrics], ['query']),
    'get_performance_metrics' : IDL.Func([], [PerformanceMetrics], ['query']),
    'get_recent_blocks' : IDL.Func(
        [IDL.Nat32],
        [IDL.Vec(PolyBlock)],
        ['query'],
      ),
    'get_sequencer_metrics' : IDL.Func([], [SequencerMetrics], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'sequence_transaction_batch' : IDL.Func(
        [IDL.Opt(IDL.Nat64)],
        [IDL.Variant({ 'Ok' : SequencerBatchResult, 'Err' : IDL.Text })],
        [],
      ),
    'test_pos_consensus' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
