# API Documentation

## Candid Interfaces
### ./src/polychain_l2_backend/polychain_l2_backend.did
type SequencerBatchResult = record {
    success: bool;
    batch_id: text;
    transaction_count: nat64;
    sequencing_time_ms: nat64;
    ordering_strategy: text;
    fairness_score: float64;
};

type SequencerMetrics = record {
    total_transactions_sequenced: nat64;
    current_pending_count: nat64;
    average_batch_size: float64;
    total_batches_created: nat64;
    average_sequencing_time_ms: float64;
    fairness_score: float64;
    ordering_strategy: text;
};

type SequencingBenefits = record {
    mev_protection_score: float64;
    fairness_improvement: float64;
    throughput_improvement: float64;
    gas_savings_percentage: float64;
    front_running_prevention: bool;
    deterministic_ordering: bool;
    multi_chain_support: bool;
    recommended_strategy: text;
};

type PolyTransaction = record {
    sender: text;
    recipient: text;
    amount: float64;
    time_stamp: int64;
    signature: opt text;
    hash: opt text;
};

type PolyBlock = record {
    transactions: vec PolyTransaction;
    hash: text;
    previous_hash: text;
    timestamp: int64;
    nonce: nat64;
};

type BlockchainStats = record {
    total_blocks: nat64;
    total_transactions: nat64;
    latest_block_time: int64;
    average_tx_per_block: float64;
    chain_height: nat64;
};

type PerformanceMetrics = record {
    transactions_per_second: nat32;
    supported_algorithms: vec text;
    quantum_resistant: bool;
    bitcoin_integration: bool;
    hybrid_vault_active: bool;
    vault_statistics: VaultStats;
};

type VaultStats = record {
    total_deposits: float64;
    transaction_count: nat64;
    native_count: nat64;
    wrapped_count: nat64;
};

type Layer2AdvancedMetrics = record {
    quantum_threat_level: nat8;
    security_score: float64;
    crypto_efficiency: CryptoEfficiency;
    auto_selection_enabled: bool;
    quantum_ready_percentage: float64;
    threat_detection_active: bool;
    adaptive_security_enabled: bool;
    migration_readiness: float64;
    total_quantum_transactions: nat64;
    total_classical_transactions: nat64;
    avg_risk_level: text;
    performance_impact_quantum: float64;
};

type CryptoEfficiency = record {
    ecdsa_efficiency: float64;
    schnorr_efficiency: float64;
    falcon_efficiency: float64;
    mldsa_efficiency: float64;
    best_algorithm: text;
    worst_algorithm: text;
};

type MultiChainMetrics = record {
    supported_chains: vec text;
    total_bridges: nat32;
    cross_chain_volume_24h: float64;
    bridge_security_score: float64;
    average_bridge_time: float64;
    total_locked_value: float64;
    active_validators: nat32;
    bridge_uptime: float64;
};

type CompressionPerformanceMetrics = record {
    compression_ratio: float64;
    compression_speed_mbps: float64;
    decompression_speed_mbps: float64;
    algorithm: text;
    total_batches_processed: nat64;
    average_batch_size: float64;
    storage_savings_percentage: float64;
};

type CompressedBatch = record {
    batch_id: text;
    original_size: nat64;
    compressed_size: nat64;
    compression_ratio: float64;
    transaction_count: nat32;
    created_at: int64;
    algorithm: text;
};

type BatchConfig = record {
    compression_algorithm: text;
    priority: text;
    max_size: opt nat64;
};

type DemoTransaction = record {
    id: text;
    sender: text;
    recipient: text;
    amount: float64;
    timestamp: int64;
    tx_type: text;
};

type CryptoBenchmarkResult = record {
    algorithm: text;
    total_time_ns: nat64;
    quantum_resistant: bool;
    success: bool;
    message_length: nat64;
};

type BitcoinBalance = record {
    native_bitcoin: nat64;
    wrapped_bitcoin: nat64;
    total_bitcoin: nat64;
};

type EthereumBalance = record {
    native_ethereum: nat64;
    wrapped_ethereum: nat64;
    total_ethereum: nat64;
};

type IcpBalance = record {
    native_icp: nat64;
    wrapped_icp: nat64;
    total_icp: nat64;
};

type SolanaBalance = record {
    native_solana: nat64;
    wrapped_solana: nat64;
    total_solana: nat64;
};

type CryptoRecommendation = record {
    recommended_algorithm: text;
    risk_level: text;
    quantum_threat_level: nat8;
    efficiency_score: float64;
    security_rating: text;
    reason: text;
    alternative_algorithms: vec text;
};

type VaultStatistics = record {
    total_deposits_satoshi: nat64;
    total_transactions: nat64;
    native_addresses: nat32;
    wrapped_addresses: nat32;
    deposit_threshold: nat64;
    vault_active: bool;
};

service : {
    "greet": (text) -> (text) query;
    "get_balance": (text) -> (float64) query;
    "create_transaction": (text, text, float64) -> (variant { Ok : text; Err : text });
    
    // Performance & Metrics API functions
    "get_performance_metrics": () -> (PerformanceMetrics) query;
    "get_layer2_advanced_metrics": () -> (Layer2AdvancedMetrics) query;
    "get_multi_chain_metrics": () -> (MultiChainMetrics) query;
    
    // Sequencer API functions
    "create_transaction_sequencer": (text) -> (variant { Ok : text; Err : text });
    "add_transaction_to_sequencer": (text, text, float64) -> (variant { Ok : text; Err : text });
    "sequence_transaction_batch": (opt nat64) -> (variant { Ok : SequencerBatchResult; Err : text });
    "get_sequencer_metrics": () -> (SequencerMetrics) query;
    "analyze_sequencing_benefits": () -> (SequencingBenefits) query;
    "test_pos_consensus": () -> (variant { Ok : text; Err : text });
    
    // Blockchain Explorer API functions
    "get_blockchain": () -> (vec PolyBlock) query;
    "get_recent_blocks": (nat32) -> (vec PolyBlock) query;
    "get_block_by_hash": (text) -> (opt PolyBlock) query;
    "get_all_transactions": () -> (vec PolyTransaction) query;
    "get_blockchain_stats": () -> (BlockchainStats) query;
    "get_sequencer_created_blocks": (opt nat32) -> (vec PolyBlock) query;
    "verify_transaction_in_blockchain": (text, text, float64) -> (opt text) query;
    
    // Bitcoin Vault functions
    "deposit_bitcoin": (text, nat64) -> (variant { Ok : text; Err : text });
    "deposit_bitcoin_with_crypto": (text, nat64, opt text, opt nat8) -> (variant { Ok : text; Err : text });
    "get_bitcoin_balance": (text) -> (BitcoinBalance) query;
    "withdraw_bitcoin": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "withdraw_bitcoin_adaptive": (text, nat64, bool, opt nat8) -> (variant { Ok : text; Err : text });
    "get_crypto_recommendation": (nat64, opt nat8, opt bool) -> (CryptoRecommendation) query;
    "get_vault_statistics": () -> (VaultStatistics) query;
    
    // Ethereum functions
    "deposit_ethereum": (text, nat64) -> (variant { Ok : text; Err : text });
    "withdraw_ethereum": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "get_ethereum_balance": (text) -> (EthereumBalance) query;
    
    // ICP functions
    "deposit_icp": (text, nat64) -> (variant { Ok : text; Err : text });
    "withdraw_icp": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "get_icp_balance": (text) -> (IcpBalance) query;
    
    // Solana functions
    "deposit_solana": (text, nat64) -> (variant { Ok : text; Err : text });
    "withdraw_solana": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "get_solana_balance": (text) -> (SolanaBalance) query;
    
    // Crypto & Benchmark functions  
    "crypto_algorithm_benchmark": (text, text) -> (variant { Ok : CryptoBenchmarkResult; Err : text });
    
    // Compression functions
    "get_compression_performance_metrics": () -> (CompressionPerformanceMetrics) query;
    "list_compressed_batches": () -> (vec CompressedBatch) query;
    "get_compressed_batch": (text) -> (opt CompressedBatch) query;
    "create_compressed_batch": (vec PolyTransaction, opt BatchConfig) -> (variant { Ok : text; Err : text });
    "run_compression_benchmark": (vec nat32, opt text) -> (variant { Ok : vec CompressionPerformanceMetrics; Err : text });
    "generate_realistic_demo_data": (text, nat32) -> (variant { Ok : vec DemoTransaction; Err : text });
    "fetch_real_icp_data": (nat32) -> (variant { Ok : vec DemoTransaction; Err : text });
    "simulate_network_stress_test": (vec PolyTransaction, text) -> (variant { Ok : text; Err : text });
    "analyze_icp_compression_benefits": (vec PolyTransaction) -> (variant { Ok : text; Err : text });
    "get_api_performance_info": () -> (text) query;
    
    // Quantum readiness
    "is_quantum_ready_all_chains": () -> (bool) query;
}
### ./src/declarations/polychain_l2_backend/polychain_l2_backend.did
type SequencerBatchResult = record {
    success: bool;
    batch_id: text;
    transaction_count: nat64;
    sequencing_time_ms: nat64;
    ordering_strategy: text;
    fairness_score: float64;
};

