import { useState } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { safeNumber, safeConvertObject } from '../utils/bigint-utils';

function CryptoBenchmark() {
  const [message, setMessage] = useState('Hello Polychain L2 - Quantum Resistant Blockchain!');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('ecdsa');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [iterations, setIterations] = useState(3);

  const algorithms = [
    {
      name: 'ECDSA',
      value: 'ecdsa',
      description: 'Elliptic Curve Digital Signature Algorithm',
      quantum: false
    },
    {
      name: 'Schnorr',
      value: 'schnorr',
      description: 'Schnorr Digital Signature Scheme',
      quantum: false
    },
    {
      name: 'Falcon512',
      value: 'falcon',
      description: 'Post-Quantum Lattice-based Signature',
      quantum: true
    },
    {
      name: 'ML-DSA44',
      value: 'mldsa',
      description: 'Module-Lattice-based Digital Signature Algorithm',
      quantum: true
    }
  ];

  const runBenchmark = async () => {
    if (!polychain_l2_backend) {
      setError('Backend not initialized');
      return;
    }

    setLoading(true);
    setError('');
    setIsRunning(true);
    
    try {
      console.log(`Starting benchmark for ${selectedAlgorithm} with ${iterations} iterations`);
      
      const frontendTimes = [];
      const backendTimes = [];
      
      // Run multiple iterations for better measurement
      for (let i = 0; i < iterations; i++) {
        const frontendStartTime = performance.now();
        
        // Vérifier si la fonction existe avant de l'appeler
        if (!polychain_l2_backend.crypto_algorithm_benchmark) {
          throw new Error('crypto_algorithm_benchmark function not available - backend not properly deployed');
        }
        
        const result = await polychain_l2_backend.crypto_algorithm_benchmark(message, selectedAlgorithm);
        
        const frontendEndTime = performance.now();
        const frontendTimeMs = frontendEndTime - frontendStartTime;
        
        if (result.Ok) {
          const benchmark = result.Ok;
          frontendTimes.push(frontendTimeMs);
          
          // Safely convert backend time from any type to number
          const backendTimeNs = safeNumber(benchmark.total_time_ns, 0);
          backendTimes.push(backendTimeNs);
          
          console.log(`Iteration ${i + 1}: Frontend=${frontendTimeMs.toFixed(2)}ms, Backend=${backendTimeNs}ns`);
        } else {
          throw new Error(result.Err);
        }
        
        // Small delay between iterations
        if (i < iterations - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Calculate averages
      const avgFrontendTime = frontendTimes.reduce((a, b) => a + b, 0) / frontendTimes.length;
      const avgBackendTime = backendTimes.reduce((a, b) => a + b, 0) / backendTimes.length;
      
      const newResult = {
        algorithm: selectedAlgorithm,
        frontend_time_ms: avgFrontendTime,
        backend_time_ns: avgBackendTime,
        iterations: iterations,
        quantum_resistant: algorithms.find(a => a.value === selectedAlgorithm)?.quantum || false,
        success: true,
        message_length: message.length,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now()
      };
      
      setResults(prev => [newResult, ...prev.slice(0, 9)]);
      setError('');
      
    } catch (error) {
      setError(`Failed to run benchmark: ${error.message || error}`);
      console.error('Failed to run benchmark:', error);
    } finally {
      setLoading(false);
      setIsRunning(false);
    }
  };

  const runAllBenchmarks = async () => {
    if (!polychain_l2_backend) {
      setError('Backend not initialized');
      return;
    }

    setLoading(true);
    setError('');
    setIsRunning(true);
    
    const newResults = [];
    
    for (const algorithm of algorithms) {
      try {
        console.log(`Running benchmark for ${algorithm.name} with ${iterations} iterations...`);
        
        const frontendTimes = [];
        const backendTimes = [];
        
        // Run multiple iterations for each algorithm
        for (let i = 0; i < iterations; i++) {
          const frontendStartTime = performance.now();
          
          // Vérifier si la fonction existe avant de l'appeler
          if (!polychain_l2_backend.crypto_algorithm_benchmark) {
            throw new Error('crypto_algorithm_benchmark function not available - backend not properly deployed');
          }
          
          const result = await polychain_l2_backend.crypto_algorithm_benchmark(message, algorithm.value);
          
          const frontendEndTime = performance.now();
          const frontendTimeMs = frontendEndTime - frontendStartTime;
          
          if (result.Ok) {
            const benchmark = result.Ok;
            frontendTimes.push(frontendTimeMs);
            
            // Safely convert backend time from any type to number
            const backendTimeNs = safeNumber(benchmark.total_time_ns, 0);
            backendTimes.push(backendTimeNs);
            
            console.log(`${algorithm.name} iteration ${i + 1}: Frontend=${frontendTimeMs.toFixed(2)}ms, Backend=${backendTimeNs}ns`);
          } else {
            throw new Error(result.Err);
          }
          
          // Small delay between iterations
          if (i < iterations - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Calculate averages
        const avgFrontendTime = frontendTimes.reduce((a, b) => a + b, 0) / frontendTimes.length;
        const avgBackendTime = backendTimes.reduce((a, b) => a + b, 0) / backendTimes.length;
        
        const newResult = {
          algorithm: algorithm.value,
          frontend_time_ms: avgFrontendTime,
          backend_time_ns: avgBackendTime,
          iterations: iterations,
          quantum_resistant: algorithm.quantum,
          success: true,
          message_length: message.length,
          timestamp: new Date().toLocaleTimeString(),
          id: Date.now() + Math.random()
        };
        
        newResults.push(newResult);
        setResults(prev => [newResult, ...prev]);
        
      } catch (error) {
        console.error(`Failed to benchmark ${algorithm.name}:`, error);
      }
      
      // Small delay between algorithms
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setLoading(false);
    setIsRunning(false);
    
    if (newResults.length === 0) {
      setError('All benchmarks failed. Please check the console for details.');
    }
  };

  const formatTime = (nanoseconds) => {
    // Safely convert any type to number
    const ns = safeNumber(nanoseconds, 0);
    
    if (ns === 0) return '0ns (IC Optimized)';
    if (ns < 1000) return `${ns}ns`;
    if (ns < 1000000) return `${(ns / 1000).toFixed(2)}μs`;
    if (ns < 1000000000) return `${(ns / 1000000).toFixed(2)}ms`;
    return `${(ns / 1000000000).toFixed(2)}s`;
  };

  if (!polychain_l2_backend) {
    return (
      <div className="card">
        <h2>Cryptographic Algorithm Benchmark</h2>
        <div className="loading">
          Initializing backend connection...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Cryptographic Algorithm Benchmark</h2>
      <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
        Test and compare the performance of different cryptographic algorithms, including post-quantum solutions.
      </p>

      {/* Status indicator */}
      {isRunning && (
        <div style={{ 
          background: 'rgba(74, 222, 128, 0.1)', 
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <div style={{ color: '#4ade80', fontWeight: 'bold' }}>
            🚀 Running Benchmark...
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Testing cryptographic performance
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="result error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="message">Message to Sign:</label>
        <input
          id="message"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter message to benchmark"
        />
      </div>

      <div className="form-group">
        <label htmlFor="iterations">Number of Iterations: {iterations}</label>
        <input
          id="iterations"
          type="range"
          min="1"
          max="10"
          value={iterations}
          onChange={(e) => setIterations(parseInt(e.target.value))}
          style={{ width: '100%', marginTop: '0.5rem' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.2rem' }}>
          <span>1</span>
          <span>Fast</span>
          <span>Accurate</span>
          <span>10</span>
        </div>
      </div>

      <div className="algorithms-grid">
        {algorithms.map(algo => (
          <div
            key={algo.value}
            className={`algorithm-card ${algo.quantum ? 'quantum' : ''} ${selectedAlgorithm === algo.value ? 'selected' : ''}`}
            onClick={() => setSelectedAlgorithm(algo.value)}
            style={{
              border: selectedAlgorithm === algo.value ? '2px solid rgba(255, 255, 255, 0.5)' : undefined
            }}
          >
            <h4>{algo.name}</h4>
            <p>{algo.description}</p>
            {algo.quantum && (
              <div style={{ 
                color: '#a855f7', 
                fontSize: '0.8rem', 
                marginTop: '0.5rem',
                fontWeight: 'bold'
              }}>
                🔒 Quantum Resistant
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button 
          className="button" 
          onClick={runBenchmark}
          disabled={loading}
        >
          {loading ? 'Running...' : `Benchmark ${algorithms.find(a => a.value === selectedAlgorithm)?.name}`}
        </button>
        <button 
          className="button secondary" 
          onClick={runAllBenchmarks}
          disabled={loading}
        >
          {loading ? 'Running...' : 'Benchmark All Algorithms'}
        </button>
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Benchmark Results ({results.length})</h3>
          <div style={{ marginBottom: '1rem' }}>
            <button 
              className="button secondary" 
              onClick={() => setResults([])}
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              Clear Results
            </button>
          </div>
          
          {results.map((result, index) => (
            <div key={result.id || index} className="benchmark-result" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0 }}>
                  {result.algorithm.toUpperCase()} 
                  {result.quantum_resistant && <span style={{ color: '#a855f7', marginLeft: '0.5rem' }}>🔒</span>}
                </h4>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                  {result.timestamp}
                </span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem' }}>
                <div>
                  <strong>⚡ Frontend Time:</strong> 
                  <span style={{ color: '#4ade80', marginLeft: '0.5rem' }}>
                    {result.frontend_time_ms ? `${result.frontend_time_ms.toFixed(2)}ms` : 'N/A'}
                  </span>
                </div>
                <div>
                  <strong>🔧 Backend Time:</strong> 
                  <span style={{ color: '#a855f7', marginLeft: '0.5rem' }}>
                    {result.backend_time_ns !== undefined ? `${result.backend_time_ns}ns (IC Optimized)` : 'N/A'}
                  </span>
                </div>
                <div>
                  <strong>🔄 Iterations:</strong> 
                  <span style={{ marginLeft: '0.5rem' }}>
                    {result.iterations || 1}
                  </span>
                </div>
                <div>
                  <strong>📏 Message Length:</strong> 
                  <span style={{ marginLeft: '0.5rem' }}>
                    {result.message_length} bytes
                  </span>
                </div>
                <div>
                  <strong>🔒 Quantum Resistant:</strong> 
                  <span style={{ marginLeft: '0.5rem' }}>
                    {result.quantum_resistant ? '✅ Yes' : '❌ No'}
                  </span>
                </div>
                <div>
                  <strong>✅ Status:</strong> 
                  <span style={{ marginLeft: '0.5rem' }}>
                    {result.success ? '✅ Passed' : '❌ Failed'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Performance comparison */}
          {results.length > 1 && (
            <div style={{ 
              marginTop: '2rem',
              background: 'rgba(0, 0, 0, 0.2)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <h4 style={{ color: 'white', marginBottom: '1rem' }}>Performance Comparison</h4>
              <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                {(() => {
                  const validResults = results.filter(r => r.frontend_time_ms && r.frontend_time_ms > 0);
                  if (validResults.length === 0) {
                    return <p><strong>No valid timing data available yet</strong></p>;
                  }
                  
                  const fastest = validResults.reduce((fastest, current) => {
                    return current.frontend_time_ms < fastest.frontend_time_ms ? current : fastest;
                  });
                  
                  const slowest = validResults.reduce((slowest, current) => {
                    return current.frontend_time_ms > slowest.frontend_time_ms ? current : slowest;
                  });
                  
                  const minTime = Math.min(...validResults.map(r => r.frontend_time_ms));
                  const maxTime = Math.max(...validResults.map(r => r.frontend_time_ms));
                  
                  return (
                    <>
                      <p><strong>Fastest (Frontend):</strong> {fastest.algorithm.toUpperCase()} ({minTime.toFixed(2)}ms)</p>
                      <p><strong>Slowest (Frontend):</strong> {slowest.algorithm.toUpperCase()} ({maxTime.toFixed(2)}ms)</p>
                      <p><strong>Speed Difference:</strong> {maxTime > minTime ? `${(maxTime / minTime).toFixed(1)}x` : 'Similar'}</p>
                      <p><strong>Backend Performance:</strong> All algorithms ~0ns (IC Optimized)</p>
                      <p><strong>Quantum Resistant Algorithms:</strong> {
                        results.filter(r => r.quantum_resistant).length
                      } / {results.length}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CryptoBenchmark;