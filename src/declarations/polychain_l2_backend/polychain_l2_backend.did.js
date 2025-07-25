export const idlFactory = ({ IDL }) => {
  const PolyTransaction = IDL.Record({
    'signature' : IDL.Opt(IDL.Text),
    'hash' : IDL.Opt(IDL.Text),
    'recipient' : IDL.Text,
    'sender' : IDL.Text,
    'amount' : IDL.Float64,
    'time_stamp' : IDL.Int64,
  });
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
  const BatchConfig = IDL.Record({
    'compression_algorithm' : IDL.Text,
    'max_size' : IDL.Opt(IDL.Nat64),
    'priority' : IDL.Text,
  });
  const CryptoBenchmarkResult = IDL.Record({
    'algorithm' : IDL.Text,
    'message_length' : IDL.Nat64,
    'total_time_ns' : IDL.Nat64,
    'quantum_resistant' : IDL.Bool,
    'success' : IDL.Bool,
  });
  const DemoTransaction = IDL.Record({
    'id' : IDL.Text,
    'recipient' : IDL.Text,
    'sender' : IDL.Text,
    'timestamp' : IDL.Int64,
    'tx_type' : IDL.Text,
    'amount' : IDL.Float64,
  });
  const BitcoinBalance = IDL.Record({
    'total_bitcoin' : IDL.Nat64,
    'native_bitcoin' : IDL.Nat64,
    'wrapped_bitcoin' : IDL.Nat64,
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
  const CompressedBatch = IDL.Record({
    'algorithm' : IDL.Text,
    'batch_id' : IDL.Text,
    'created_at' : IDL.Int64,
    'compressed_size' : IDL.Nat64,
    'original_size' : IDL.Nat64,
    'transaction_count' : IDL.Nat32,
    'compression_ratio' : IDL.Float64,
  });
  const CompressionPerformanceMetrics = IDL.Record({
    'algorithm' : IDL.Text,
    'storage_savings_percentage' : IDL.Float64,
    'decompression_speed_mbps' : IDL.Float64,
    'total_batches_processed' : IDL.Nat64,
    'compression_speed_mbps' : IDL.Float64,
    'compression_ratio' : IDL.Float64,
    'average_batch_size' : IDL.Float64,
  });
  const CryptoRecommendation = IDL.Record({
    'efficiency_score' : IDL.Float64,
    'recommended_algorithm' : IDL.Text,
    'risk_level' : IDL.Text,
    'alternative_algorithms' : IDL.Vec(IDL.Text),
    'security_rating' : IDL.Text,
    'quantum_threat_level' : IDL.Nat8,
    'reason' : IDL.Text,
  });
  const EthereumBalance = IDL.Record({
    'native_ethereum' : IDL.Nat64,
    'wrapped_ethereum' : IDL.Nat64,
    'total_ethereum' : IDL.Nat64,
  });
  const IcpBalance = IDL.Record({
    'native_icp' : IDL.Nat64,
    'total_icp' : IDL.Nat64,
    'wrapped_icp' : IDL.Nat64,
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
  const SolanaBalance = IDL.Record({
    'wrapped_solana' : IDL.Nat64,
    'total_solana' : IDL.Nat64,
    'native_solana' : IDL.Nat64,
  });
  const VaultStatistics = IDL.Record({
    'total_deposits_satoshi' : IDL.Nat64,
    'vault_active' : IDL.Bool,
    'deposit_threshold' : IDL.Nat64,
    'total_transactions' : IDL.Nat64,
    'wrapped_addresses' : IDL.Nat32,
    'native_addresses' : IDL.Nat32,
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
    'analyze_icp_compression_benefits' : IDL.Func(
        [IDL.Vec(PolyTransaction)],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'analyze_sequencing_benefits' : IDL.Func(
        [],
        [SequencingBenefits],
        ['query'],
      ),
    'create_compressed_batch' : IDL.Func(
        [IDL.Vec(PolyTransaction), IDL.Opt(BatchConfig)],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
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
    'crypto_algorithm_benchmark' : IDL.Func(
        [IDL.Text, IDL.Text],
        [IDL.Variant({ 'Ok' : CryptoBenchmarkResult, 'Err' : IDL.Text })],
        [],
      ),
    'deposit_bitcoin' : IDL.Func(
        [IDL.Text, IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'deposit_bitcoin_with_crypto' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Opt(IDL.Text), IDL.Opt(IDL.Nat8)],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'deposit_ethereum' : IDL.Func(
        [IDL.Text, IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'deposit_icp' : IDL.Func(
        [IDL.Text, IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'deposit_solana' : IDL.Func(
        [IDL.Text, IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'fetch_real_icp_data' : IDL.Func(
        [IDL.Nat32],
        [IDL.Variant({ 'Ok' : IDL.Vec(DemoTransaction), 'Err' : IDL.Text })],
        [],
      ),
    'generate_realistic_demo_data' : IDL.Func(
        [IDL.Text, IDL.Nat32],
        [IDL.Variant({ 'Ok' : IDL.Vec(DemoTransaction), 'Err' : IDL.Text })],
        [],
      ),
    'get_all_transactions' : IDL.Func(
        [],
        [IDL.Vec(PolyTransaction)],
        ['query'],
      ),
    'get_api_performance_info' : IDL.Func([], [IDL.Text], ['query']),
    'get_balance' : IDL.Func([IDL.Text], [IDL.Float64], ['query']),
    'get_bitcoin_balance' : IDL.Func([IDL.Text], [BitcoinBalance], ['query']),
    'get_block_by_hash' : IDL.Func([IDL.Text], [IDL.Opt(PolyBlock)], ['query']),
    'get_blockchain' : IDL.Func([], [IDL.Vec(PolyBlock)], ['query']),
    'get_blockchain_stats' : IDL.Func([], [BlockchainStats], ['query']),
    'get_compressed_batch' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(CompressedBatch)],
        ['query'],
      ),
    'get_compression_performance_metrics' : IDL.Func(
        [],
        [CompressionPerformanceMetrics],
        ['query'],
      ),
    'get_crypto_recommendation' : IDL.Func(
        [IDL.Nat64, IDL.Opt(IDL.Nat8), IDL.Opt(IDL.Bool)],
        [CryptoRecommendation],
        ['query'],
      ),
    'get_ethereum_balance' : IDL.Func([IDL.Text], [EthereumBalance], ['query']),
    'get_icp_balance' : IDL.Func([IDL.Text], [IcpBalance], ['query']),
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
    'get_sequencer_created_blocks' : IDL.Func(
        [IDL.Opt(IDL.Nat32)],
        [IDL.Vec(PolyBlock)],
        ['query'],
      ),
    'get_sequencer_metrics' : IDL.Func([], [SequencerMetrics], ['query']),
    'get_solana_balance' : IDL.Func([IDL.Text], [SolanaBalance], ['query']),
    'get_vault_statistics' : IDL.Func([], [VaultStatistics], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
    'is_quantum_ready_all_chains' : IDL.Func([], [IDL.Bool], ['query']),
    'list_compressed_batches' : IDL.Func(
        [],
        [IDL.Vec(CompressedBatch)],
        ['query'],
      ),
    'run_compression_benchmark' : IDL.Func(
        [IDL.Vec(IDL.Nat32), IDL.Opt(IDL.Text)],
        [
          IDL.Variant({
            'Ok' : IDL.Vec(CompressionPerformanceMetrics),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'sequence_transaction_batch' : IDL.Func(
        [IDL.Opt(IDL.Nat64)],
        [IDL.Variant({ 'Ok' : SequencerBatchResult, 'Err' : IDL.Text })],
        [],
      ),
    'simulate_network_stress_test' : IDL.Func(
        [IDL.Vec(PolyTransaction), IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'test_pos_consensus' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'verify_transaction_in_blockchain' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64],
        [IDL.Opt(IDL.Text)],
        ['query'],
      ),
    'withdraw_bitcoin' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Bool],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'withdraw_bitcoin_adaptive' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Bool, IDL.Opt(IDL.Nat8)],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'withdraw_ethereum' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Bool],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'withdraw_icp' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Bool],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
    'withdraw_solana' : IDL.Func(
        [IDL.Text, IDL.Nat64, IDL.Bool],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Text })],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
