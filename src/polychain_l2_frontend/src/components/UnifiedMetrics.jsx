import React, { useState, useEffect } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { SUPPORTED_CHAINS } from './ChainSelector';
import { BarChart3, TrendingUp, Shield, Zap, Layers, Globe } from 'lucide-react';

function UnifiedMetrics() {
  const [metrics, setMetrics] = useState(null);
  const [supportedChains, setSupportedChains] = useState([]);
  const [quantumReady, setQuantumReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      const [metricsData, chainsData, quantumData] = await Promise.all([
        polychain_l2_backend.get_multi_chain_metrics(),
        polychain_l2_backend.get_supported_chains(),
        polychain_l2_backend.is_quantum_ready_all_chains()
      ]);
      
      setMetrics(metricsData);
      setSupportedChains(chainsData);
      setQuantumReady(quantumData);
    } catch (error) {
      console.error('Failed to load unified metrics:', error);
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
      // Les valeurs sont déjà en unités principales (BTC, ETH, ICP, SOL)
      const numValue = Number(value);
      return numValue.toFixed(8);
    }
    
    return chainInfo?.token || chainId;
  };

  if (loading) {
    return (
      <div className="unified-metrics loading">
        <div className="loading-spinner">
          <Layers className="spin" />
          <span>Loading Universal Metrics...</span>
        </div>
      </div>
    );
  }

  const totalValueLocked = metrics?.total_value_locked || [];
  const transactionCounts = metrics?.transaction_counts || [];
  const compressionSavings = metrics?.compression_savings || [];

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
    <div className="unified-metrics">
      <div className="metrics-header">
        <h2>
          <Globe size={24} />
          Universal Multi-Chain Analytics
        </h2>
        <div className="quantum-status">
          <Shield size={16} />
          <span className={quantumReady ? 'quantum-ready' : 'quantum-pending'}>
            {quantumReady ? '100% Quantum Ready' : 'Quantum Upgrading'}
          </span>
        </div>
      </div>

      <div className="metrics-grid">
        {/* Overview Cards */}
        <div className="overview-cards">
          <div className="metric-card total-tvl">
            <div className="card-header">
              <TrendingUp size={20} />
              <span>Total Value Locked</span>
            </div>
            <div className="card-value">
              ${totalTVL.toLocaleString()}
              <span className="card-subtitle">Across all chains</span>
            </div>
          </div>

          <div className="metric-card total-transactions">
            <div className="card-header">
              <BarChart3 size={20} />
              <span>Total Addresses</span>
            </div>
            <div className="card-value">
              {totalTransactions.toLocaleString()}
              <span className="card-subtitle">Multi-chain wallets</span>
            </div>
          </div>

          <div className="metric-card compression-rate">
            <div className="card-header">
              <Zap size={20} />
              <span>Compression Rate</span>
            </div>
            <div className="card-value">
              {avgCompression.toFixed(1)}%
              <span className="card-subtitle">Universal efficiency</span>
            </div>
          </div>

          <div className="metric-card quantum-coverage">
            <div className="card-header">
              <Shield size={20} />
              <span>Quantum Coverage</span>
            </div>
            <div className="card-value">
              {metrics?.quantum_ready_percentage?.toFixed(0) || 100}%
              <span className="card-subtitle">Security level</span>
            </div>
          </div>
        </div>

        {/* Chain Breakdown */}
        <div className="chain-breakdown">
          <h3>Chain-by-Chain Breakdown</h3>
          
          <div className="breakdown-grid">
            {supportedChains.map((chainVariant, index) => {
              const chainId = Object.keys(chainVariant)[0];
              const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
              const IconComponent = chainInfo?.icon || BarChart3;
              
              // Find corresponding metrics
              const tvlEntry = totalValueLocked.find(tuple => {
                const tupleChainId = Object.keys(tuple[0])[0];
                return tupleChainId === chainId;
              });
              
              const txEntry = transactionCounts.find(tuple => {
                const tupleChainId = Object.keys(tuple[0])[0];
                return tupleChainId === chainId;
              });
              
              const compressionEntry = compressionSavings.find(tuple => {
                const tupleChainId = Object.keys(tuple[0])[0];
                return tupleChainId === chainId;
              });
              
              const tvl = tvlEntry ? Number(tvlEntry[1]) : 0;
              const transactions = txEntry ? Number(txEntry[1]) : 0;
              const compression = compressionEntry ? Number(compressionEntry[1]) : 0;
              
              return (
                <div key={chainId} className="chain-card" style={{ '--chain-color': chainInfo?.color }}>
                  <div className="chain-header">
                    <IconComponent size={24} style={{ color: chainInfo?.color }} />
                    <div className="chain-info">
                      <span className="chain-name">{chainInfo?.name || chainId}</span>
                      <span className="chain-token">{chainInfo?.token || chainId}</span>
                    </div>
                  </div>
                  
                  <div className="chain-metrics">
                    <div className="chain-metric">
                      <span>TVL</span>
                      <span className="metric-value">
                        {formatChainValue([chainVariant, tvl])} {chainInfo?.token}
                      </span>
                    </div>
                    
                    <div className="chain-metric">
                      <span>Addresses</span>
                      <span className="metric-value">{transactions}</span>
                    </div>
                    
                    <div className="chain-metric">
                      <span>Compression</span>
                      <span className="metric-value compression-value">{compression}%</span>
                    </div>
                    
                    <div className="chain-metric">
                      <span>Quantum</span>
                      <span className="metric-value quantum-value">✅</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .unified-metrics {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--card-shadow);
        }

        .unified-metrics.loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 300px;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--text-secondary);
        }

        .spin {
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .metrics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .metrics-header h2 {
          margin: 0;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quantum-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 600;
        }

        .quantum-ready {
          color: #10b981;
          background: #10b98120;
        }

        .quantum-pending {
          color: #f59e0b;
          background: #f59e0b20;
        }

        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .metric-card {
          background: var(--bg-secondary);
          padding: 20px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .total-tvl { border-left: 4px solid #10b981; }
        .total-transactions { border-left: 4px solid #3b82f6; }
        .compression-rate { border-left: 4px solid #f59e0b; }
        .quantum-coverage { border-left: 4px solid #8b5cf6; }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
        }

        .card-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          flex-direction: column;
        }

        .card-subtitle {
          font-size: 12px;
          font-weight: 400;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .chain-breakdown h3 {
          margin: 0 0 16px 0;
          color: var(--text-primary);
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .chain-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          position: relative;
        }

        .chain-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--chain-color);
          border-radius: 12px 12px 0 0;
        }

        .chain-header {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }

        .chain-info {
          margin-left: 12px;
          display: flex;
          flex-direction: column;
        }

        .chain-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .chain-token {
          font-size: 12px;
          color: var(--text-secondary);
          background: var(--chain-color)20;
          padding: 2px 6px;
          border-radius: 4px;
          align-self: flex-start;
          margin-top: 2px;
        }

        .chain-metrics {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chain-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
        }

        .chain-metric span:first-child {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .metric-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .compression-value {
          color: #f59e0b;
        }

        .quantum-value {
          color: #10b981;
        }
      `}</style>
    </div>
  );
}

export default UnifiedMetrics;