type SequencerMetrics = record {
    total_transactions_sequenced: nat64;
    current_pending_count: nat64;
    average_batch_size: float64;
    total_batches_created: nat64;
    average_sequencing_time_ms: float64;
    fairness_score: float64;
    ordering_strategy: text;
};

type SequencingBenefits = record {
    mev_protection_score: float64;
    fairness_improvement: float64;
    throughput_improvement: float64;
    gas_savings_percentage: float64;
    front_running_prevention: bool;
    deterministic_ordering: bool;
    multi_chain_support: bool;
    recommended_strategy: text;
};

type PolyTransaction = record {
    sender: text;
    recipient: text;
    amount: float64;
    time_stamp: int64;
    signature: opt text;
    hash: opt text;
};

type PolyBlock = record {
    transactions: vec PolyTransaction;
    hash: text;
    previous_hash: text;
    timestamp: int64;
    nonce: nat64;
};

type BlockchainStats = record {
    total_blocks: nat64;
    total_transactions: nat64;
    latest_block_time: int64;
    average_tx_per_block: float64;
    chain_height: nat64;
};

type PerformanceMetrics = record {
    transactions_per_second: nat32;
    supported_algorithms: vec text;
    quantum_resistant: bool;
    bitcoin_integration: bool;
    hybrid_vault_active: bool;
    vault_statistics: VaultStats;
};

type VaultStats = record {
    total_deposits: float64;
    transaction_count: nat64;
    native_count: nat64;
    wrapped_count: nat64;
};

type Layer2AdvancedMetrics = record {
    quantum_threat_level: nat8;
    security_score: float64;
    crypto_efficiency: CryptoEfficiency;
    auto_selection_enabled: bool;
    quantum_ready_percentage: float64;
    threat_detection_active: bool;
    adaptive_security_enabled: bool;
    migration_readiness: float64;
    total_quantum_transactions: nat64;
    total_classical_transactions: nat64;
    avg_risk_level: text;
    performance_impact_quantum: float64;
};

type CryptoEfficiency = record {
    ecdsa_efficiency: float64;
    schnorr_efficiency: float64;
    falcon_efficiency: float64;
    mldsa_efficiency: float64;
    best_algorithm: text;
    worst_algorithm: text;
};

type MultiChainMetrics = record {
    supported_chains: vec text;
    total_bridges: nat32;
    cross_chain_volume_24h: float64;
    bridge_security_score: float64;
    average_bridge_time: float64;
    total_locked_value: float64;
    active_validators: nat32;
    bridge_uptime: float64;
};

type CompressionPerformanceMetrics = record {
    compression_ratio: float64;
    compression_speed_mbps: float64;
    decompression_speed_mbps: float64;
    algorithm: text;
    total_batches_processed: nat64;
    average_batch_size: float64;
    storage_savings_percentage: float64;
};

type CompressedBatch = record {
    batch_id: text;
    original_size: nat64;
    compressed_size: nat64;
    compression_ratio: float64;
    transaction_count: nat32;
    created_at: int64;
    algorithm: text;
};

type BatchConfig = record {
    compression_algorithm: text;
    priority: text;
    max_size: opt nat64;
};

type DemoTransaction = record {
    id: text;
    sender: text;
    recipient: text;
    amount: float64;
    timestamp: int64;
    tx_type: text;
};

type CryptoBenchmarkResult = record {
    algorithm: text;
    total_time_ns: nat64;
    quantum_resistant: bool;
    success: bool;
    message_length: nat64;
};

type BitcoinBalance = record {
    native_bitcoin: nat64;
    wrapped_bitcoin: nat64;
    total_bitcoin: nat64;
};

type EthereumBalance = record {
    native_ethereum: nat64;
    wrapped_ethereum: nat64;
    total_ethereum: nat64;
};

type IcpBalance = record {
    native_icp: nat64;
    wrapped_icp: nat64;
    total_icp: nat64;
};

type SolanaBalance = record {
    native_solana: nat64;
    wrapped_solana: nat64;
    total_solana: nat64;
};

type CryptoRecommendation = record {
    recommended_algorithm: text;
    risk_level: text;
    quantum_threat_level: nat8;
    efficiency_score: float64;
    security_rating: text;
    reason: text;
    alternative_algorithms: vec text;
};

type VaultStatistics = record {
    total_deposits_satoshi: nat64;
    total_transactions: nat64;
    native_addresses: nat32;
    wrapped_addresses: nat32;
    deposit_threshold: nat64;
    vault_active: bool;
};

