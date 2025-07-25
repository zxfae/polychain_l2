import React, { useState, useEffect, useRef } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { safeNumber, safeConvertObject } from '../utils/bigint-utils';
import { Settings, Brain, Shield, TrendingUp, Play, Calculator, AlertTriangle, CheckCircle, Zap, Package, Target } from 'lucide-react';
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

  const canvasRef = useRef();
  const animationRef = useRef();
  const particlesRef = useRef([]);

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
    initializeParticles();
    startBackgroundAnimation();
    if (activeTab === 'ai') {
      loadAdvancedMetrics();
      loadRecommendation();
    } else if (activeTab === 'compression') {
      loadCompressionPerformanceMetrics();
      loadCompressionBatchList();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'ai' && aiAmount > 0) {
      loadRecommendation();
    }
  }, [aiAmount, threatLevel, performancePriority, activeTab]);

  const initializeParticles = () => {
    particlesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: ['#4488ff', '#44ff88', '#ffaa44', '#ff4488'][Math.floor(Math.random() * 4)],
      connections: []
    }));
  };

  const startBackgroundAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        particlesRef.current.forEach(other => {
          if (particle !== other) {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(68, 136, 255, ${0.2 * (1 - distance / 100)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

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
      default: return 'rgba(255, 255, 255, 0.7)';
    }
  };

  const formatTime = (nanoseconds) => {
    if (nanoseconds > 1000000) return `${(nanoseconds / 1000000).toFixed(2)}ms`;
    if (nanoseconds > 1000) return `${(nanoseconds / 1000).toFixed(2)}μs`;
    return `${nanoseconds}ns`;
  };

  return (
    <div className="card ds-card">
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="hub-content">
        <div className="card-header">
          <h2>
            <Zap size={28} />
            Crypto Tools Hub
          </h2>
          <p>Advanced cryptographic tools, AI recommendations, benchmarking, and compression</p>
        </div>
        <div className="card-body">
          <div className="tools-hub-container">
            <div className="tools-nav" role="tablist" aria-label="Crypto Tools Navigation">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                      e.preventDefault();
                      const direction = e.key === 'ArrowRight' ? 1 : -1;
                      const nextIndex = (index + direction + tabs.length) % tabs.length;
                      const nextTab = tabs[nextIndex];
                      setActiveTab(nextTab.id);
                      setTimeout(() => {
                        document.getElementById(`tab-${nextTab.id}`)?.focus();
                      }, 0);
                    } else if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveTab(tab.id);
                    }
                  }}
                >
                  <tab.icon size={18} aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="tab-content-wrapper">
              {activeTab === 'ai' && (
                <div id="tabpanel-ai" role="tabpanel" aria-labelledby="tab-ai" className="tab-main-content">
                  {aiLoading && (
                    <div className="loading-overlay">
                      <div className="loading-spinner"></div>
                    </div>
                  )}
                  <div className="card ds-card-glass">
                    <div className="card-header">
                      <h4>
                        <Settings size={20} />
                        Transaction Parameters
                      </h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label" htmlFor="ai-amount">Amount (satoshi)</label>
                        <input
                          id="ai-amount"
                          type="number"
                          value={aiAmount}
                          onChange={(e) => setAiAmount(parseInt(e.target.value) || 0)}
                          min="1"
                          max="10000000"
                          className="form-input"
                          aria-describedby="ai-amount-desc"
                        />
                        <div id="ai-amount-desc" className="sr-only">
                          Enter the transaction amount in satoshi
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="threat-level">Quantum Threat Level: {threatLevel}%</label>
                        <input
                          id="threat-level"
                          type="range"
                          min="0"
                          max="100"
                          value={threatLevel}
                          onChange={(e) => setThreatLevel(parseInt(e.target.value))}
                          className="form-input"
                          aria-describedby="threat-level-desc"
                        />
                        <div id="threat-level-desc" className="sr-only">
                          Adjust the quantum threat level percentage
                        </div>
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
                        className="button button-primary ds-button"
                      >
                        <Calculator size={16} />
                        {aiLoading ? 'Analyzing...' : 'Get AI Recommendation'}
                      </button>
                    </div>
                  </div>
                  <div className="card ds-card-glass">
                    <div className="card-header">
                      <h4>
                        <Brain size={20} />
                        AI Recommendation
                      </h4>
                    </div>
                    <div className="card-body">
                      {recommendation ? (
                        <div className="recommendation-result">
                          <div className="recommended-algo">
                            <p className="label">Recommended Algorithm</p>
                            <p className="value" style={{ color: getSecurityRatingColor(recommendation.security_rating) }}>
                              {recommendation.recommended_algorithm}
                            </p>
                            <p>Security Rating: {recommendation.security_rating}</p>
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
                    <div className="card ds-card-glass">
                      <div className="card-header">
                        <h4>
                          <Shield size={20} />
                          System Threat Analysis
                        </h4>
                      </div>
                      <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
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
                <div id="tabpanel-benchmark" role="tabpanel" aria-labelledby="tab-benchmark" className="tab-main-content">
                  {benchmarkLoading && (
                    <div className="loading-overlay">
                      <div className="loading-spinner"></div>
                    </div>
                  )}
                  <div className="card ds-card-glass">
                    <div className="card-header">
                      <h4>
                        <Target size={20} />
                        Benchmark Configuration
                      </h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label" htmlFor="test-message">Test Message:</label>
                        <textarea
                          id="test-message"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Enter message to sign..."
                          className="form-input"
                          rows="3"
                          aria-describedby="test-message-desc"
                        />
                        <div id="test-message-desc" className="sr-only">
                          Enter a message to test cryptographic signing
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="algorithm">Algorithm:</label>
                        <select
                          id="algorithm"
                          value={selectedAlgorithm}
                          onChange={(e) => setSelectedAlgorithm(e.target.value)}
                          className="form-input"
                          aria-describedby="algorithm-desc"
                        >
                          {algorithms.map((algo) => (
                            <option key={algo.value} value={algo.value}>
                              {algo.name} - {algo.description}
                            </option>
                          ))}
                        </select>
                        <div id="algorithm-desc" className="sr-only">
                          Select a cryptographic algorithm for benchmarking
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="iterations">Iterations:</label>
                        <input
                          id="iterations"
                          type="number"
                          min="1"
                          max="10"
                          value={iterations}
                          onChange={(e) => setIterations(parseInt(e.target.value) || 1)}
                          className="form-input"
                          aria-describedby="iterations-desc"
                        />
                        <div id="iterations-desc" className="sr-only">
                          Set the number of benchmark iterations
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={runBenchmark}
                          disabled={benchmarkLoading || !message}
                          className="button button-primary ds-button"
                        >
                          <Play size={16} />
                          {benchmarkLoading ? 'Running...' : 'Run Benchmark'}
                        </button>
                        <button
                          onClick={runAllAlgorithmsBenchmark}
                          disabled={benchmarkLoading || !message}
                          className="button button-secondary ds-button"
                        >
                          <Target size={16} />
                          Test All Algorithms
                        </button>
                        <button
                          onClick={() => setBenchmarkResults([])}
                          className="button button-secondary ds-button"
                        >
                          <Zap size={16} />
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
                    <div className="card ds-card-glass">
                      <div className="card-header">
                        <h4>
                          <TrendingUp size={20} />
                          Benchmark Results
                        </h4>
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
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '0.5rem' }}>
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
                <div id="tabpanel-compression" role="tabpanel" aria-labelledby="tab-compression" className="tab-main-content">
                  {compressionLoading && (
                    <div className="loading-overlay">
                      <div className="loading-spinner"></div>
                    </div>
                  )}
                  <div className="card ds-card-glass">
                    <div className="card-header">
                      <h4>
                        <Package size={20} />
                        Transaction Batch Builder
                      </h4>
                    </div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="form-label" htmlFor="sender">Sender:</label>
                        <input
                          id="sender"
                          type="text"
                          value={newTransaction.sender}
                          onChange={(e) => setNewTransaction(prev => ({ ...prev, sender: e.target.value }))}
                          placeholder="Sender address..."
                          className="form-input"
                          aria-describedby="sender-desc"
                        />
                        <div id="sender-desc" className="sr-only">
                          Enter the sender's address for the transaction
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="recipient">Recipient:</label>
                        <input
                          id="recipient"
                          type="text"
                          value={newTransaction.recipient}
                          onChange={(e) => setNewTransaction(prev => ({ ...prev, recipient: e.target.value }))}
                          placeholder="Recipient address..."
                          className="form-input"
                          aria-describedby="recipient-desc"
                        />
                        <div id="recipient-desc" className="sr-only">
                          Enter the recipient's address for the transaction
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="amount">Amount:</label>
                        <input
                          id="amount"
                          type="number"
                          step="0.00000001"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="0.00000000"
                          className="form-input"
                          aria-describedby="amount-desc"
                        />
                        <div id="amount-desc" className="sr-only">
                          Enter the transaction amount
                        </div>
                      </div>
                      <button
                        onClick={addTransaction}
                        className="button button-primary ds-button"
                      >
                        <Zap size={16} />
                        Add Transaction ({transactions.length})
                      </button>
                      <div className="form-group">
                        <label className="form-label" htmlFor="batch-algorithm">Algorithm:</label>
                        <select
                          id="batch-algorithm"
                          value={batchConfig.algorithm}
                          onChange={(e) => setBatchConfig(prev => ({ ...prev, algorithm: e.target.value }))}
                          className="form-input"
                          aria-describedby="batch-algorithm-desc"
                        >
                          <option value="CryptoOptimized">Crypto Optimized</option>
                          <option value="LZ4">LZ4 (Fast)</option>
                          <option value="ZSTD">ZSTD (Balanced)</option>
                        </select>
                        <div id="batch-algorithm-desc" className="sr-only">
                          Select the compression algorithm for the batch
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <button
                          onClick={createCompressedBatch}
                          disabled={compressionLoading || transactions.length === 0}
                          className="button button-primary ds-button"
                        >
                          <Package size={16} />
                          {compressionLoading ? 'Compressing...' : 'Create Batch'}
                        </button>
                        <button
                          onClick={runCompressionBenchmark}
                          disabled={compressionLoading}
                          className="button button-secondary ds-button"
                        >
                          <Target size={16} />
                          Run Benchmark
                        </button>
                      </div>
                      {compressionResult && (
                        <div className={`status-indicator ${compressionResult.includes('Error') ? 'status-danger' : 'status-success'}`}>
                          {compressionResult.includes('Error') ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                          {compressionResult}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card ds-card-glass">
                    <div className="card-header">
                      <h4>
                        <TrendingUp size={20} />
                        Compression Performance
                      </h4>
                    </div>
                    <div className="card-body">
                      {performanceMetrics && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
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
                    <div className="card ds-card-glass">
                      <div className="card-header">
                        <h4>
                          <Package size={20} />
                          Recent Compressed Batches
                        </h4>
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
    </div>
  );
}

export default CryptoToolsHub;
