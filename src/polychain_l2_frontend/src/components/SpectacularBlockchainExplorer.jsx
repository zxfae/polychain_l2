import React, { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, Hash, Clock, Users, ArrowRight, CornerUpLeft } from 'lucide-react';
import { safeNumber } from '../utils/bigint-utils';
import './spectacular-blockchain-explorer.css';

// --- Petits composants pour la clarté ---

// Carte pour une statistique unique
const StatCard = ({ icon, label, value }) => (
  <div className="stat-item ds-card-glass">
    <div className="label">
      {icon}
      {label}
    </div>
    <div className="value">{value}</div>
  </div>
);

// Élément cliquable dans la liste des blocs
const BlockListItem = ({ block, isSelected, onClick }) => {
  const formatHash = (hash) => hash ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}` : 'N/A';
  
  return (
    <div 
      className={`block-item ds-card-glass ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View details for block ${block.height}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className="block-item-header">
        <span className="block-height"><Hash size={16} /> Block #{block.height}</span>
        <span className="block-tx-count">{block.transactions.length} TXs</span>
      </div>
      <div className="block-hash">{formatHash(block.hash)}</div>
    </div>
  );
};

const BlockDetailsPanel = ({ block, formatTime }) => {
  if (!block) {
    return (
      <div className="details-panel details-placeholder ds-card-glass">
        <CornerUpLeft size={48} />
        <h3>Select a Block</h3>
        <p>The details of the selected block will be displayed here</p>
      </div>
    );
  }
  
  return (
    <div className="details-panel ds-card-glass">
      <div className="details-header">
        <h3>Block Details #{block.height}</h3>
        <span>
          <Clock size={12} style={{ verticalAlign: 'middle' }} /> {formatTime(block.timestamp)}
        </span>
      </div>
      
      <div className="details-grid">
        <div className="detail-item"><span className="label">Hash</span><span className="value">{block.hash}</span></div>
        <div className="detail-item"><span className="label">Hash Précédent</span><span className="value">{block.previous_hash}</span></div>
        <div className="detail-item"><span className="label">Nonce</span><span className="value">{safeNumber(block.nonce)}</span></div>
      </div>

      <div className="transactions-section">
        <h3><Users size={18} /> Transactions ({block.transactions.length})</h3>
        <div className="transactions-list">
          {block.transactions.length > 0 ? block.transactions.map((tx, i) => (
            <div key={i} className="transaction-item ds-card-glass">
              <div className="detail-item"><span className="label">De</span><span className="value">{tx.sender}</span></div>
              <div style={{ textAlign: 'center', margin: '8px' }}><ArrowRight size={16} /></div>
              <div className="detail-item"><span className="label">À</span><span className="value">{tx.recipient}</span></div>
              <div className="detail-item" style={{ marginTop: '16px' }}><span className="label">Montant</span><span className="value">{safeNumber(tx.amount)} COIN</span></div>
            </div>
          )) : <p>Aucune transaction dans ce bloc.</p>}
        </div>
      </div>
    </div>
  );
};

// --- Composant principal ---

const BlockchainExplorer = ({ actor }) => {
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const canvasRef = useRef();
  const animationRef = useRef();
  const nodesRef = useRef([]);

  const loadBlockchainData = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [recentBlocks, blockchainStats] = await Promise.all([
        actor.get_recent_blocks(20),
        actor.get_blockchain_stats(),
      ]);

      const sortedBlocks = recentBlocks.map((b, i) => ({...b, height: safeNumber(blockchainStats.chain_height) - (recentBlocks.length - 1 - i)})).reverse();
      
      setBlocks(sortedBlocks);
      setStats({
        height: safeNumber(blockchainStats.chain_height),
        total_txs: safeNumber(blockchainStats.total_transactions),
        total_blocks: safeNumber(blockchainStats.total_blocks),
        avg_tx_per_block: safeNumber(blockchainStats.average_tx_per_block).toFixed(1),
      });

      if (selectedBlock) {
        const updatedSelectedBlock = sortedBlocks.find(b => b.hash === selectedBlock.hash);
        if (updatedSelectedBlock) {
          setSelectedBlock(updatedSelectedBlock);
        }
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
    setLoading(false);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  useEffect(() => {
    loadBlockchainData();
    const interval = setInterval(loadBlockchainData, 15000);
    return () => clearInterval(interval);
  }, [actor]);

  useEffect(() => {
    const initializeVisualization = () => {
      nodesRef.current = Array.from({ length: 80 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.6 + 0.3,
        color: ['#4488ff', '#44ff88', '#ffaa44', '#ff6644'][Math.floor(Math.random() * 4)],
        connections: []
      }));
    };

    const startVisualization = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        nodesRef.current.forEach(particle => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

          nodesRef.current.forEach(other => {
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

    initializeVisualization();
    startVisualization();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="explorer-layout ds-card">
      <canvas ref={canvasRef} className="explorer-canvas" />
      <div className="hub-content">
        <div className="explorer-content">
          {stats && (
            <div className="stats-panel ds-card-glass">
              <h3 className="panel-title">Chain Statistics</h3>
              <div className="stats-grid ds-grid">
                <StatCard icon={<Hash size={16} />} label="Height" value={stats.height.toLocaleString()} />
                <StatCard icon={<Users size={16} />} label="Transactions" value={stats.total_txs.toLocaleString()} />
                <StatCard icon={<Clock size={16} />} label="Total Blocks" value={stats.total_blocks.toLocaleString()} />
                <StatCard icon={<ArrowRight size={16} />} label="Tx / Bloc" value={stats.avg_tx_per_block} />
              </div>
            </div>
          )}

          <div className="recent-blocks-panel ds-card-glass">
            <div className="panel-header">
              <h3 className="panel-title">Recent Blocks</h3>
              <button 
                onClick={loadBlockchainData} 
                disabled={loading} 
                className="button button-secondary ds-button"
                aria-label="Refresh blockchain data"
              >
                <RefreshCw size={14} className={loading ? 'ds-animate-spin' : ''} />
                Refresh
              </button>
            </div>
            <div className="recent-blocks-horizontal-container">
              {blocks.map(block => (
                <BlockListItem
                  key={block.hash}
                  block={block}
                  isSelected={selectedBlock?.hash === block.hash}
                  onClick={() => setSelectedBlock(block)}
                />
              ))}
            </div>
          </div>
          
          <BlockDetailsPanel block={selectedBlock} formatTime={formatTime} />
        </div>
      </div>
    </div>
  );
};

export default BlockchainExplorer;