service : {
    "greet": (text) -> (text) query;
    "get_balance": (text) -> (float64) query;
    "create_transaction": (text, text, float64) -> (variant { Ok : text; Err : text });
    
    // Performance & Metrics API functions
    "get_performance_metrics": () -> (PerformanceMetrics) query;
    "get_layer2_advanced_metrics": () -> (Layer2AdvancedMetrics) query;
    "get_multi_chain_metrics": () -> (MultiChainMetrics) query;
    
    // Sequencer API functions
    "create_transaction_sequencer": (text) -> (variant { Ok : text; Err : text });
    "add_transaction_to_sequencer": (text, text, float64) -> (variant { Ok : text; Err : text });
    "sequence_transaction_batch": (opt nat64) -> (variant { Ok : SequencerBatchResult; Err : text });
    "get_sequencer_metrics": () -> (SequencerMetrics) query;
    "analyze_sequencing_benefits": () -> (SequencingBenefits) query;
    "test_pos_consensus": () -> (variant { Ok : text; Err : text });
    
    // Blockchain Explorer API functions
    "get_blockchain": () -> (vec PolyBlock) query;
    "get_recent_blocks": (nat32) -> (vec PolyBlock) query;
    "get_block_by_hash": (text) -> (opt PolyBlock) query;
    "get_all_transactions": () -> (vec PolyTransaction) query;
    "get_blockchain_stats": () -> (BlockchainStats) query;
    "get_sequencer_created_blocks": (opt nat32) -> (vec PolyBlock) query;
    "verify_transaction_in_blockchain": (text, text, float64) -> (opt text) query;
    
    // Bitcoin Vault functions
    "deposit_bitcoin": (text, nat64) -> (variant { Ok : text; Err : text });
    "deposit_bitcoin_with_crypto": (text, nat64, opt text, opt nat8) -> (variant { Ok : text; Err : text });
    "get_bitcoin_balance": (text) -> (BitcoinBalance) query;
    "withdraw_bitcoin": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "withdraw_bitcoin_adaptive": (text, nat64, bool, opt nat8) -> (variant { Ok : text; Err : text });
    "get_crypto_recommendation": (nat64, opt nat8, opt bool) -> (CryptoRecommendation) query;
    "get_vault_statistics": () -> (VaultStatistics) query;
    
    // Ethereum functions
    "deposit_ethereum": (text, nat64) -> (variant { Ok : text; Err : text });
    "withdraw_ethereum": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "get_ethereum_balance": (text) -> (EthereumBalance) query;
    
    // ICP functions
    "deposit_icp": (text, nat64) -> (variant { Ok : text; Err : text });
    "withdraw_icp": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "get_icp_balance": (text) -> (IcpBalance) query;
    
    // Solana functions
    "deposit_solana": (text, nat64) -> (variant { Ok : text; Err : text });
    "withdraw_solana": (text, nat64, bool) -> (variant { Ok : text; Err : text });
    "get_solana_balance": (text) -> (SolanaBalance) query;
    
    // Crypto & Benchmark functions  
    "crypto_algorithm_benchmark": (text, text) -> (variant { Ok : CryptoBenchmarkResult; Err : text });
    
    // Compression functions
    "get_compression_performance_metrics": () -> (CompressionPerformanceMetrics) query;
    "list_compressed_batches": () -> (vec CompressedBatch) query;
    "get_compressed_batch": (text) -> (opt CompressedBatch) query;
    "create_compressed_batch": (vec PolyTransaction, opt BatchConfig) -> (variant { Ok : text; Err : text });
    "run_compression_benchmark": (vec nat32, opt text) -> (variant { Ok : vec CompressionPerformanceMetrics; Err : text });
    "generate_realistic_demo_data": (text, nat32) -> (variant { Ok : vec DemoTransaction; Err : text });
    "fetch_real_icp_data": (nat32) -> (variant { Ok : vec DemoTransaction; Err : text });
    "simulate_network_stress_test": (vec PolyTransaction, text) -> (variant { Ok : text; Err : text });
    "analyze_icp_compression_benefits": (vec PolyTransaction) -> (variant { Ok : text; Err : text });
    "get_api_performance_info": () -> (text) query;
    
    // Quantum readiness
    "is_quantum_ready_all_chains": () -> (bool) query;
}
### ./src/declarations/polychain_l2_frontend/polychain_l2_frontend.did
type BatchId = nat;
type ChunkId = nat;
type Key = text;
type Time = int;

type CreateAssetArguments = record {
  key: Key;
  content_type: text;
  max_age: opt nat64;
  headers: opt vec HeaderField;
  enable_aliasing: opt bool;
  allow_raw_access: opt bool;
};

// Add or change content for an asset, by content encoding
type SetAssetContentArguments = record {
  key: Key;
  content_encoding: text;
  chunk_ids: vec ChunkId;
  last_chunk: opt blob;
  sha256: opt blob;
};

// Remove content for an asset, by content encoding
type UnsetAssetContentArguments = record {
  key: Key;
  content_encoding: text;
};

// Delete an asset
type DeleteAssetArguments = record {
  key: Key;
};

// Reset everything
type ClearArguments = record {};

type BatchOperationKind = variant {
  CreateAsset: CreateAssetArguments;
  SetAssetContent: SetAssetContentArguments;

  SetAssetProperties: SetAssetPropertiesArguments;

  UnsetAssetContent: UnsetAssetContentArguments;
  DeleteAsset: DeleteAssetArguments;

  Clear: ClearArguments;
};

type CommitBatchArguments = record {
  batch_id: BatchId;
  operations: vec BatchOperationKind
};

type CommitProposedBatchArguments = record {
  batch_id: BatchId;
  evidence: blob;
};

type ComputeEvidenceArguments = record {
  batch_id: BatchId;
  max_iterations: opt nat16
};

type DeleteBatchArguments = record {
  batch_id: BatchId;
};

type HeaderField = record { text; text; };

type HttpRequest = record {
  method: text;
  url: text;
  headers: vec HeaderField;
  body: blob;
  certificate_version: opt nat16;
};

type HttpResponse = record {
  status_code: nat16;
  headers: vec HeaderField;
  body: blob;
  streaming_strategy: opt StreamingStrategy;
  upgrade: opt bool;
};

type StreamingCallbackHttpResponse = record {
  body: blob;
  token: opt StreamingCallbackToken;
};

type StreamingCallbackToken = record {
  key: Key;
  content_encoding: text;
  index: nat;
  sha256: opt blob;
};

type StreamingStrategy = variant {
  Callback: record {
    callback: func (StreamingCallbackToken) -> (opt StreamingCallbackHttpResponse) query;
    token: StreamingCallbackToken;
  };
};

type SetAssetPropertiesArguments = record {
  key: Key;
  max_age: opt opt nat64;
  headers: opt opt vec HeaderField;
  allow_raw_access: opt opt bool;
  is_aliased: opt opt bool;
};

type ConfigurationResponse = record {
  max_batches: opt nat64;
  max_chunks: opt nat64;
  max_bytes: opt nat64;
};

type ConfigureArguments = record {
  max_batches: opt opt nat64;
  max_chunks: opt opt nat64;
  max_bytes: opt opt nat64;
};

type Permission = variant {
  Commit;
  ManagePermissions;
  Prepare;
};

type GrantPermission = record {
  to_principal: principal;
  permission: Permission;
};
type RevokePermission = record {
  of_principal: principal;
  permission: Permission;
};
type ListPermitted = record { permission: Permission };

type ValidationResult = variant { Ok : text; Err : text };

type AssetCanisterArgs = variant {
  Init: InitArgs;
  Upgrade: UpgradeArgs;
};

type InitArgs = record {
  set_permissions: opt SetPermissions;
};

type UpgradeArgs = record {
  set_permissions: opt SetPermissions;
};

/// Sets the list of principals granted each permission.
type SetPermissions = record {
  prepare: vec principal;
  commit: vec principal;
  manage_permissions: vec principal;
};

service: (asset_canister_args: opt AssetCanisterArgs) -> {
  api_version: () -> (nat16) query;

  get: (record {
    key: Key;
    accept_encodings: vec text;
  }) -> (record {
    content: blob; // may be the entirety of the content, or just chunk index 0
    content_type: text;
    content_encoding: text;
    sha256: opt blob; // sha256 of entire asset encoding, calculated by dfx and passed in SetAssetContentArguments
    total_length: nat; // all chunks except last have size == content.size()
  }) query;

  // if get() returned chunks > 1, call this to retrieve them.
  // chunks may or may not be split up at the same boundaries as presented to create_chunk().
  get_chunk: (record {
    key: Key;
    content_encoding: text;
    index: nat;
    sha256: opt blob;  // sha256 of entire asset encoding, calculated by dfx and passed in SetAssetContentArguments
  }) -> (record { content: blob }) query;

  list : (record {}) -> (vec record {
    key: Key;
    content_type: text;
    encodings: vec record {
      content_encoding: text;
      sha256: opt blob; // sha256 of entire asset encoding, calculated by dfx and passed in SetAssetContentArguments
      length: nat; // Size of this encoding's blob. Calculated when uploading assets.
      modified: Time;
    };
  }) query;

  certified_tree : (record {}) -> (record {
    certificate: blob;
    tree: blob;
  }) query;

  create_batch : (record {}) -> (record { batch_id: BatchId });

  create_chunk: (record { batch_id: BatchId; content: blob }) -> (record { chunk_id: ChunkId });
  create_chunks: (record { batch_id: BatchId; content: vec blob }) -> (record { chunk_ids: vec ChunkId });

  // Perform all operations successfully, or reject
  commit_batch: (CommitBatchArguments) -> ();

  // Save the batch operations for later commit
  propose_commit_batch: (CommitBatchArguments) -> ();

  // Given a batch already proposed, perform all operations successfully, or reject
  commit_proposed_batch: (CommitProposedBatchArguments) -> ();

  // Compute a hash over the CommitBatchArguments.  Call until it returns Some(evidence).
  compute_evidence: (ComputeEvidenceArguments) -> (opt blob);

  // Delete a batch that has been created, or proposed for commit, but not yet committed
  delete_batch: (DeleteBatchArguments) -> ();

  create_asset: (CreateAssetArguments) -> ();
  set_asset_content: (SetAssetContentArguments) -> ();
  unset_asset_content: (UnsetAssetContentArguments) -> ();

  delete_asset: (DeleteAssetArguments) -> ();

  clear: (ClearArguments) -> ();

  // Single call to create an asset with content for a single content encoding that
  // fits within the message ingress limit.
  store: (record {
    key: Key;
    content_type: text;
    content_encoding: text;
    content: blob;
    sha256: opt blob
  }) -> ();

  http_request: (request: HttpRequest) -> (HttpResponse) query;
  http_request_streaming_callback: (token: StreamingCallbackToken) -> (opt StreamingCallbackHttpResponse) query;

  authorize: (principal) -> ();
  deauthorize: (principal) -> ();
  list_authorized: () -> (vec principal);
  grant_permission: (GrantPermission) -> ();
  revoke_permission: (RevokePermission) -> ();
  list_permitted: (ListPermitted) -> (vec principal);
  take_ownership: () -> ();

  get_asset_properties : (key: Key) -> (record {
    max_age: opt nat64;
    headers: opt vec HeaderField;
    allow_raw_access: opt bool;
    is_aliased: opt bool; } ) query;
  set_asset_properties: (SetAssetPropertiesArguments) -> ();

  get_configuration: () -> (ConfigurationResponse);
  configure: (ConfigureArguments) -> ();

  validate_grant_permission: (GrantPermission) -> (ValidationResult);
  validate_revoke_permission: (RevokePermission) -> (ValidationResult);
  validate_take_ownership: () -> (ValidationResult);
  validate_commit_proposed_batch: (CommitProposedBatchArguments) -> (ValidationResult);
  validate_configure: (ConfigureArguments) -> (ValidationResult);
}
### ./src/declarations/internet_identity/internet_identity.did
type UserNumber = nat64;
type AccountNumber = nat64;
type PublicKey = blob;
type CredentialId = blob;
type DeviceKey = PublicKey;
type UserKey = PublicKey;
type SessionKey = PublicKey;
type FrontendHostname = text;
type Timestamp = nat64;

type HeaderField = record {
    text;
    text;
};

type HttpRequest = record {
    method : text;
    url : text;
    headers : vec HeaderField;
    body : blob;
    certificate_version : opt nat16;
};

type HttpResponse = record {
    status_code : nat16;
    headers : vec HeaderField;
    body : blob;
    upgrade : opt bool;
    streaming_strategy : opt StreamingStrategy;
};

type StreamingCallbackHttpResponse = record {
    body : blob;
    token : opt Token;
};

type Token = record {};

type StreamingStrategy = variant {
    Callback : record {
        callback : func(Token) -> (StreamingCallbackHttpResponse) query;
        token : Token;
    };
};

type Purpose = variant {
    recovery;
    authentication;
};

type KeyType = variant {
    unknown;
    platform;
    cross_platform;
    seed_phrase;
    browser_storage_key;
};

// This describes whether a device is "protected" or not.
// When protected, a device can only be updated or removed if the
// user is authenticated with that very device.
type DeviceProtection = variant {
    protected;
    unprotected;
};

type Challenge = record {
    png_base64 : text;
    challenge_key : ChallengeKey;
};

type DeviceData = record {
    pubkey : DeviceKey;
    alias : text;
    credential_id : opt CredentialId;
    purpose : Purpose;
    key_type : KeyType;
    protection : DeviceProtection;
    origin : opt text;
    // Metadata map for additional device information.
    //
    // Note: some fields above will be moved to the metadata map in the future.
    // All field names of `DeviceData` (such as 'alias', 'origin, etc.) are
    // reserved and cannot be written.
    // In addition, the keys "usage" and "authenticator_attachment" are reserved as well.
    metadata : opt MetadataMap;
};

// The same as `DeviceData` but with the `last_usage` field.
// This field cannot be written, hence the separate type.
type DeviceWithUsage = record {
    pubkey : DeviceKey;
    alias : text;
    credential_id : opt CredentialId;
    purpose : Purpose;
    key_type : KeyType;
    protection : DeviceProtection;
    origin : opt text;
    last_usage : opt Timestamp;
    metadata : opt MetadataMap;
};

type DeviceKeyWithAnchor = record {
    pubkey : DeviceKey;
    anchor_number : UserNumber;
};

// Map with some variants for the value type.
// Note, due to the Candid mapping this must be a tuple type thus we cannot name the fields `key` and `value`.
type MetadataMap = vec record {
    text;
    variant { map : MetadataMap; string : text; bytes : vec nat8 };
};

type RegisterResponse = variant {
    // A new user was successfully registered.
    registered : record {
        user_number : UserNumber;
    };
    // No more registrations are possible in this instance of the II service canister.
    canister_full;
    // The challenge was not successful.
    bad_challenge;
};

