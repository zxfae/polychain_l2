export const idlFactory = ({ IDL }) => {
  const BitcoinBalance = IDL.Record({
    'native_bitcoin' : IDL.Nat64,
    'wrapped_bitcoin' : IDL.Nat64,
    'total_bitcoin' : IDL.Nat64,
  });
  const VaultStats = IDL.Record({
    'total_deposits' : IDL.Nat64,
    'transaction_count' : IDL.Nat64,
    'native_count' : IDL.Nat64,
    'wrapped_count' : IDL.Nat64,
  });
  const PerformanceMetrics = IDL.Record({
    'transactions_per_second' : IDL.Nat32,
    'supported_algorithms' : IDL.Vec(IDL.Text),
    'quantum_resistant' : IDL.Bool,
    'bitcoin_integration' : IDL.Bool,
    'hybrid_vault_active' : IDL.Bool,
    'vault_statistics' : VaultStats,
  });
  const CryptoBenchmarkResult = IDL.Record({
    'algorithm' : IDL.Text,
    'total_time_ns' : IDL.Nat64,
    'quantum_resistant' : IDL.Bool,
    'success' : IDL.Bool,
    'message_length' : IDL.Nat64,
  });
  const CryptoEfficiency = IDL.Record({
    'ecdsa_efficiency' : IDL.Float64,
    'schnorr_efficiency' : IDL.Float64,
    'falcon_efficiency' : IDL.Float64,
    'mldsa_efficiency' : IDL.Float64,
    'best_algorithm' : IDL.Text,
    'worst_algorithm' : IDL.Text,
  });
  const Layer2AdvancedMetrics = IDL.Record({
    'quantum_threat_level' : IDL.Nat8,
    'security_score' : IDL.Float64,
    'crypto_efficiency' : CryptoEfficiency,
    'auto_selection_enabled' : IDL.Bool,
    'quantum_ready_percentage' : IDL.Float64,
    'threat_detection_active' : IDL.Bool,
    'adaptive_security_enabled' : IDL.Bool,
    'migration_readiness' : IDL.Float64,
    'total_quantum_transactions' : IDL.Nat64,
    'total_classical_transactions' : IDL.Nat64,
    'avg_risk_level' : IDL.Text,
    'performance_impact_quantum' : IDL.Float64,
  });
  const CryptoRecommendation = IDL.Record({
    'recommended_algorithm' : IDL.Text,
    'risk_level' : IDL.Text,
    'quantum_threat_level' : IDL.Nat8,
    'efficiency_score' : IDL.Float64,
    'security_rating' : IDL.Text,
    'reason' : IDL.Text,
    'alternative_algorithms' : IDL.Vec(IDL.Text),
  });
  const VaultStatistics = IDL.Record({
    'total_deposits_satoshi' : IDL.Nat64,
    'total_transactions' : IDL.Nat64,
    'native_addresses' : IDL.Nat32,
    'wrapped_addresses' : IDL.Nat32,
    'deposit_threshold' : IDL.Nat64,
    'vault_active' : IDL.Bool,
  });
  return IDL.Service({
    'create_transaction' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Float64],
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
    'get_balance' : IDL.Func([IDL.Text], [IDL.Float64], ['query']),
    'get_bitcoin_balance' : IDL.Func([IDL.Text], [BitcoinBalance], ['query']),
    'get_crypto_recommendation' : IDL.Func(
        [IDL.Nat64, IDL.Opt(IDL.Nat8), IDL.Opt(IDL.Bool)],
        [CryptoRecommendation],
        ['query'],
      ),
    'get_layer2_advanced_metrics' : IDL.Func([], [Layer2AdvancedMetrics], ['query']),
    'get_performance_metrics' : IDL.Func([], [PerformanceMetrics], ['query']),
    'get_vault_statistics' : IDL.Func([], [VaultStatistics], ['query']),
    'greet' : IDL.Func([IDL.Text], [IDL.Text], ['query']),
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
  });
};
export const init = ({ IDL }) => { return []; };