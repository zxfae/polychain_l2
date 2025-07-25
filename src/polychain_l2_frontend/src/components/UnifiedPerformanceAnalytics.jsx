import React, { useState, useEffect } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { SUPPORTED_CHAINS } from './ChainSelector';
import { 
  BarChart3, TrendingUp, Shield, Zap, Layers, Globe, 
  RefreshCw, Activity, CheckCircle, AlertTriangle 
} from 'lucide-react';
import '../design-system.css';
import './unified-components.css';

function UnifiedPerformanceAnalytics() {
  const [activeSection, setActiveSection] = useState('system');
  const [metrics, setMetrics] = useState(null);
  const [multiChainMetrics, setMultiChainMetrics] = useState(null);
  const [vaultStats, setVaultStats] = useState(null);
  const [supportedChains, setSupportedChains] = useState([]);
  const [quantumReady, setQuantumReady] = useState(false);
  const [loading, setLoading] = useState(true);

  const sections = [
    { id: 'system', label: 'System Performance', icon: Activity },
    { id: 'multichain', label: 'Multi-Chain Analytics', icon: Globe },
  ];

  useEffect(() => {
    loadAllMetrics();
  }, []);

  const loadAllMetrics = async () => {
    try {
      setLoading(true);
      
      const [
        performanceData, 
        vaultData, 
        multiChainData, 
        quantumData
      ] = await Promise.all([
        polychain_l2_backend.get_performance_metrics(),
        polychain_l2_backend.get_vault_statistics(),
        polychain_l2_backend.get_multi_chain_metrics(),
        polychain_l2_backend.is_quantum_ready_all_chains()
      ]);
      
      setMetrics(performanceData);
      setVaultStats(vaultData);
      setMultiChainMetrics(multiChainData);
      setQuantumReady(quantumData);

      // Fallback pour les chaînes supportées
      const chainsData = [
        { ICP: null },
        { Bitcoin: null },
        { Ethereum: null },
        { Solana: null }
      ];
      setSupportedChains(chainsData);
      
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChainValue = (chainTuple, isValue = true) => {
    if (!chainTuple || !Array.isArray(chainTuple) || chainTuple.length < 2) return '0';
    
    const [chainVariant, value] = chainTuple;
    const chainId = Object.keys(chainVariant)[0];
    const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
    
    if (isValue) {
      const numValue = Number(value);
      return numValue.toFixed(8);
    }
    
    return chainInfo?.token || chainId;
  };

  if (loading) {
    return (
      <div className="ds-card-insight">
        <div className="loading-spinner">
          <Layers className="ds-animate-spin" />
          <span style={{ color: 'var(--ds-text-secondary)' }}>Loading Universal Analytics...</span>
        </div>
      </div>
    );
  }

  const totalValueLocked = multiChainMetrics?.total_value_locked || [];
  const transactionCounts = multiChainMetrics?.transaction_counts || [];
  const compressionSavings = multiChainMetrics?.compression_savings || [];

  const totalTVL = totalValueLocked.reduce((sum, tuple) => {
    const value = Number(tuple[1] || 0);
    return sum + value;
  }, 0);

  const totalTransactions = transactionCounts.reduce((sum, tuple) => {
    const value = Number(tuple[1] || 0);
    return sum + value;
  }, 0);

  const avgCompression = compressionSavings.length > 0 
    ? compressionSavings.reduce((sum, tuple) => sum + Number(tuple[1] || 0), 0) / compressionSavings.length
    : 0;

  return (
    <div className="ds-card-insight">
      <div className="analytics-header">
        <h2 className="ds-heading-component">
          <BarChart3 size={24} />
          Unified Performance Analytics
        </h2>
        <div className="quantum-status">
          <Shield size={16} />
          <span className={quantumReady ? 'quantum-ready' : 'quantum-pending'}>
            {quantumReady ? '100% Quantum Ready' : 'Quantum Upgrading'}
          </span>
        </div>
        <button 
          className="ds-button ds-button-secondary ds-button-sm" 
          onClick={loadAllMetrics}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Section Navigation */}
      <div className="section-nav" role="tablist" aria-label="Analytics sections">
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={`section-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
            role="tab"
            aria-selected={activeSection === section.id}
            aria-controls={`section-${section.id}`}
            id={`tab-${section.id}`}
            tabIndex={activeSection === section.id ? 0 : -1}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const direction = e.key === 'ArrowRight' ? 1 : -1;
                const nextIndex = (index + direction + sections.length) % sections.length;
                const nextSection = sections[nextIndex];
                setActiveSection(nextSection.id);
                setTimeout(() => {
                  document.getElementById(`tab-${nextSection.id}`)?.focus();
                }, 0);
              } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActiveSection(section.id);
              }
            }}
          >
            <section.icon size={18} aria-hidden="true" />
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* System Performance Section */}
      {activeSection === 'system' && (
        <div id="section-system" role="tabpanel" aria-labelledby="tab-system" className="system-performance">
          <div className="metrics-description">
            <p>Real-time performance data and system statistics for Polychain L2.</p>
          </div>

          {metrics && (
            <div className="metrics-grid ds-grid ds-grid-4">
              <div className="metric-card ds-card-glass">
                <h4>Transactions Per Second</h4>
                <div className="metric-value">
                  {(typeof metrics.transactions_per_second === 'bigint' 
                    ? Number(metrics.transactions_per_second) 
                    : metrics.transactions_per_second).toLocaleString()}
                </div>
                <div className="metric-unit">TPS</div>
              </div>

              <div className="metric-card ds-card-glass">
                <h4>Quantum Resistant</h4>
                <div className="metric-value" style={{ 
                  color: metrics.quantum_resistant ? 'var(--success-green)' : 'var(--danger-red)' 
                }}>
                  {metrics.quantum_resistant ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                </div>
                <div className="metric-unit">
                  {metrics.quantum_resistant ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="metric-card ds-card-glass">
                <h4>Bitcoin Integration</h4>
                <div className="metric-value" style={{ 
                  color: metrics.bitcoin_integration ? 'var(--success-green)' : 'var(--danger-red)' 
                }}>
                  {metrics.bitcoin_integration ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                </div>
                <div className="metric-unit">
                  {metrics.bitcoin_integration ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="metric-card ds-card-glass">
                <h4>Hybrid Vault</h4>
                <div className="metric-value" style={{ 
                  color: metrics.hybrid_vault_active ? 'var(--success-green)' : 'var(--danger-red)' 
                }}>
                  {metrics.hybrid_vault_active ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                </div>
                <div className="metric-unit">
                  {metrics.hybrid_vault_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          )}

          {metrics && (
            <div className="algorithms-section">
              <h3>Supported Cryptographic Algorithms</h3>
              <div className="algorithms-grid ds-grid ds-grid-4">
                {metrics.supported_algorithms.map((algo, index) => (
                  <div 
                    key={index} 
                    className={`algorithm-card ds-card-glass ${
                      algo.includes('Falcon') || algo.includes('ML-DSA') ? 'quantum' : ''
                    }`}
                  >
                    <h4>{algo}</h4>
                    <p>
                      {algo.includes('Falcon') || algo.includes('ML-DSA') 
                        ? '🔒 Quantum Resistant' 
                        : '🔑 Classical'
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {vaultStats && (
            <div className="vault-statistics">
              <h3>Vault Statistics</h3>
              <div className="vault-stats-grid ds-grid ds-grid-3">
                <div className="stat-card ds-card-glass">
                  <h4>Total Deposits</h4>
                  <div className="stat-value">
                    {(Number(vaultStats.total_deposits_satoshi) / 1e8).toFixed(8)}
                  </div>
                  <div className="stat-unit">BTC</div>
                </div>
                
                <div className="stat-card ds-card-glass">
                  <h4>Total Transactions</h4>
                  <div className="stat-value">
                    {Number(vaultStats.total_transactions).toLocaleString()}
                  </div>
                  <div className="stat-unit">Txs</div>
                </div>
                
                <div className="stat-card ds-card-glass">
                  <h4>Active Addresses</h4>
                  <div className="stat-value">
                    {Number(vaultStats.native_addresses) + Number(vaultStats.wrapped_addresses)}
                  </div>
                  <div className="stat-unit">Addresses</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Chain Analytics Section */}
      {activeSection === 'multichain' && (
        <div id="section-multichain" role="tabpanel" aria-labelledby="tab-multichain" className="multichain-analytics">
          <div className="analytics-overview">
            <h3>
              <Globe size={20} />
              Universal Multi-Chain Analytics
            </h3>
            <p>Cross-chain performance metrics and bridge statistics.</p>
          </div>

          {multiChainMetrics && (
            <>
              <div className="overview-stats ds-grid ds-grid-4">
                <div className="overview-card ds-card-glass">
                  <div className="overview-icon">
                    <TrendingUp size={24} />
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Total Value Locked</div>
                    <div className="overview-value">${totalTVL.toFixed(2)}</div>
                  </div>
                </div>

                <div className="overview-card ds-card-glass">
                  <div className="overview-icon">
                    <Activity size={24} />
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Cross-Chain Volume</div>
                    <div className="overview-value">
                      ${Number(multiChainMetrics.cross_chain_volume_24h || 0).toFixed(0)}
                    </div>
                  </div>
                </div>

                <div className="overview-card ds-card-glass">
                  <div className="overview-icon">
                    <Shield size={24} />
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Bridge Security</div>
                    <div className="overview-value">
                      {Number(multiChainMetrics.bridge_security_score || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="overview-card ds-card-glass">
                  <div className="overview-icon">
                    <Zap size={24} />
                  </div>
                  <div className="overview-content">
                    <div className="overview-label">Avg Compression</div>
                    <div className="overview-value">{avgCompression.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              <div className="chains-breakdown">
                <h4>Supported Blockchains</h4>
                <div className="chains-grid ds-grid ds-grid-6">
                  {multiChainMetrics.supported_chains.map((chain, index) => {
                    const chainInfo = SUPPORTED_CHAINS.find(c => c.name === chain);
                    const IconComponent = chainInfo?.icon || Globe;
                    
                    return (
                      <div key={index} className="chain-card ds-card-glass">
                        <div className="chain-icon" style={{ color: chainInfo?.color }}>
                          <IconComponent size={24} />
                        </div>
                        <div className="chain-name">{chain}</div>
                        {chainInfo && (
                          <div className="chain-token">{chainInfo.token}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bridge-metrics">
                <h4>Bridge Performance</h4>
                <div className="bridge-stats ds-grid ds-grid-4">
                  <div className="bridge-stat ds-card-glass">
                    <div className="stat-label">Total Bridges</div>
                    <div className="stat-value">{multiChainMetrics.total_bridges}</div>
                  </div>
                  
                  <div className="bridge-stat ds-card-glass">
                    <div className="stat-label">Avg Bridge Time</div>
                    <div className="stat-value">{Number(multiChainMetrics.average_bridge_time).toFixed(1)}s</div>
                  </div>
                  
                  <div className="bridge-stat ds-card-glass">
                    <div className="stat-label">Active Validators</div>
                    <div className="stat-value">{multiChainMetrics.active_validators}</div>
                  </div>
                  
                  <div className="bridge-stat ds-card-glass">
                    <div className="stat-label">Uptime</div>
                    <div className="stat-value">{Number(multiChainMetrics.bridge_uptime).toFixed(2)}%</div>
                  </div>
                </div>
              </div>

              {totalValueLocked.length > 0 && (
                <div className="tvl-breakdown">
                  <h4>Total Value Locked by Chain</h4>
                  <div className="tvl-list">
                    {totalValueLocked.map((tuple, index) => {
                      const value = formatChainValue(tuple, true);
                      const token = formatChainValue(tuple, false);
                      const chainId = Object.keys(tuple[0])[0];
                      const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
                      const IconComponent = chainInfo?.icon || Globe;
                      
                      return (
                        <div key={index} className="tvl-item ds-card-glass">
                          <div className="tvl-chain">
                            <IconComponent size={16} style={{ color: chainInfo?.color }} />
                            <span>{token}</span>
                          </div>
                          <div className="tvl-value">{value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default UnifiedPerformanceAnalytics;