type AddTentativeDeviceResponse = variant {
    // The device was tentatively added.
    added_tentatively : record {
        verification_code : text;
        // Expiration date, in nanos since the epoch
        device_registration_timeout : Timestamp;
    };
    // Device registration mode is off, either due to timeout or because it was never enabled.
    device_registration_mode_off;
    // There is another device already added tentatively
    another_device_tentatively_added;
};

type VerifyTentativeDeviceResponse = variant {
    // The device was successfully verified.
    verified;
    // Wrong verification code entered. Retry with correct code.
    wrong_code : record {
        retries_left : nat8;
    };
    // Device registration mode is off, either due to timeout or because it was never enabled.
    device_registration_mode_off;
    // There is no tentative device to be verified.
    no_device_to_verify;
};

type Delegation = record {
    pubkey : PublicKey;
    expiration : Timestamp;
    targets : opt vec principal;
};

type SignedDelegation = record {
    delegation : Delegation;
    signature : blob;
};

type GetDelegationResponse = variant {
    // The signed delegation was successfully retrieved.
    signed_delegation : SignedDelegation;

    // The signature is not ready. Maybe retry by calling `prepare_delegation`
    no_such_delegation;
};

type InternetIdentityStats = record {
    users_registered : nat64;
    storage_layout_version : nat8;
    assigned_user_number_range : record {
        nat64;
        nat64;
    };
    archive_info : ArchiveInfo;
    canister_creation_cycles_cost : nat64;
    // Map from event aggregation to a sorted list of top 100 sub-keys to their weights.
    // Example: {"prepare_delegation_count 24h ic0.app": [{"https://dapp.com", 100}, {"https://dapp2.com", 50}]}
    event_aggregations : vec record { text; vec record { text; nat64 } };
};

// Configuration parameters related to the archive.
type ArchiveConfig = record {
    // The allowed module hash of the archive canister.
    // Changing this parameter does _not_ deploy the archive, but enable archive deployments with the
    // corresponding wasm module.
    module_hash : blob;
    // Buffered archive entries limit. If reached, II will stop accepting new anchor operations
    // until the buffered operations are acknowledged by the archive.
    entries_buffer_limit : nat64;
    // The maximum number of entries to be transferred to the archive per call.
    entries_fetch_limit : nat16;
    // Polling interval to fetch new entries from II (in nanoseconds).
    // Changes to this parameter will only take effect after an archive deployment.
    polling_interval_ns : nat64;
};

// Information about the archive.
type ArchiveInfo = record {
    // Canister id of the archive or empty if no archive has been deployed yet.
    archive_canister : opt principal;
    // Configuration parameters related to the II archive.
    archive_config : opt ArchiveConfig;
};

// Rate limit configuration.
// Currently only used for `register`.
type RateLimitConfig = record {
    // Time it takes (in ns) for a rate limiting token to be replenished.
    time_per_token_ns : nat64;
    // How many tokens are at most generated (to accommodate peaks).
    max_tokens : nat64;
};

// Captcha configuration
// Default:
// - max_unsolved_captchas: 500
// - captcha_trigger: Static, CaptchaEnabled
type CaptchaConfig = record {
    // Maximum number of unsolved captchas.
    max_unsolved_captchas : nat64;
    // Configuration for when captcha protection should kick in.
    captcha_trigger : variant {
        // Based on the rate of registrations compared to some reference time frame and allowing some leeway.
        Dynamic : record {
            // Percentage of increased registration rate observed in the current rate sampling interval (compared to
            // reference rate) at which II will enable captcha for new registrations.
            threshold_pct : nat16;
            // Length of the interval in seconds used to sample the current rate of registrations.
            current_rate_sampling_interval_s : nat64;
            // Length of the interval in seconds used to sample the reference rate of registrations.
            reference_rate_sampling_interval_s : nat64;
        };
        // Statically enable / disable captcha
        Static : variant {
            CaptchaEnabled;
            CaptchaDisabled;
        };
    };
};

// Init arguments of II which can be supplied on install and upgrade.
//
// Each field is wrapped is `opt` to indicate whether the field should
// keep the previous value or update to a new value (e.g. `null` keeps the previous value).
//
// Some fields, like `openid_google`, have an additional nested `opt`, this indicates
// enable/disable status (e.g. `opt null` disables a feature while `null` leaves it untouched).
type InternetIdentityInit = record {
    // Set lowest and highest anchor
    assigned_user_number_range : opt record {
        nat64;
        nat64;
    };
    // Configuration parameters related to the II archive.
    // Note: some parameters changes (like the polling interval) will only take effect after an archive deployment.
    // See ArchiveConfig for details.
    archive_config : opt ArchiveConfig;
    // Set the amounts of cycles sent with the create canister message.
    // This is configurable because in the staging environment cycles are required.
    // The canister creation cost on mainnet is currently 100'000'000'000 cycles. If this value is higher thant the
    // canister creation cost, the newly created canister will keep extra cycles.
    canister_creation_cycles_cost : opt nat64;
    // Rate limit for the `register` call.
    register_rate_limit : opt RateLimitConfig;
    // Configuration of the captcha in the registration flow.
    captcha_config : opt CaptchaConfig;
    // Configuration for Related Origins Requests.
    // If present, list of origins from where registration is allowed.
    related_origins : opt vec text;
    // Configuration for New Origin Flows.
    // If present, list of origins using the new authentication flow.
    new_flow_origins : opt vec text;
    // Configuration for OpenID Google client
    openid_google : opt opt OpenIdConfig;
    // Configuration for Web Analytics
    analytics_config : opt opt AnalyticsConfig;
    // Configuration to fetch root key or not from frontend assets
    fetch_root_key : opt bool;
    // Configuration to show dapps explorer or not
    enable_dapps_explorer : opt bool;
    // Configuration to set the canister as production mode.
    // For now, this is used only to show or hide the banner.
    is_production : opt bool;
    // Configuration for dummy authentication used in e2e tests.
    dummy_auth : opt opt DummyAuthConfig;
};

type ChallengeKey = text;

type ChallengeResult = record {
    key : ChallengeKey;
    chars : text;
};
type CaptchaResult = ChallengeResult;

// Extra information about registration status for new devices
type DeviceRegistrationInfo = record {
    // If present, the user has tentatively added a new device. This
    // new device needs to be verified (see relevant endpoint) before
    // 'expiration'.
    tentative_device : opt DeviceData;
    // The timestamp at which the anchor will turn off registration mode
    // (and the tentative device will be forgotten, if any, and if not verified)
    expiration : Timestamp;
};

// Information about the anchor
type IdentityAnchorInfo = record {
    // All devices that can authenticate to this anchor
    devices : vec DeviceWithUsage;
    // Device registration status used when adding devices, see DeviceRegistrationInfo
    device_registration : opt DeviceRegistrationInfo;
    // OpenID accounts linked to this anchor
    openid_credentials : opt vec OpenIdCredential;
    // The name of the Internet Identity
    name : opt text;
};

type AnchorCredentials = record {
    credentials : vec WebAuthnCredential;
    recovery_credentials : vec WebAuthnCredential;
    recovery_phrases : vec PublicKey;
};

