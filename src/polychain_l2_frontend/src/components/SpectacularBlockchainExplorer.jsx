import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, RefreshCw, Hash, Clock, Users, ArrowRight, 
  CornerUpLeft, Activity, Zap, Shield, Database,
  Eye, ChevronDown, ChevronUp, Copy, ExternalLink
} from 'lucide-react';
import { safeNumber } from '../utils/bigint-utils';
import './spectacular-blockchain-explorer.css';

const SpectacularBlockchainExplorer = ({ actor }) => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalBlocks: 0,
    totalTransactions: 0,
    avgBlockTime: 0,
    chainHeight: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTx, setExpandedTx] = useState(null);
  
  const canvasRef = useRef();
  const animationRef = useRef();
  const nodesRef = useRef([]);

  useEffect(() => {
    loadData();
    initializeVisualization();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const initializeVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Initialize blockchain visualization nodes
    nodesRef.current = Array.from({ length: 20 }, (_, i) => ({
      x: (i % 10) * 80 + 50,
      y: Math.floor(i / 10) * 60 + 40,
      size: Math.random() * 8 + 4,
      opacity: Math.random() * 0.5 + 0.3,
      color: '#4488ff',
      connected: Math.random() > 0.3,
      pulse: Math.random() * Math.PI * 2
    }));
    
    startVisualization();
  };

  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections
      nodesRef.current.forEach((node, i) => {
        if (node.connected && i < nodesRef.current.length - 1) {
          const nextNode = nodesRef.current[i + 1];
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(nextNode.x, nextNode.y);
          ctx.strokeStyle = `rgba(68, 136, 255, ${0.3 + Math.sin(Date.now() * 0.003 + node.pulse) * 0.2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      
      // Draw nodes
      nodesRef.current.forEach(node => {
        const pulseSize = node.size + Math.sin(Date.now() * 0.005 + node.pulse) * 2;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = node.opacity;
        ctx.fill();
        
        // Add glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
      });
      
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [blocksData, txData, blockchainStats] = await Promise.all([
        actor.get_recent_blocks(20),
        actor.get_all_transactions(),
        actor.get_blockchain_stats()
      ]);

      const formattedBlocks = blocksData.map((block, index) => ({
        ...block,
        height: blocksData.length - index,
        transactions: block.transactions || []
      }));

      setBlocks(formattedBlocks);
      setTransactions(txData || []);
      
      setStats({
        totalBlocks: parseInt(blockchainStats.total_blocks) || formattedBlocks.length,
        totalTransactions: parseInt(blockchainStats.total_transactions) || txData.length,
        avgBlockTime: parseFloat(blockchainStats.average_tx_per_block) || 0,
        chainHeight: parseInt(blockchainStats.chain_height) || formattedBlocks.length
      });

      if (formattedBlocks.length > 0) {
        setSelectedBlock(formattedBlocks[0]);
      }
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredBlocks = blocks.filter(block => 
    block.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.height.toString().includes(searchTerm)
  );

  const StatCard = ({ icon: Icon, label, value, color = "#4488ff" }) => (
    <div className="stat-card" style={{ '--accent-color': color }}>
      <div className="stat-icon">
        <Icon size={24} />
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );

  const BlockCard = ({ block, isSelected, onClick }) => (
    <div 
      className={`block-card ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
      style={{ '--block-color': '#4488ff' }}
    >
      <div className="block-header">
        <div className="block-height">
          <Hash size={16} />
          Block #{block.height}
        </div>
        <div className="block-tx-count">
          {block.transactions.length} TXs
        </div>
      </div>
      
      <div className="block-hash">
        {formatHash(block.hash)}
      </div>
      
      <div className="block-time">
        <Clock size={14} />
        {formatTime(block.timestamp)}
      </div>
      
      {isSelected && (
        <div className="block-selected-indicator">
          <Activity size={16} />
        </div>
      )}
    </div>
  );

  const TransactionCard = ({ tx, isExpanded, onToggle }) => (
    <div className="transaction-card">
      <div className="tx-header" onClick={onToggle}>
        <div className="tx-basic-info">
          <div className="tx-participants">
            <span className="tx-from">From: {formatHash(tx.sender)}</span>
            <ArrowRight size={16} className="tx-arrow" />
            <span className="tx-to">To: {formatHash(tx.recipient)}</span>
          </div>
          <div className="tx-amount">
            {safeNumber(tx.amount)} POLY
          </div>
        </div>
        
        <div className="tx-controls">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="tx-details">
          <div className="tx-detail-row">
            <span>Transaction Hash:</span>
            <div className="tx-hash-container">
              <code>{tx.hash || 'N/A'}</code>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(tx.hash)}
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
          
          <div className="tx-detail-row">
            <span>Timestamp:</span>
            <span>{formatTime(tx.timestamp)}</span>
          </div>
          
          <div className="tx-detail-row">
            <span>Status:</span>
            <span className="tx-status confirmed">
              <Shield size={14} />
              Confirmed
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="spectacular-blockchain-explorer">
      <canvas ref={canvasRef} className="explorer-canvas" />
      
      <div className="explorer-header">
        <div className="header-content">
          <h2>
            <Database className="header-icon" />
            Blockchain Explorer
          </h2>
          <p>Explore blocks and transactions in real-time</p>
        </div>
        
        <div className="header-controls">
          <div className="search-container">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by block hash or height..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            onClick={loadData}
            disabled={loading}
            className="refresh-btn"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="explorer-stats">
        <StatCard
          icon={Database}
          label="Total Blocks"
          value={stats.totalBlocks.toLocaleString()}
          color="#4488ff"
        />
        <StatCard
          icon={Activity}
          label="Total Transactions"
          value={stats.totalTransactions.toLocaleString()}
          color="#44ff88"
        />
        <StatCard
          icon={Clock}
          label="Avg TX per Block"
          value={stats.avgBlockTime.toFixed(1)}
          color="#ffaa44"
        />
        <StatCard
          icon={Zap}
          label="Chain Height"
          value={stats.chainHeight}
          color="#ff6644"
        />
      </div>

      <div className="explorer-content">
        <div className="blocks-section">
          <h3>
            <Hash size={20} />
            Recent Blocks
          </h3>
          
          <div className="blocks-list">
            {filteredBlocks.map((block) => (
              <BlockCard
                key={block.hash}
                block={block}
                isSelected={selectedBlock?.hash === block.hash}
                onClick={() => setSelectedBlock(block)}
              />
            ))}
          </div>
        </div>

        <div className="details-section">
          {selectedBlock ? (
            <div className="block-details">
              <div className="details-header">
                <h3>
                  <Eye size={20} />
                  Block #{selectedBlock.height} Details
                </h3>
                <div className="block-meta">
                  <Clock size={14} />
                  {formatTime(selectedBlock.timestamp)}
                </div>
              </div>

              <div className="block-info">
                <div className="info-row">
                  <span>Block Hash:</span>
                  <div className="hash-container">
                    <code>{selectedBlock.hash}</code>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(selectedBlock.hash)}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                
                <div className="info-row">
                  <span>Previous Hash:</span>
                  <code>{formatHash(selectedBlock.previous_hash)}</code>
                </div>
                
                <div className="info-row">
                  <span>Transactions:</span>
                  <span>{selectedBlock.transactions.length}</span>
                </div>
              </div>

              <div className="transactions-section">
                <h4>
                  <Users size={18} />
                  Transactions in this Block
                </h4>
                
                {selectedBlock.transactions.length > 0 ? (
                  <div className="transactions-list">
                    {selectedBlock.transactions.map((tx, index) => (
                      <TransactionCard
                        key={index}
                        tx={tx}
                        isExpanded={expandedTx === index}
                        onToggle={() => setExpandedTx(expandedTx === index ? null : index)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-transactions">
                    <Activity size={32} />
                    <p>No transactions in this block</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="select-block-prompt">
              <CornerUpLeft size={48} />
              <h3>Select a Block</h3>
              <p>Click on a block from the list to view its details and transactions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpectacularBlockchainExplorer;