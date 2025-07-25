import React, { useState, useEffect, useRef } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { 
  Play, Pause, RotateCcw, Zap, ArrowRight, 
  Package, Users, TrendingUp, Activity, Settings
} from 'lucide-react';
import './transaction-flow-visualizer.css';

const TransactionFlowVisualizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [stats, setStats] = useState({
    totalTx: 0,
    blocksCreated: 0,
    averageBlockTime: 0,
    throughput: 0
  });
  
  const canvasRef = useRef();
  const animationRef = useRef();
  const particlesRef = useRef([]);
  const blocksRef = useRef([]);
  const timeRef = useRef(0);

  const chains = [
    { id: 'bitcoin', name: 'Bitcoin', color: '#f7931a', x: 100, y: 150 },
    { id: 'ethereum', name: 'Ethereum', color: '#627eea', x: 300, y: 100 },
    { id: 'icp', name: 'ICP', color: '#29abe2', x: 500, y: 150 },
    { id: 'solana', name: 'Solana', color: '#9945ff', x: 700, y: 100 },
  ];


  const sequencerPos = { x: 400, y: 300 };

  useEffect(() => {
    initializeCanvas();
    loadInitialData();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      startAnimation();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isPlaying, speed]);

  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    particlesRef.current = [];
    blocksRef.current = [];
  };

  const loadInitialData = async () => {
    try {
      const [txData, blockData, sequencerMetrics] = await Promise.all([
        polychain_l2_backend.get_all_transactions(),
        polychain_l2_backend.get_recent_blocks(10),
        polychain_l2_backend.get_sequencer_metrics()
      ]);
      
      setTransactions(txData.slice(-20)); // Dernières 20 transactions
      setBlocks(blockData);
      
      setStats({
        totalTx: parseInt(sequencerMetrics.total_transactions_sequenced),
        blocksCreated: parseInt(sequencerMetrics.total_batches_created),
        averageBlockTime: parseFloat(sequencerMetrics.average_sequencing_time_ms),
        throughput: Math.max(1, Math.round(sequencerMetrics.average_batch_size / (sequencerMetrics.average_sequencing_time_ms / 1000)))
      });
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Fallback avec des données minimales
      setStats({
        totalTx: 0,
        blocksCreated: 0,
        averageBlockTime: 0,
        throughput: 0
      });
    }
  };

  const createTransaction = () => {
    const sourceChain = chains[Math.floor(Math.random() * chains.length)];
    const targetChain = chains[Math.floor(Math.random() * chains.length)];
    
    const particle = {
      id: Date.now() + Math.random(),
      x: sourceChain.x,
      y: sourceChain.y,
      targetX: sequencerPos.x,
      targetY: sequencerPos.y,
      finalX: targetChain.x,
      finalY: targetChain.y,
      color: sourceChain.color,
      size: Math.random() * 4 + 3,
      speed: 2 + Math.random() * 3,
      phase: 'toSequencer', // toSequencer -> processing -> toChain -> complete
      opacity: 1,
      trail: [],
      value: Math.random() * 1000 + 100,
      sourceChain: sourceChain.name,
      targetChain: targetChain.name,
      timestamp: Date.now()
    };
    
    particlesRef.current.push(particle);
  };

  const createBlock = () => {
    const block = {
      id: Date.now(),
      x: sequencerPos.x,
      y: sequencerPos.y,
      size: 0,
      maxSize: 30,
      opacity: 1,
      color: '#44ff88',
      txCount: Math.floor(Math.random() * 10) + 5,
      timestamp: Date.now(),
      growing: true
    };
    
    blocksRef.current.push(block);
    
    setStats(prev => ({
      ...prev,
      blocksCreated: prev.blocksCreated + 1,
      totalTx: prev.totalTx + block.txCount
    }));
  };

  const startAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const animate = () => {
      timeRef.current += speed;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background grid
      drawGrid(ctx, canvas.width, canvas.height);
      
      // Draw chains
      drawChains(ctx);
      
      // Draw sequencer
      drawSequencer(ctx);
      
      // Create new transactions
      if (Math.random() < 0.1 * speed) {
        createTransaction();
      }
      
      // Create new blocks
      if (Math.random() < 0.02 * speed) {
        createBlock();
      }
      
      // Update and draw particles
      updateParticles(ctx);
      
      // Update and draw blocks
      updateBlocks(ctx);
      
      // Draw connections
      drawConnections(ctx);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawChains = (ctx) => {
    chains.forEach(chain => {
      // Draw chain node
      ctx.beginPath();
      ctx.arc(chain.x, chain.y, 25, 0, Math.PI * 2);
      ctx.fillStyle = chain.color;
      ctx.fill();
      
      // Add glow effect
      ctx.beginPath();
      ctx.arc(chain.x, chain.y, 35, 0, Math.PI * 2);
      ctx.strokeStyle = chain.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
      
      // Draw chain name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(chain.name, chain.x, chain.y - 45);
    });
  };

  const drawSequencer = (ctx) => {
    // Main sequencer body
    ctx.beginPath();
    ctx.arc(sequencerPos.x, sequencerPos.y, 40, 0, Math.PI * 2);
    ctx.fillStyle = '#4488ff';
    ctx.fill();
    
    // Pulsing effect
    const pulseSize = 50 + Math.sin(timeRef.current * 0.1) * 10;
    ctx.beginPath();
    ctx.arc(sequencerPos.x, sequencerPos.y, pulseSize, 0, Math.PI * 2);
    ctx.strokeStyle = '#4488ff';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.3;
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Sequencer label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('TX Sequencer', sequencerPos.x, sequencerPos.y + 60);
  };

  const drawConnections = (ctx) => {
    chains.forEach(chain => {
      ctx.beginPath();
      ctx.moveTo(chain.x, chain.y);
      ctx.lineTo(sequencerPos.x, sequencerPos.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  };

  const updateParticles = (ctx) => {
    particlesRef.current = particlesRef.current.filter(particle => {
      // Update position based on phase
      if (particle.phase === 'toSequencer') {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          particle.phase = 'processing';
          particle.processingTime = 20; // frames
        } else {
          particle.x += (dx / distance) * particle.speed * speed;
          particle.y += (dy / distance) * particle.speed * speed;
        }
      } else if (particle.phase === 'processing') {
        particle.processingTime--;
        particle.x = sequencerPos.x + Math.sin(timeRef.current * 0.3) * 15;
        particle.y = sequencerPos.y + Math.cos(timeRef.current * 0.3) * 15;
        
        if (particle.processingTime <= 0) {
          particle.phase = 'toChain';
          particle.targetX = particle.finalX;
          particle.targetY = particle.finalY;
        }
      } else if (particle.phase === 'toChain') {
        const dx = particle.targetX - particle.x;
        const dy = particle.targetY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
          particle.phase = 'complete';
          particle.opacity = 0;
        } else {
          particle.x += (dx / distance) * particle.speed * speed;
          particle.y += (dy / distance) * particle.speed * speed;
        }
      }
      
      // Add to trail
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > 8) {
        particle.trail.shift();
      }
      
      // Draw trail
      particle.trail.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, particle.size * (index / particle.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = (index / particle.trail.length) * particle.opacity * 0.6;
        ctx.fill();
      });
      
      // Draw main particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.globalAlpha = particle.opacity;
      ctx.fill();
      
      // Add glow for processing particles
      if (particle.phase === 'processing') {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
      
      return particle.opacity > 0;
    });
  };

  const updateBlocks = (ctx) => {
    blocksRef.current = blocksRef.current.filter(block => {
      if (block.growing) {
        block.size += 2 * speed;
        if (block.size >= block.maxSize) {
          block.growing = false;
        }
      } else {
        block.opacity -= 0.02 * speed;
      }
      
      // Draw block
      ctx.save();
      ctx.translate(block.x, block.y);
      ctx.rotate(timeRef.current * 0.02);
      
      ctx.fillStyle = block.color;
      ctx.globalAlpha = block.opacity;
      ctx.fillRect(-block.size/2, -block.size/2, block.size, block.size);
      
      // Draw block info
      if (block.opacity > 0.5) {
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`${block.txCount} TX`, 0, 3);
      }
      
      ctx.restore();
      
      return block.opacity > 0;
    });
  };

  const resetVisualization = () => {
    particlesRef.current = [];
    blocksRef.current = [];
    timeRef.current = 0;
    setStats({
      totalTx: 0,
      blocksCreated: 0,
      averageBlockTime: 0,
      throughput: 0
    });
  };

  return (
    <div className="transaction-flow-visualizer">
      <div className="visualizer-header">
        <h2>
          <Activity className="flow-icon" />
          Live Transaction Flow
        </h2>
        
        <div className="control-panel">
          <div className="playback-controls">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`play-btn ${isPlaying ? 'playing' : ''}`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button 
              onClick={resetVisualization}
              className="reset-btn"
            >
              <RotateCcw size={20} />
            </button>
            
            <div className="speed-control">
              <Settings size={16} />
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
              />
              <span>{speed}x</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-container">
        <canvas ref={canvasRef} className="flow-canvas" />
        
        <div className="flow-legend">
          <div className="legend-section">
            <h4>Chain Networks</h4>
            {chains.map(chain => (
              <div key={chain.id} className="legend-item">
                <div 
                  className="chain-indicator" 
                  style={{ backgroundColor: chain.color }}
                ></div>
                <span>{chain.name}</span>
              </div>
            ))}
          </div>
          
          <div className="legend-section">
            <h4>Transaction Flow</h4>
            <div className="legend-item">
              <ArrowRight size={16} style={{ color: '#4488ff' }} />
              <span>To Sequencer</span>
            </div>
            <div className="legend-item">
              <Zap size={16} style={{ color: '#ffaa44' }} />
              <span>Processing</span>
            </div>
            <div className="legend-item">
              <Package size={16} style={{ color: '#44ff88' }} />
              <span>Block Created</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flow-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTx.toLocaleString()}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.blocksCreated}</div>
            <div className="stat-label">Blocks Created</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.throughput}</div>
            <div className="stat-label">TPS</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{particlesRef.current.length}</div>
            <div className="stat-label">Active TX</div>
          </div>
        </div>
      </div>

      <div className="flow-info">
        <div className="info-panel">
          <h3>How it Works</h3>
          <div className="info-steps">
            <div className="step">
              <span className="step-number">1</span>
              <div>
                <strong>Cross-Chain Transactions</strong>
                <p>Transactions originate from multiple blockchain networks</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">2</span>
              <div>
                <strong>Sequencer Processing</strong>
                <p>All transactions are batched and ordered by the sequencer</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">3</span>
              <div>
                <strong>Block Creation</strong>
                <p>Processed transactions are packaged into blockchain blocks</p>
              </div>
            </div>
            
            <div className="step">
              <span className="step-number">4</span>
              <div>
                <strong>Network Distribution</strong>
                <p>Completed transactions reach their destination chains</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFlowVisualizer;