type WebAuthnCredential = record {
    credential_id : CredentialId;
    pubkey : PublicKey;
};

type DeployArchiveResult = variant {
    // The archive was deployed successfully and the supplied wasm module has been installed. The principal of the archive
    // canister is returned.
    success : principal;
    // Initial archive creation is already in progress.
    creation_in_progress;
    // Archive deployment failed. An error description is returned.
    failed : text;
};

type BufferedArchiveEntry = record {
    anchor_number : UserNumber;
    timestamp : Timestamp;
    sequence_number : nat64;
    entry : blob;
};

// OpenID specific types

type Iss = text;
type Sub = text;
type Aud = text;
type JWT = text;
type Salt = blob;

type OpenIdConfig = record {
    client_id : text;
};

type OpenIdCredentialKey = record { Iss; Sub };

type AnalyticsConfig = variant {
    Plausible : record {
        domain : opt text;
        hash_mode : opt bool;
        track_localhost : opt bool;
        api_host : opt text;
    };
};

type OpenIdCredential = record {
    iss : Iss;
    sub : Sub;
    aud : Aud;
    last_usage_timestamp : opt Timestamp;
    metadata : MetadataMapV2;
};

type OpenIdCredentialAddError = variant {
    Unauthorized : principal;
    JwtVerificationFailed;
    OpenIdCredentialAlreadyRegistered;
    InternalCanisterError : text;
    JwtExpired;
};

type OpenIdCredentialRemoveError = variant {
    Unauthorized : principal;
    OpenIdCredentialNotFound;
    InternalCanisterError : text;
};

type OpenIdDelegationError = variant {
    NoSuchAnchor;
    JwtVerificationFailed;
    NoSuchDelegation;
    JwtExpired;
};

type OpenIdPrepareDelegationResponse = record {
    user_key : UserKey;
    expiration : Timestamp;
    anchor_number : UserNumber;
};

// API V2 specific types
// WARNING: These type are experimental and may change in the future.

type IdentityNumber = nat64;

// Map with some variants for the value type.
// Note, due to the Candid mapping this must be a tuple type thus we cannot name the fields `key` and `value`.
type MetadataMapV2 = vec record {
    text;
    variant { Map : MetadataMapV2; String : text; Bytes : vec nat8 };
};

// Authentication method using WebAuthn signatures
// See https://www.w3.org/TR/webauthn-2/
// This is a separate type because WebAuthn requires to also store
// the credential id (in addition to the public key).
type WebAuthn = record {
    credential_id : CredentialId;
    pubkey : PublicKey;
};

// Authentication method using generic signatures
// See https://internetcomputer.org/docs/current/references/ic-interface-spec/#signatures for
// supported signature schemes.
type PublicKeyAuthn = record {
    pubkey : PublicKey;
};

// The authentication methods currently supported by II.
type AuthnMethod = variant {
    WebAuthn : WebAuthn;
    PubKey : PublicKeyAuthn;
};

// This describes whether an authentication method is "protected" or not.
// When protected, a authentication method can only be updated or removed if the
// user is authenticated with that very authentication method.
type AuthnMethodProtection = variant {
    Protected;
    Unprotected;
};

type AuthnMethodPurpose = variant {
    Recovery;
    Authentication;
};

type AuthnMethodSecuritySettings = record {
    protection : AuthnMethodProtection;
    purpose : AuthnMethodPurpose;
};

type AuthnMethodData = record {
    authn_method : AuthnMethod;
    security_settings : AuthnMethodSecuritySettings;
    // contains the following fields of the DeviceWithUsage type:
    // - alias
    // - origin
    // - authenticator_attachment: data taken from key_type and reduced to "platform", "cross_platform" or absent on migration
    // - usage: data taken from key_type and reduced to "recovery_phrase", "browser_storage_key" or absent on migration
    // Note: for compatibility reasons with the v1 API, the entries above (if present)
    // must be of the `String` variant. This restriction may be lifted in the future.
    metadata : MetadataMapV2;
    last_authentication : opt Timestamp;
};

type OpenIDRegFinishArg = record {
    jwt : JWT;
    salt : Salt;
};

// Extra information about registration status for new authentication methods
type AuthnMethodRegistrationInfo = record {
    // If present, the user has registered a new authentication method. This
    // new authentication needs to be verified before 'expiration' in order to
    // be added to the identity.
    authn_method : opt AuthnMethodData;
    // The timestamp at which the identity will turn off registration mode
    // (and the authentication method will be forgotten, if any, and if not verified)
    expiration : Timestamp;
};

type AuthnMethodConfirmationCode = record {
    confirmation_code : text;
    expiration : Timestamp;
};

type RegistrationId = text;

type AuthnMethodRegisterError = variant {
    // Authentication method registration mode is off, either due to timeout or because it was never enabled.
    RegistrationModeOff;
    // There is another authentication method already registered that needs to be confirmed first.
    RegistrationAlreadyInProgress;
    // The metadata of the provided authentication method contains invalid entries.
    InvalidMetadata : text;
};

type AuthnMethodConfirmationError = variant {
    // Wrong confirmation code entered. Retry with correct code.
    WrongCode : record {
        retries_left : nat8;
    };
    // Authentication method registration mode is off, either due to timeout or because it was never enabled.
    RegistrationModeOff;
    // There is no registered authentication method to be confirmed.
    NoAuthnMethodToConfirm;
};

type AuthnMethodRegistrationModeEnterError = variant { 
    InvalidRegistrationId : text;
    Unauthorized : principal;
    AlreadyInProgress;
    InternalError : text;
};

type LookupByRegistrationIdError = variant {
    InvalidRegistrationId : text;
};

type IdentityAuthnInfo = record {
    authn_methods : vec AuthnMethod;
    recovery_authn_methods : vec AuthnMethod;
};

type IdentityInfo = record {
    authn_methods : vec AuthnMethodData;
    authn_method_registration : opt AuthnMethodRegistrationInfo;
    openid_credentials : opt vec OpenIdCredential;
    // Authentication method independent metadata
    metadata : MetadataMapV2;
    name : opt text;
};

type IdentityInfoError = variant {
    // The principal is not authorized to call this method with the given arguments.
    Unauthorized : principal;
    // Internal canister error. See the error message for details.
    InternalCanisterError : text;
};

type AuthnMethodAddError = variant {
    InvalidMetadata : text;
};

type AuthnMethodReplaceError = variant {
    InvalidMetadata : text;
    // No authentication method found with the given public key.
    AuthnMethodNotFound;
};

type AuthnMethodMetadataReplaceError = variant {
    InvalidMetadata : text;
    // No authentication method found with the given public key.
    AuthnMethodNotFound;
};

type AuthnMethodSecuritySettingsReplaceError = variant {
    // No authentication method found with the given public key.
    AuthnMethodNotFound;
};

type IdentityMetadataReplaceError = variant {
    // The principal is not authorized to call this method with the given arguments.
    Unauthorized : principal;
    // The identity including the new metadata exceeds the maximum allowed size.
    StorageSpaceExceeded : record {
        space_available : nat64;
        space_required : nat64;
    };
    // Internal canister error. See the error message for details.
    InternalCanisterError : text;
};

