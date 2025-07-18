import { useState, useEffect } from 'react';
import { polychain_l2_backend } from '../declarations/polychain_l2_backend';

function PerformanceMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [vaultStats, setVaultStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [performanceData, vaultData] = await Promise.all([
        polychain_l2_backend.get_performance_metrics(),
        polychain_l2_backend.get_vault_statistics()
      ]);
      
      setMetrics(performanceData);
      setVaultStats(vaultData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="loading">Loading performance metrics...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>System Performance Metrics</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          Real-time performance data and system statistics for Polychain L2.
        </p>

        <button 
          className="button secondary" 
          onClick={loadMetrics}
          style={{ marginBottom: '2rem' }}
        >
          Refresh Metrics
        </button>

        {metrics && (
          <div className="grid">
            <div className="stat-card">
              <h4>Transactions Per Second</h4>
              <div className="value">{Number(metrics.transactions_per_second).toLocaleString()}</div>
              <div className="unit">TPS</div>
            </div>

            <div className="stat-card">
              <h4>Quantum Resistant</h4>
              <div className="value" style={{ color: metrics.quantum_resistant ? '#4ade80' : '#ef4444' }}>
                {metrics.quantum_resistant ? '✅' : '❌'}
              </div>
              <div className="unit">{metrics.quantum_resistant ? 'Active' : 'Inactive'}</div>
            </div>

            <div className="stat-card">
              <h4>Bitcoin Integration</h4>
              <div className="value" style={{ color: metrics.bitcoin_integration ? '#4ade80' : '#ef4444' }}>
                {metrics.bitcoin_integration ? '✅' : '❌'}
              </div>
              <div className="unit">{metrics.bitcoin_integration ? 'Active' : 'Inactive'}</div>
            </div>

            <div className="stat-card">
              <h4>Hybrid Vault</h4>
              <div className="value" style={{ color: metrics.hybrid_vault_active ? '#4ade80' : '#ef4444' }}>
                {metrics.hybrid_vault_active ? '✅' : '❌'}
              </div>
              <div className="unit">{metrics.hybrid_vault_active ? 'Active' : 'Inactive'}</div>
            </div>
          </div>
        )}

        {metrics && (
          <div style={{ marginTop: '2rem' }}>
            <h3>Supported Cryptographic Algorithms</h3>
            <div className="algorithms-grid">
              {metrics.supported_algorithms.map((algo, index) => (
                <div key={index} className={`algorithm-card ${algo.includes('Falcon') || algo.includes('ML-DSA') ? 'quantum' : ''}`}>
                  <h4>{algo}</h4>
                  <p>{algo.includes('Falcon') || algo.includes('ML-DSA') ? '🔒 Quantum Resistant' : '🔑 Classical'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {vaultStats && (
        <div className="card">
          <h2>Bitcoin Vault Statistics</h2>
          
          <div className="grid">
            <div className="stat-card">
              <h4>Total Deposits</h4>
              <div className="value">{(Number(vaultStats.total_deposits_satoshi) / 100000000).toFixed(8)}</div>
              <div className="unit">BTC</div>
            </div>

            <div className="stat-card">
              <h4>Total Transactions</h4>
              <div className="value">{Number(vaultStats.total_transactions).toLocaleString()}</div>
              <div className="unit">TX</div>
            </div>

            <div className="stat-card">
              <h4>Native Addresses</h4>
              <div className="value">{Number(vaultStats.native_addresses)}</div>
              <div className="unit">Addresses</div>
            </div>

            <div className="stat-card">
              <h4>Wrapped Addresses</h4>
              <div className="value">{Number(vaultStats.wrapped_addresses)}</div>
              <div className="unit">Addresses</div>
            </div>

            <div className="stat-card">
              <h4>Deposit Threshold</h4>
              <div className="value">{(Number(vaultStats.deposit_threshold) / 100000000).toFixed(8)}</div>
              <div className="unit">BTC</div>
            </div>

            <div className="stat-card">
              <h4>Vault Status</h4>
              <div className="value" style={{ color: vaultStats.vault_active ? '#4ade80' : '#ef4444' }}>
                {vaultStats.vault_active ? '✅' : '❌'}
              </div>
              <div className="unit">{vaultStats.vault_active ? 'Active' : 'Inactive'}</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>Vault Configuration</h4>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              <strong>Hybrid System:</strong> Deposits above {(Number(vaultStats.deposit_threshold) / 100000000).toFixed(8)} BTC 
              are stored as native Bitcoin reserves, while smaller amounts are managed as wrapped tokens for efficiency.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PerformanceMetrics;