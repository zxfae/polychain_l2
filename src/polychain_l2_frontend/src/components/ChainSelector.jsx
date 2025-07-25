import React, { useEffect, useRef } from 'react';
import { Bitcoin, Hexagon, Circle, Sun, Link, Atom } from 'lucide-react';
import '../design-system.css';
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
  const canvasRef = useRef();
  const animationRef = useRef();
  const particlesRef = useRef([]);

  useEffect(() => {
    initializeParticles();
    startBackgroundAnimation();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const initializeParticles = () => {
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.2,
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

            if (distance < 80) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(68, 136, 255, ${0.15 * (1 - distance / 80)})`;
              ctx.lineWidth = 0.5;
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

  return (
    <div className="chain-selector ds-card-glass">
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="selector-content">
        <div className="panel-header">
          <h3 className="panel-title">
            <Link size={24} />
            Select Blockchain
          </h3>
          <span className="quantum-badge ds-badge">
            <Atom size={16} />
            All Quantum-Ready
          </span>
        </div>

        <div className="chains-horizontal-container">
          {SUPPORTED_CHAINS.map((chain, index) => {
            const IconComponent = chain.icon;
            const isSelected = selectedChain === chain.id;

            return (
              <button
                key={chain.id}
                className={`chain-item ds-card-glass ${isSelected ? 'selected' : ''}`}
                onClick={() => onChainChange(chain.id)}
                style={{ '--chain-color': chain.color, '--i': index }}
                aria-label={`Select ${chain.name} blockchain`}
                aria-pressed={isSelected}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChainChange(chain.id);
                  }
                }}
              >
                <div className="chain-header">
                  <IconComponent size={24} />
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
    </div>
  );
}

export default ChainSelector;
export { SUPPORTED_CHAINS };
