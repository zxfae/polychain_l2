import React from 'react';
import { Bitcoin, Hexagon, Circle, Sun, Link, Atom } from 'lucide-react';
import './chain-selector.css';

const SUPPORTED_CHAINS = [
  {
    id: 'Bitcoin',
    name: 'Bitcoin',
    token: 'BTC',
    icon: Bitcoin,
    color: 'var(--chain-btc)',
    description: 'Digital Gold with Quantum Security'
  },
  {
    id: 'Ethereum',
    name: 'Ethereum',
    token: 'ETH',
    icon: Hexagon,
    color: 'var(--chain-eth)',
    description: 'Smart Contracts with Quantum Upgrade'
  },
  {
    id: 'ICP',
    name: 'Internet Computer',
    token: 'ICP',
    icon: Circle,
    color: 'var(--chain-icp)',
    description: 'Native Quantum-Resistant Protocol'
  },
  {
    id: 'Solana',
    name: 'Solana',
    token: 'SOL',
    icon: Sun,
    color: 'var(--chain-sol)',
    description: 'High-Speed Quantum Evolution'
  }
];

function ChainSelector({ selectedChain, onChainChange, showMetrics = false }) {
  return (
    <div className="chain-selector">
      <div className="chain-selector-header">
        <h3>
          <Link size={20} />
          Select Blockchain
        </h3>
        <span className="quantum-badge">
          <Atom size={16} />
          All Quantum-Ready
        </span>
      </div>
      
      <div className="chain-grid">
        {SUPPORTED_CHAINS.map((chain, index) => {
          const IconComponent = chain.icon;
          const isSelected = selectedChain === chain.id;
          
          return (
            <button
              key={chain.id}
              className={`chain-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onChainChange(chain.id)}
              style={{ '--chain-color': chain.color, '--i': index }}
            >
              <div className="chain-header">
                <IconComponent size={28} />
                <div className="chain-info">
                  <span className="chain-name">{chain.name}</span>
                  <span className="chain-token">{chain.token}</span>
                </div>
              </div>
              
              <p className="chain-description">{chain.description}</p>
              
              {showMetrics && (
                <div className="chain-metrics">
                  <div className="metric">
                    <span>Compression</span>
                    <span className="metric-value">70%</span>
                  </div>
                  <div className="metric">
                    <span>Quantum</span>
                    <span className="metric-value quantum">✓</span>
                  </div>
                </div>
              )}
              
              {isSelected && (
                <div className="selection-indicator">
                  <div className="pulse-dot"></div>
                  Active
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ChainSelector;
export { SUPPORTED_CHAINS };