type CreateAccountError = variant {
    InternalCanisterError : text;
    AccountLimitReached;
    Unauthorized : principal;
    NameTooLong;
};

type UpdateAccountError = variant {
    InternalCanisterError : text;
    AccountLimitReached;
    Unauthorized : principal;
    NameTooLong;
};

type AccountDelegationError = variant {
    InternalCanisterError : text;
    Unauthorized : principal;
    NoSuchDelegation;
};

type PrepareAccountDelegation = record {
    user_key : UserKey;
    expiration : Timestamp;
};

type GetAccountsError = variant {
    InternalCanisterError : text;
    Unauthorized : principal;
};

type PrepareIdAliasRequest = record {
    // Origin of the issuer in the attribute sharing flow.
    issuer : FrontendHostname;
    // Origin of the relying party in the attribute sharing flow.
    relying_party : FrontendHostname;
    // Identity for which the IdAlias should be generated.
    identity_number : IdentityNumber;
};

type PrepareIdAliasError = variant {
    // The principal is not authorized to call this method with the given arguments.
    Unauthorized : principal;
    // Internal canister error. See the error message for details.
    InternalCanisterError : text;
};

// The prepared id alias contains two (still unsigned) credentials in JWT format,
// certifying the id alias for the issuer resp. the relying party.
type PreparedIdAlias = record {
    rp_id_alias_jwt : text;
    issuer_id_alias_jwt : text;
    canister_sig_pk_der : PublicKey;
};

// The request to retrieve the actual signed id alias credentials.
// The field values should be equal to the values of corresponding
// fields from the preceding `PrepareIdAliasRequest` and `PrepareIdAliasResponse`.
type GetIdAliasRequest = record {
    rp_id_alias_jwt : text;
    issuer : FrontendHostname;
    issuer_id_alias_jwt : text;
    relying_party : FrontendHostname;
    identity_number : IdentityNumber;
};

type GetIdAliasError = variant {
    // The principal is not authorized to call this method with the given arguments.
    Unauthorized : principal;
    // The credential(s) are not available: may be expired or not prepared yet (call prepare_id_alias to prepare).
    NoSuchCredentials : text;
    // Internal canister error. See the error message for details.
    InternalCanisterError : text;
};

// The signed id alias credentials for each involved party.
type IdAliasCredentials = record {
    rp_id_alias_credential : SignedIdAlias;
    issuer_id_alias_credential : SignedIdAlias;
};

type SignedIdAlias = record {
    credential_jws : text;
    id_alias : principal;
    id_dapp : principal;
};

type IdRegNextStepResult = record {
    // The next step in the registration flow
    next_step : RegistrationFlowNextStep;
};

type IdRegStartError = variant {
    // The method was called anonymously, which is not supported.
    InvalidCaller;
    // Too many registrations. Please try again later.
    RateLimitExceeded;
    // A registration flow is already in progress.
    AlreadyInProgress;
};

// The next step in the registration flow:
// - CheckCaptcha: supply the solution to the captcha using `check_captcha`
// - Finish: finish the registration using `identity_registration_finish`
type RegistrationFlowNextStep = variant {
    // Supply the captcha solution using check_captcha
    CheckCaptcha : record {
        captcha_png_base64 : text;
    };
    // Finish the registration using identity_registration_finish
    Finish;
};

type CheckCaptchaArg = record {
    solution : text;
};

type CheckCaptchaError = variant {
    // The supplied solution was wrong. Try again with the new captcha.
    WrongSolution : record {
        new_captcha_png_base64 : text;
    };
    // This call is unexpected, see next_step.
    UnexpectedCall : record {
        next_step : RegistrationFlowNextStep;
    };
    // No registration flow ongoing for the caller.
    NoRegistrationFlow;
};

type IdRegFinishArg = record {
    authn_method : AuthnMethodData;
    name : opt text;
};

type IdRegFinishResult = record {
    identity_number : nat64;
};

type IdRegFinishError = variant {
    // The configured maximum number of identities has been reached.
    IdentityLimitReached;
    // This call is unexpected, see next_step.
    UnexpectedCall : record {
        next_step : RegistrationFlowNextStep;
    };
    // No registration flow ongoing for the caller.
    NoRegistrationFlow;
    // The supplied authn_method is not valid.
    InvalidAuthnMethod : text;
    // Error while persisting the new identity.
    StorageError : text;
};

type AccountInfo = record {
    // Null is unreserved default account
    account_number : opt AccountNumber;
    origin : text;
    last_used : opt Timestamp;
    // Configurable properties
    name : opt text;
};

type AccountUpdate = record {
    name : opt text;
};

type DummyAuthConfig = record {
    // Prompts user for a index value (0 - 255) when set to true,
    // this is used in e2e to have multiple dummy auth identities.
    prompt_for_index : bool;
};

type IdentityPropertiesReplace = record {
    name : opt text;
};

type IdentityPropertiesReplaceError = variant {
    Unauthorized : principal;
    StorageSpaceExceeded : record {
        space_available : nat64;
        space_required : nat64;
    };
    NameTooLong : record {
        limit : nat64;
    };
    InternalCanisterError : text;
};

