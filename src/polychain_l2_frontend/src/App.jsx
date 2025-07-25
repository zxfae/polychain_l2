// App.jsx - Version avec le nouveau design

import React, { useState, useEffect } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { safeConvertObject } from './utils/bigint-utils';
import { Shield, Activity, AlertTriangle, CheckCircle, Building2, BarChart3, Link, Menu, X, Gauge, Zap, Brain, Eye, Home } from 'lucide-react';

// Importez vos composants de page ici
import MultiChainUnifiedVault from './components/MultiChainUnifiedVault';
import UnifiedPerformanceAnalytics from './components/UnifiedPerformanceAnalytics';
import CryptoToolsHub from './components/CryptoToolsHub';

// Composants spectaculaires avec vraies données
import SpectacularBlockchainExplorer from './components/SpectacularBlockchainExplorer';
import SpectacularTransactionSequencer from './components/SpectacularTransactionSequencer';
import RealtimeDashboard from './components/RealtimeDashboard';
import QuantumThreatSimulator from './components/QuantumThreatSimulator';
import TransactionFlowVisualizer from './components/TransactionFlowVisualizer';
import CryptoRace from './components/CryptoRace';
import SpectacularLanding from './components/SpectacularLanding';

// Importez le NOUVEAU fichier CSS
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  const tabs = [
    // Page d'accueil spectaculaire
    { id: 'home', label: 'Home', icon: Home, component: <SpectacularLanding onNavigate={setActiveTab} />, description: "Page d'accueil spectaculaire avec présentation du projet." },
    
    // Composants spectaculaires avec vraies données
    { id: 'explorer', label: 'Blockchain Explorer', icon: Eye, component: <SpectacularBlockchainExplorer actor={polychain_l2_backend} />, description: "Explorez les blocs et transactions avec style spectaculaire." },
    { id: 'sequencer', label: 'TX Sequencer', icon: Activity, component: <SpectacularTransactionSequencer actor={polychain_l2_backend} />, description: "Visualisez le séquenceur de transactions avec animations." },
    { id: 'multi-vault', label: 'Multi-Chain Vault', icon: Building2, component: <MultiChainUnifiedVault />, description: "Gérez vos actifs sur plusieurs chaînes." },
    { id: 'crypto-tools', label: 'Crypto Tools Hub', icon: Shield, component: <CryptoToolsHub />, description: "Accédez à des outils cryptographiques." },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3, component: <UnifiedPerformanceAnalytics />, description: "Analysez les performances du réseau." },
    
    // Nouveaux composants avec vraies données
    { id: 'crypto-race', label: 'Crypto Race', icon: Zap, component: <CryptoRace />, description: "Vrais benchmarks de tes algorithmes cryptographiques." },
    { id: 'dashboard', label: 'Live Dashboard', icon: Gauge, component: <RealtimeDashboard />, description: "Dashboard avec tes vraies métriques animées." },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [metricsData, advancedMetricsData] = await Promise.all([
          polychain_l2_backend.get_performance_metrics(),
          polychain_l2_backend.get_layer2_advanced_metrics()
        ]);
        setMetrics(safeConvertObject(metricsData));
        setAdvancedMetrics(safeConvertObject(advancedMetricsData));
      } catch (error) {
        console.error('Failed to load initial data:', error);
      } finally {
        setTimeout(() => setLoading(false), 500); // Petite temporisation pour l'effet
      }
    };
    loadData();
  }, []);

  const getThreatStatus = () => {
    if (!advancedMetrics) return 'status-warning';
    const level = advancedMetrics.quantum_threat_level;
    if (level >= 80) return 'status-danger';
    if (level >= 50) return 'status-warning';
    return 'status-success';
  };
  
  const getThreatIcon = () => {
    if (!advancedMetrics) return Shield;
    const level = advancedMetrics.quantum_threat_level;
    if (level >= 80) return AlertTriangle;
    if (level >= 50) return Shield;
    return CheckCircle;
  };

  const activeComponent = tabs.find(tab => tab.id === activeTab);

  const renderSidebar = () => (
    <div className="sidebar-content">
      <div className="logo-container">
        <div className="logo-icon">P</div>
        <h1>Polychain L2</h1>
        <p>Universal Multi-Chain</p>
      </div>
      <nav className="nav-menu">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setIsNavOpen(false);
            }}
          >
            <tab.icon />
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="app-container">
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {isNavOpen && <div className="backdrop" onClick={() => setIsNavOpen(false)}></div>}

      <div className="app-layout">
        {/* Barre latérale (Sidebar) */}
        <aside className={`sidebar ${isNavOpen ? 'nav-open' : ''}`}>
          {renderSidebar()}
        </aside>

        {/* Header (version mobile) */}
        <header className="mobile-header">
           <span className="mobile-title">{activeComponent?.label}</span>
           <button className="hamburger" onClick={() => setIsNavOpen(true)}>
             <Menu size={24} />
           </button>
        </header>

        {/* Header (version desktop) */}
        <header className="header">
          <div>
            {/* Peut-être des fils d'ariane ou autre chose ici */}
          </div>
          <div className="status-indicators">
            {advancedMetrics && (
              <div className={`status-indicator ${getThreatStatus()}`}>
                {React.createElement(getThreatIcon(), { size: 16 })}
                <span className="label">Quantum Threat:</span>
                <span className="value">{advancedMetrics.quantum_threat_level}%</span>
              </div>
            )}
            {metrics && (
              <div className="status-indicator">
                <Activity size={16} />
                <span className="label">TPS:</span>
                <span className="value">{metrics.transactions_per_second.toLocaleString()}</span>
              </div>
            )}
          </div>
        </header>

        {/* Contenu principal */}
        <main className="main-content">
          <div className="card">
            <div className="card-header">
              <h2>{activeComponent?.label}</h2>
              <p>{activeComponent?.description}</p>
            </div>
            <div className="card-body">
              {activeComponent?.component}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
