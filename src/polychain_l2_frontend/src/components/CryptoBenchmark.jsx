import React, { useState, useCallback } from 'react';
import { Play, Target, Shield, Settings, RefreshCw } from 'lucide-react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { safeConvertObject } from '../utils/bigint-utils';
import './CryptoBenchmark.css';

function CryptoBenchmark() {
  const [message, setMessage] = useState('Hello Polychain L2!');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('ecdsa');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [iterations, setIterations] = useState(3);

  const algorithms = [
    { name: 'ECDSA', value: 'ecdsa', quantum: false },
    { name: 'Falcon512 (PQ)', value: 'falcon', quantum: true },
    { name: 'ML-DSA44 (PQ)', value: 'mldsa', quantum: true }
  ];

  const runBenchmark = useCallback(async () => {
    setLoading(true);
    const newResults = [];
    try {
      for (let i = 0; i < iterations; i++) {
        const result = await polychain_l2_backend.crypto_algorithm_benchmark(message, selectedAlgorithm);
        if ('Ok' in result) {
          newResults.push(safeConvertObject(result.Ok));
        }
      }
      setResults(prev => [...newResults, ...prev]);
    } catch (error) {
      console.error("Benchmark failed:", error);
    } finally {
      setLoading(false);
    }
  }, [iterations, message, selectedAlgorithm]);

  const formatTime = (ns) => `${(Number(ns) / 1_000_000).toFixed(3)} ms`;

  return (
    <div className="card">
      <div className="card-header">
        <h2>Benchmark Tests</h2>
        <p>Testez les performances des algorithmes cryptographiques.</p>
      </div>
      <div className="card-body">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div className="benchmark-grid">
          <div className="card">
            <div className="card-header">
              <h4><Settings size={18} /> Configuration</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Message à signer</label>
                <textarea
                  className="form-input"
                  rows="2"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Algorithme</label>
                <select
                  className="form-input"
                  value={selectedAlgorithm}
                  onChange={e => setSelectedAlgorithm(e.target.value)}
                >
                  {algorithms.map(algo => (
                    <option key={algo.value} value={algo.value}>{algo.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Itérations</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  max="10"
                  value={iterations}
                  onChange={e => setIterations(parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h4><Play size={18} /> Lancer les Tests</h4>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                Cliquez pour lancer le benchmark avec les paramètres actuels ou pour tester tous les algorithmes à la suite.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'auto' }}>
                <button onClick={runBenchmark} disabled={loading} className="button button-primary">
                  <Play size={16} /> {loading ? 'En cours...' : `Tester ${selectedAlgorithm.toUpperCase()}`}
                </button>
                <button disabled={loading} className="button button-secondary">
                  <Target size={16} /> Tester Tout
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4><Target size={18} /> Résultats</h4>
              <button
                onClick={() => setResults([])}
                className="button button-secondary"
                style={{ padding: '8px 12px', fontSize: '12px' }}
              >
                Vider
              </button>
            </div>
          </div>
          <div className="card-body">
            <table className="results-table">
              <thead>
                <tr>
                  <th>Algorithme</th>
                  <th>Temps Total</th>
                  <th>Post-Quantique</th>
                  <th>Taille Message</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((result, i) => (
                    <tr key={i}>
                      <td>{result.algorithm.toUpperCase()}</td>
                      <td>{formatTime(result.total_time_ns)}</td>
                      <td className={result.quantum_resistant ? 'quantum-safe' : 'quantum-classic'}>
                        {result.quantum_resistant ? 'Oui' : 'Non'}
                      </td>
                      <td>{result.message_length} bytes</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      Aucun résultat.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CryptoBenchmark;