service : (opt InternetIdentityInit) -> {
    // Legacy identity management API
    // ==============================

    create_challenge : () -> (Challenge);
    register : (DeviceData, ChallengeResult, opt principal) -> (RegisterResponse);
    add : (UserNumber, DeviceData) -> ();
    update : (UserNumber, DeviceKey, DeviceData) -> ();
    // Atomically replace device matching the device key with the new device data
    replace : (UserNumber, DeviceKey, DeviceData) -> ();
    remove : (UserNumber, DeviceKey) -> ();
    // Returns all devices of the user (authentication and recovery) but no information about device registrations.
    // Note: Clears out the 'alias' fields on the devices. Use 'get_anchor_info' to obtain the full information.
    // Deprecated: Use 'get_anchor_credentials' instead.
    lookup : (UserNumber) -> (vec DeviceData) query;
    get_anchor_credentials : (UserNumber) -> (AnchorCredentials) query;
    get_anchor_info : (UserNumber) -> (IdentityAnchorInfo);
    get_principal : (UserNumber, FrontendHostname) -> (principal) query;

    enter_device_registration_mode : (UserNumber) -> (Timestamp);
    exit_device_registration_mode : (UserNumber) -> ();
    add_tentative_device : (UserNumber, DeviceData) -> (AddTentativeDeviceResponse);
    verify_tentative_device : (UserNumber, verification_code : text) -> (VerifyTentativeDeviceResponse);

    // V2 Identity Management API
    // ==========================
    // WARNING: The following methods are experimental and may ch 0ange in the future.

    // Starts the identity registration flow to create a new identity.
    identity_registration_start : () -> (variant { Ok : IdRegNextStepResult; Err : IdRegStartError });

    // Check the captcha challenge
    // If successful, the registration can be finished with `identity_registration_finish`.
    check_captcha : (CheckCaptchaArg) -> (variant { Ok : IdRegNextStepResult; Err : CheckCaptchaError });

    // Starts the identity registration flow to create a new identity.
    identity_registration_finish : (IdRegFinishArg) -> (variant { Ok : IdRegFinishResult; Err : IdRegFinishError });

    // Returns information about the authentication methods of the identity with the given number.
    // Only returns the minimal information required for authentication without exposing any metadata such as aliases.
    identity_authn_info : (IdentityNumber) -> (variant { Ok : IdentityAuthnInfo; Err }) query;

    // Returns information about the identity with the given number.
    // Requires authentication.
    identity_info : (IdentityNumber) -> (variant { Ok : IdentityInfo; Err : IdentityInfoError });

    // Replaces the authentication method independent metadata map.
    // The existing metadata map will be overwritten.
    // Requires authentication.
    identity_metadata_replace : (IdentityNumber, MetadataMapV2) -> (variant { Ok; Err : IdentityMetadataReplaceError });

    // Replaces the identity properties.
    // The existing properties will be overwritten.
    // Requires authentication.
    identity_properties_replace : (IdentityNumber, IdentityPropertiesReplace) -> (variant { Ok; Err : IdentityPropertiesReplaceError });

    // Adds a new authentication method to the identity.
    // Requires authentication.
    authn_method_add : (IdentityNumber, AuthnMethodData) -> (variant { Ok; Err : AuthnMethodAddError });

    // Atomically replaces the authentication method matching the supplied public key with the new authentication method
    // provided.
    // Requires authentication.
    authn_method_replace : (IdentityNumber, PublicKey, AuthnMethodData) -> (variant { Ok; Err : AuthnMethodReplaceError });

    // Replaces the authentication method metadata map.
    // The existing metadata map will be overwritten.
    // Requires authentication.
    authn_method_metadata_replace : (IdentityNumber, PublicKey, MetadataMapV2) -> (variant { Ok; Err : AuthnMethodMetadataReplaceError });

    // Replaces the authentication method security settings.
    // The existing security settings will be overwritten.
    // Requires authentication.
    authn_method_security_settings_replace : (IdentityNumber, PublicKey, AuthnMethodSecuritySettings) -> (variant { Ok; Err : AuthnMethodSecuritySettingsReplaceError });

    // Removes the authentication method associated with the public key from the identity.
    // Requires authentication.
    authn_method_remove : (IdentityNumber, PublicKey) -> (variant { Ok; Err });

    // Enters the authentication method registration mode for the identity.
    // In this mode, a new authentication method can be registered, which then needs to be
    // confirmed before it can be used for authentication on this identity.
    // The registration mode is automatically exited after the returned expiration timestamp.
    // Requires authentication.
    authn_method_registration_mode_enter : (IdentityNumber, opt RegistrationId) -> (variant { Ok : record { expiration : Timestamp }; Err : AuthnMethodRegistrationModeEnterError });

    // Exits the authentication method registration mode for the identity.
    // Requires authentication.
    authn_method_registration_mode_exit : (IdentityNumber) -> (variant { Ok; Err });

    // Registers a new authentication method to the identity.
    // This authentication method needs to be confirmed before it can be used for authentication on this identity.
    authn_method_register : (IdentityNumber, AuthnMethodData) -> (variant { Ok : AuthnMethodConfirmationCode; Err : AuthnMethodRegisterError });

    // Confirms a previously registered authentication method.
    // On successful confirmation, the authentication method is permanently added to the identity and can
    // subsequently be used for authentication for that identity.
    // Requires authentication.
    authn_method_confirm : (IdentityNumber, confirmation_code : text) -> (variant { Ok; Err : AuthnMethodConfirmationError });

    lookup_by_registration_mode_id : (RegistrationId) -> (opt IdentityNumber) query;

    // Authentication protocol
    // =======================
    prepare_delegation : (UserNumber, FrontendHostname, SessionKey, maxTimeToLive : opt nat64) -> (UserKey, Timestamp);
    get_delegation : (UserNumber, FrontendHostname, SessionKey, Timestamp) -> (GetDelegationResponse) query;

    // Attribute Sharing MVP API
    // =========================
    // The methods below are used to generate ID-alias credentials during attribute sharing flow.
    prepare_id_alias : (PrepareIdAliasRequest) -> (variant { Ok : PreparedIdAlias; Err : PrepareIdAliasError });
    get_id_alias : (GetIdAliasRequest) -> (variant { Ok : IdAliasCredentials; Err : GetIdAliasError }) query;

    // OpenID credentials protocol
    // =========================
    openid_identity_registration_finish : (OpenIDRegFinishArg) -> (variant { Ok : IdRegFinishResult; Err : IdRegFinishError });
    openid_credential_add : (IdentityNumber, JWT, Salt) -> (variant { Ok; Err : OpenIdCredentialAddError });
    openid_credential_remove : (IdentityNumber, OpenIdCredentialKey) -> (variant { Ok; Err : OpenIdCredentialRemoveError });
    openid_prepare_delegation : (JWT, Salt, SessionKey) -> (variant { Ok : OpenIdPrepareDelegationResponse; Err : OpenIdDelegationError });
    openid_get_delegation : (JWT, Salt, SessionKey, Timestamp) -> (variant { Ok : SignedDelegation; Err : OpenIdDelegationError }) query;

    // HTTP Gateway protocol
    // =====================
    http_request : (request : HttpRequest) -> (HttpResponse) query;
    http_request_update : (request : HttpRequest) -> (HttpResponse);

    // Internal Methods
    // ================
    init_salt : () -> ();
    stats : () -> (InternetIdentityStats) query;
    config : () -> (InternetIdentityInit) query;

    deploy_archive : (wasm : blob) -> (DeployArchiveResult);
    // Returns a batch of entries _sorted by sequence number_ to be archived.
    // This is an update call because the archive information _must_ be certified.
    // Only callable by this IIs archive canister.
    fetch_entries : () -> (vec BufferedArchiveEntry);
    acknowledge_entries : (sequence_number : nat64) -> ();

    // Discoverable passkeys protocol
    lookup_device_key : (credential_id : blob) -> (opt DeviceKeyWithAnchor) query;

    // Multiple accounts
    get_accounts : (
        anchor_number : UserNumber,
        origin : FrontendHostname,
    ) -> (variant { Ok : vec AccountInfo; Err: GetAccountsError }) query;

    create_account : (
        anchor_number : UserNumber,
        origin : FrontendHostname,
        name : text
    ) -> (variant { Ok : AccountInfo; Err: CreateAccountError });

    update_account : (
        anchor_number : UserNumber,
        origin : FrontendHostname,
        account_number : opt AccountNumber, // Null is unreserved default account
        update : AccountUpdate
    ) ->  (variant { Ok : AccountInfo; Err: UpdateAccountError });

    prepare_account_delegation : (
        anchor_number : UserNumber,
        origin : FrontendHostname,
        account_number : opt AccountNumber, // Null is unreserved default account
        session_key : SessionKey,
        max_ttl : opt nat64
    ) -> (variant { Ok : PrepareAccountDelegation; Err : AccountDelegationError });
    
    get_account_delegation : (
        anchor_number : UserNumber,
        origin : FrontendHostname,
        account_number : opt AccountNumber, // Null is unreserved default account
        session_key : SessionKey,
        expiration : Timestamp
    ) -> (variant { Ok : SignedDelegation; Err : AccountDelegationError }) query;
};
