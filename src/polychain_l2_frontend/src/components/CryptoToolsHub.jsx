import React, { useState, useEffect } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { safeNumber, safeConvertObject } from '../utils/bigint-utils';
import { Brain, Shield, TrendingUp,Play, Calculator, AlertTriangle, CheckCircle, Zap, Package, Target } from 'lucide-react';
import './CryptoToolsHub.css';

function CryptoToolsHub() {
  const [activeTab, setActiveTab] = useState('ai');
  const [recommendation, setRecommendation] = useState(null);
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [aiAmount, setAiAmount] = useState(100000);
  const [threatLevel, setThreatLevel] = useState(50);
  const [performancePriority, setPerformancePriority] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState('Hello Polychain L2 - Quantum Resistant Blockchain!');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('ecdsa');
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState([]);
  const [benchmarkError, setBenchmarkError] = useState('');
  const [iterations, setIterations] = useState(3);
  const [transactions, setTransactions] = useState([]);
  const [batchConfig, setBatchConfig] = useState({
    algorithm: 'CryptoOptimized',
    compression_level: 6,
    enable_aggregation: true,
    batch_size_limit: 1000
  });
  const [compressionLoading, setCompressionLoading] = useState(false);
  const [compressionResult, setCompressionResult] = useState('');
  const [compressionBatches, setCompressionBatches] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [compressionBenchmarkResults, setCompressionBenchmarkResults] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    sender: '',
    recipient: '',
    amount: ''
  });

  const tabs = [
    { id: 'ai', label: 'AI Recommendations', icon: Brain },
    { id: 'benchmark', label: 'Benchmark Tests', icon: Target },
    { id: 'compression', label: 'Compression', icon: Package },
  ];

  const algorithms = [
    { name: 'ECDSA', value: 'ecdsa', description: 'Elliptic Curve Digital Signature Algorithm', quantum: false },
    { name: 'Schnorr', value: 'schnorr', description: 'Schnorr Digital Signature Scheme', quantum: false },
    { name: 'Falcon512', value: 'falcon', description: 'Post-Quantum Lattice-based Signature', quantum: true },
    { name: 'ML-DSA44', value: 'mldsa', description: 'Module-Lattice-based Digital Signature Algorithm', quantum: true }
  ];

  useEffect(() => {
    if (activeTab === 'ai') {
      loadAdvancedMetrics();
      loadRecommendation();
    } else if (activeTab === 'compression') {
      loadCompressionPerformanceMetrics();
      loadCompressionBatchList();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ai' && aiAmount > 0) {
      loadRecommendation();
    }
  }, [aiAmount, threatLevel, performancePriority, activeTab]);

  // AI Functions
  const loadAdvancedMetrics = async () => {
    try {
      const data = await polychain_l2_backend.get_layer2_advanced_metrics();
      setAdvancedMetrics(safeConvertObject(data));
    } catch (error) {
      console.error('Failed to load advanced metrics:', error);
    }
  };

  const loadRecommendation = async () => {
    try {
      setAiLoading(true);
      const data = await polychain_l2_backend.get_crypto_recommendation(
        aiAmount,
        [threatLevel],
        [performancePriority]
      );
      setRecommendation(data);
    } catch (error) {
      console.error('Failed to load recommendation:', error);
    } finally {
      setAiLoading(false);
    }
  };

  // Benchmark Functions
  const runBenchmark = async () => {
    setBenchmarkLoading(true);
    setBenchmarkError('');
    try {
      const newResults = [];
      for (let i = 0; i < iterations; i++) {
        const result = await polychain_l2_backend.crypto_algorithm_benchmark(message, selectedAlgorithm);
        if ('Ok' in result) {
          newResults.push({ ...safeConvertObject(result.Ok), iteration: i + 1, timestamp: Date.now() });
        }
      }
      setBenchmarkResults(prev => [...prev, ...newResults]);
    } catch (error) {
      setBenchmarkError(`Error: ${error.message}`);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  const runAllAlgorithmsBenchmark = async () => {
    setBenchmarkLoading(true);
    setBenchmarkError('');
    setBenchmarkResults([]);
    try {
      const allResults = [];
      for (const algo of algorithms) {
        for (let i = 0; i < 2; i++) {
          const result = await polychain_l2_backend.crypto_algorithm_benchmark(message, algo.value);
          if ('Ok' in result) {
            allResults.push({ ...safeConvertObject(result.Ok), iteration: i + 1, timestamp: Date.now() });
          }
        }
      }
      setBenchmarkResults(allResults);
    } catch (error) {
      setBenchmarkError(`Error: ${error.message}`);
    } finally {
      setBenchmarkLoading(false);
    }
  };

  // Compression Functions
  const loadCompressionPerformanceMetrics = async () => {
    try {
      const metrics = await polychain_l2_backend.get_compression_performance_metrics();
      setPerformanceMetrics(safeConvertObject(metrics));
    } catch (error) {
      console.error('Failed to load compression metrics:', error);
    }
  };

  const loadCompressionBatchList = async () => {
    try {
      const batches = await polychain_l2_backend.list_compressed_batches();
      setCompressionBatches(safeConvertObject(batches));
    } catch (error) {
      console.error('Failed to load compression batches:', error);
    }
  };

  const addTransaction = () => {
    if (!newTransaction.sender || !newTransaction.recipient || !newTransaction.amount) {
      setCompressionResult('Please fill all transaction fields');
      return;
    }
    const transaction = {
      id: `tx_${Date.now()}`,
      sender: newTransaction.sender,
      recipient: newTransaction.recipient,
      amount: parseFloat(newTransaction.amount),
      timestamp: Date.now(),
      tx_type: 'transfer'
    };
    setTransactions(prev => [...prev, transaction]);
    setNewTransaction({ sender: '', recipient: '', amount: '' });
    setCompressionResult(`Transaction added. Total: ${transactions.length + 1}`);
  };

  const createCompressedBatch = async () => {
    if (transactions.length === 0) {
      setCompressionResult('No transactions to compress');
      return;
    }
    setCompressionLoading(true);
    try {
      const response = await polychain_l2_backend.create_compressed_batch(transactions, [batchConfig]);
      if ('Ok' in response) {
        setCompressionResult(`✅ ${response.Ok}`);
        setTransactions([]);
        loadCompressionBatchList();
      } else {
        setCompressionResult(`❌ ${response.Err}`);
      }
    } catch (error) {
      setCompressionResult(`Error: ${error.message}`);
    } finally {
      setCompressionLoading(false);
    }
  };

  const runCompressionBenchmark = async () => {
    setCompressionLoading(true);
    try {
      const testSizes = [100, 500, 1000, 2000];
      const results = await polychain_l2_backend.run_compression_benchmark(testSizes, ['config']);
      if ('Ok' in results) {
        setCompressionBenchmarkResults(safeConvertObject(results.Ok));
        setCompressionResult('✅ Compression benchmark completed');
      } else {
        setCompressionResult(`❌ ${results.Err}`);
      }
    } catch (error) {
      setCompressionResult(`Error: ${error.message}`);
    } finally {
      setCompressionLoading(false);
    }
  };

  const getThreatIcon = (level) => {
    if (level >= 80) return AlertTriangle;
    if (level >= 50) return Shield;
    return CheckCircle;
  };

  const getThreatColor = (level) => {
    if (level >= 80) return 'var(--status-danger)';
    if (level >= 50) return 'var(--status-warning)';
    return 'var(--status-success)';
  };

  const getSecurityRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent': return 'var(--status-success)';
      case 'Very Good': return 'var(--status-warning)';
      case 'Good': return 'var(--accent-blue)';
      default: return 'var(--text-secondary)';
    }
  };

  const formatTime = (nanoseconds) => {
    if (nanoseconds > 1000000) return `${(nanoseconds / 1000000).toFixed(2)}ms`;
    if (nanoseconds > 1000) return `${(nanoseconds / 1000).toFixed(2)}μs`;
    return `${nanoseconds}ns`;
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Crypto Tools Hub</h2>
        <p>Advanced cryptographic tools, AI recommendations, benchmarking, and compression</p>
      </div>
      <div className="card-body">
        <div className="tools-hub-container">
          <div className="tools-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="tab-content-wrapper">
            {activeTab === 'ai' && (
              <div className="ai-grid">
                {aiLoading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                )}
                <div className="card">
                  <div className="card-header">
                    <h4>Transaction Parameters</h4>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Amount (satoshi)</label>
                      <input
                        type="number"
                        value={aiAmount}
                        onChange={(e) => setAiAmount(parseInt(e.target.value) || 0)}
                        min="1"
                        max="10000000"
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Quantum Threat Level: {threatLevel}%</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={threatLevel}
                        onChange={(e) => setThreatLevel(parseInt(e.target.value))}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        <input
                          type="checkbox"
                          checked={performancePriority}
                          onChange={(e) => setPerformancePriority(e.target.checked)}
                        />
                        Prioritize Performance over Security
                      </label>
                    </div>
                    <button
                      onClick={loadRecommendation}
                      disabled={aiLoading}
                      className="button button-primary"
                    >
                      <Calculator size={16} />
                      {aiLoading ? 'Analyzing...' : 'Get AI Recommendation'}
                    </button>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h4>AI Recommendation</h4>
                  </div>
                  <div className="card-body">
                    {recommendation ? (
                      <div className="recommendation-result">
                        <div className="recommended-algo">
                          <h4>Recommended Algorithm</h4>
                          <div className="value" style={{ color: getSecurityRatingColor(recommendation.security_rating) }}>
                            {recommendation.recommended_algorithm}
                          </div>
                          <div>Security Rating: {recommendation.security_rating}</div>
                        </div>
                        <div className="recommendation-metrics">
                          <div>Risk Level: {recommendation.risk_level}</div>
                          <div>Efficiency Score: {recommendation.efficiency_score.toFixed(1)}%</div>
                          <div style={{ color: getThreatColor(recommendation.quantum_threat_level) }}>
                            Quantum Threat: {recommendation.quantum_threat_level}%
                          </div>
                        </div>
                        <div className="recommendation-reason">
                          <h4>Analysis</h4>
                          <p>{recommendation.reason}</p>
                        </div>
                        <div className="alternative-algorithms">
                          <h4>Alternative Options</h4>
                          <div>
                            {recommendation.alternative_algorithms.map((algo, index) => (
                              <span key={index} style={{ marginRight: '8px' }}>{algo}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p>Configure parameters and click "Get AI Recommendation" to analyze.</p>
                    )}
                  </div>
                </div>
                {advancedMetrics && (
                  <div className="card">
                    <div className="card-header">
                      <h4>System Threat Analysis</h4>
                    </div>
                    <div className="card-body">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                        <div className="status-indicator">
                          {React.createElement(getThreatIcon(advancedMetrics.quantum_threat_level), { size: 24 })}
                          <span className="label">Quantum Threat</span>
                          <span className="value">{advancedMetrics.quantum_threat_level}%</span>
                        </div>
                        <div className="status-indicator">
                          <Shield size={24} />
                          <span className="label">Security Score</span>
                          <span className="value">{advancedMetrics.security_score.toFixed(0)}/100</span>
                        </div>
                        <div className="status-indicator">
                          <CheckCircle size={24} />
                          <span className="label">Quantum Ready</span>
                          <span className="value">{advancedMetrics.quantum_ready_percentage.toFixed(0)}%</span>
                        </div>
                        <div className="status-indicator">
                          <TrendingUp size={24} />
                          <span className="label">Migration Ready</span>
                          <span className="value">{advancedMetrics.migration_readiness.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'benchmark' && (
              <div className="benchmark-grid">
                {benchmarkLoading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                )}
                <div className="card">
                  <div className="card-header">
                    <h4>Benchmark Configuration</h4>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Test Message:</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter message to sign..."
                        className="form-input"
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Algorithm:</label>
                      <select
                        value={selectedAlgorithm}
                        onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        className="form-input"
                      >
                        {algorithms.map((algo) => (
                          <option key={algo.value} value={algo.value}>
                            {algo.name} - {algo.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Iterations:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={iterations}
                        onChange={(e) => setIterations(parseInt(e.target.value) || 1)}
                        className="form-input"
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <button
                        onClick={runBenchmark}
                        disabled={benchmarkLoading || !message}
                        className="button button-primary"
                      >
                        <Play size={16} />
                        {benchmarkLoading ? 'Running...' : 'Run Benchmark'}
                      </button>
                      <button
                        onClick={runAllAlgorithmsBenchmark}
                        disabled={benchmarkLoading || !message}
                        className="button button-secondary"
                      >
                        <Target size={16} />
                        Test All Algorithms
                      </button>
                      <button
                        onClick={() => setBenchmarkResults([])}
                        className="button button-secondary"
                      >
                        Clear Results
                      </button>
                    </div>
                    {benchmarkError && (
                      <div className="status-indicator status-danger">
                        <AlertTriangle size={16} />
                        {benchmarkError}
                      </div>
                    )}
                  </div>
                </div>
                {benchmarkResults.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <h4>Benchmark Results</h4>
                    </div>
                    <div className="card-body">
                      <div className="results-table">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', fontWeight: 600 }}>
                          <span>Algorithm</span>
                          <span>Time</span>
                          <span>Quantum Safe</span>
                          <span>Message Size</span>
                          <span>Status</span>
                        </div>
                        {benchmarkResults.map((result, index) => (
                          <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: 'var(--space-3)' }}>
                            <span>{result.algorithm.toUpperCase()}</span>
                            <span>{formatTime(result.total_time_ns)}</span>
                            <span className={result.quantum_resistant ? 'quantum-safe' : 'quantum-classic'}>
                              {result.quantum_resistant ? '🔒 Yes' : '🔑 No'}
                            </span>
                            <span>{result.message_length} bytes</span>
                            <span>{result.success ? '✅ Success' : '❌ Failed'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'compression' && (
              <div className="compression-grid">
                {compressionLoading && (
                  <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                  </div>
                )}
                <div className="card">
                  <div className="card-header">
                    <h4>
                      <Package size={20} />
                      Transaction Batch Builder
                    </h4>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label className="form-label">Sender:</label>
                      <input
                        type="text"
                        value={newTransaction.sender}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, sender: e.target.value }))}
                        placeholder="Sender address..."
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Recipient:</label>
                      <input
                        type="text"
                        value={newTransaction.recipient}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, recipient: e.target.value }))}
                        placeholder="Recipient address..."
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Amount:</label>
                      <input
                        type="number"
                        step="0.00000001"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00000000"
                        className="form-input"
                      />
                    </div>
                    <button onClick={addTransaction} className="button button-primary">
                      Add Transaction ({transactions.length})
                    </button>
                    <div className="form-group">
                      <label className="form-label">Algorithm:</label>
                      <select
                        value={batchConfig.algorithm}
                        onChange={(e) => setBatchConfig(prev => ({ ...prev, algorithm: e.target.value }))}
                        className="form-input"
                      >
                        <option value="CryptoOptimized">Crypto Optimized</option>
                        <option value="LZ4">LZ4 (Fast)</option>
                        <option value="ZSTD">ZSTD (Balanced)</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <button
                        onClick={createCompressedBatch}
                        disabled={compressionLoading || transactions.length === 0}
                        className="button button-primary"
                      >
                        <Package size={16} />
                        {compressionLoading ? 'Compressing...' : 'Create Batch'}
                      </button>
                      <button
                        onClick={runCompressionBenchmark}
                        disabled={compressionLoading}
                        className="button button-secondary"
                      >
                        <Target size={16} />
                        Run Benchmark
                      </button>
                    </div>
                    {compressionResult && (
                      <div className={`status-indicator ${compressionResult.includes('Error') ? 'status-danger' : 'status-success'}`}>
                        {compressionResult}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <h4>
                      <TrendingUp size={20} />
                      Compression Performance
                    </h4>
                  </div>
                  <div className="card-body">
                    {performanceMetrics && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                        <div>
                          <span className="label">Compression Ratio</span>
                          <span className="value">{(performanceMetrics.compression_ratio * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="label">Comp. Speed</span>
                          <span className="value">{performanceMetrics.compression_speed_mbps.toFixed(1)} MB/s</span>
                        </div>
                        <div>
                          <span className="label">Decomp. Speed</span>
                          <span className="value">{performanceMetrics.decompression_speed_mbps.toFixed(1)} MB/s</span>
                        </div>
                        <div>
                          <span className="label">Storage Savings</span>
                          <span className="value">{performanceMetrics.storage_savings_percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    )}
                    {compressionBenchmarkResults.length > 0 && (
                      <div>
                        <h4>Benchmark Results</h4>
                        <div className="batch-item-list">
                          {compressionBenchmarkResults.map((result, index) => (
                            <div key={index} className="batch-item">
                              <span>{result.algorithm}</span>
                              <span>{result.compression_ratio.toFixed(2)}x</span>
                              <span>Speed: {result.compression_speed_mbps.toFixed(1)} MB/s</span>
                              <span>Savings: {result.storage_savings_percentage.toFixed(1)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {compressionBatches.length > 0 && (
                  <div className="card">
                    <div className="card-header">
                      <h4>Recent Compressed Batches</h4>
                    </div>
                    <div className="card-body">
                      <div className="batch-item-list">
                        {compressionBatches.slice(-5).map((batch, index) => (
                          <div key={index} className="batch-item">
                            <span>{batch.batch_id}</span>
                            <span>{batch.algorithm}</span>
                            <span>{batch.transaction_count} txs</span>
                            <span>{(batch.compression_ratio * 100).toFixed(1)}% ratio</span>
                            <span>{(batch.original_size / 1024).toFixed(1)}KB → {(batch.compressed_size / 1024).toFixed(1)}KB</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CryptoToolsHub;
