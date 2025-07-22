import React, { useState, useEffect } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { safeConvertObject } from './utils/bigint-utils';
import { Shield, Activity, AlertTriangle, CheckCircle, Building2, Brain, Zap, BarChart3, Package, Bitcoin, Link } from 'lucide-react';
import BitcoinVault from './components/BitcoinVault';
import MultiChainVault from './components/MultiChainVault';
import UnifiedMetrics from './components/UnifiedMetrics';
import CryptoBenchmark from './components/CryptoBenchmark';
import PerformanceMetrics from './components/PerformanceMetrics';
import TransactionManager from './components/TransactionManager';
import TransactionBatchCompressor from './components/TransactionBatchCompressor';
import TransactionSequencer from './components/TransactionSequencer';
import BlockchainExplorer from './components/BlockchainExplorer';
import CryptoAI from './components/CryptoAI';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('explorer');
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [advancedMetrics, setAdvancedMetrics] = useState(null);

  useEffect(() => {
    loadMetrics();
    loadAdvancedMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await polychain_l2_backend.get_performance_metrics();
      const safeData = safeConvertObject(data);
      setMetrics(safeData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdvancedMetrics = async () => {
    try {
      const data = await polychain_l2_backend.get_layer2_advanced_metrics();
      const safeData = safeConvertObject(data);
      setAdvancedMetrics(safeData);
    } catch (error) {
      console.error('Failed to load advanced metrics:', error);
    }
  };

  const getThreatLevel = () => {
    if (!advancedMetrics) return 'medium';
    const level = advancedMetrics.quantum_threat_level;
    if (level >= 80) return 'danger';
    if (level >= 50) return 'warning';
    return 'success';
  };

  const getThreatIcon = () => {
    const level = getThreatLevel();
    switch (level) {
      case 'danger': return AlertTriangle;
      case 'warning': return Shield;
      case 'success': return CheckCircle;
      default: return Shield;
    }
  };

  const tabs = [
    { id: 'multi-vault', label: 'Multi-Chain Vault', icon: Building2 },
    { id: 'explorer', label: 'Blockchain Explorer', icon: Link },
    { id: 'sequencer', label: 'TX Sequencer', icon: Activity },
    { id: 'unified-metrics', label: 'Universal Analytics', icon: BarChart3 },
    { id: 'compressor', label: 'Compression', icon: Package },
    { id: 'vault', label: 'Bitcoin Legacy', icon: Bitcoin },
    { id: 'crypto-ai', label: 'Crypto AI', icon: Brain },
    { id: 'benchmark', label: 'Benchmark', icon: Zap },
  ];

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src="/logo2.svg" alt="Polychain L2" className="logo" />
            <h1>
              <Link size={20} />
              Polychain L2 - Universal Multi-Chain
            </h1>
          </div>
          <div className="header-right">
            {advancedMetrics && (
              <>
                <div className={`status-indicator ${getThreatLevel()}`}>
                  {React.createElement(getThreatIcon(), { size: 16 })}
                  <span>Quantum Threat: {advancedMetrics.quantum_threat_level}%</span>
                </div>
                <div className="status-indicator success">
                  <Activity size={16} />
                  <span>Security: {advancedMetrics.security_score.toFixed(0)}/100</span>
                </div>
              </>
            )}
            {metrics && (
              <div className="status-indicator success">
                <CheckCircle size={16} />
                <span>TPS: {metrics.transactions_per_second.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="navigation">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="main-content">
        {loading && <div className="loading">Loading...</div>}
        
        {activeTab === 'multi-vault' && <MultiChainVault />}
        {activeTab === 'explorer' && <BlockchainExplorer actor={polychain_l2_backend} />}
        {activeTab === 'sequencer' && <TransactionSequencer actor={polychain_l2_backend} />}
        {activeTab === 'unified-metrics' && <UnifiedMetrics />}
        {activeTab === 'compressor' && <TransactionBatchCompressor />}
        {activeTab === 'vault' && <BitcoinVault />}
        {activeTab === 'crypto-ai' && <CryptoAI />}
        {activeTab === 'benchmark' && <CryptoBenchmark />}
        {activeTab === 'analytics' && <PerformanceMetrics />}
      </main>
    </div>
  );
}

export default App;
