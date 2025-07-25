import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RefreshCw, CheckCircle, Clock, Package, Shield, Settings,
  Plus, Play, AlertTriangle, Zap, Activity, Users, Target,
  ArrowRight, Pause, RotateCcw, TrendingUp, Database, Hash
} from 'lucide-react';
import './spectacular-transaction-sequencer.css';

const SpectacularTransactionSequencer = ({ actor }) => {
  // --- États ---
  const [sequencerData, setSequencerData] = useState({
    metrics: {
      total_transactions_sequenced: 0,
      current_pending_count: 0,
      average_batch_size: 0,
      fairness_score: 0,
      total_batches_created: 0,
      average_sequencing_time_ms: 0,
      ordering_strategy: 'FairOrdering',
    },
  });
  const [newTransaction, setNewTransaction] = useState({ sender: '', recipient: '', amount: '' });
  const [batchSize, setBatchSize] = useState(100);
  const [selectedStrategy, setSelectedStrategy] = useState('fair');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [createdBlocks, setCreatedBlocks] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isSequencing, setIsSequencing] = useState(false);
  const [sequencingProgress, setSequencingProgress] = useState(0);

  // --- Visualisation ---
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const transactionParticles = useRef([]);
  const floatingOrbs = useRef([]);

  // --- Gestion des messages ---
  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  // --- Charger les données du séquenceur ---
  const loadSequencerData = useCallback(async () => {
    if (!actor) {
      displayMessage('Actor is not initialized.', 'error');
      return;
    }
    setLoading(true);
    try {
      const metrics = await actor.get_sequencer_metrics();
      setSequencerData({ metrics });

      if (actor.get_sequencer_created_blocks) {
        const blocks = await actor.get_sequencer_created_blocks([BigInt(5)]);
        setCreatedBlocks(blocks);
      }

      if (actor.get_all_transactions) {
        const transactions = await actor.get_all_transactions();
        setRecentTransactions(transactions.slice(-10));
      }
    } catch (error) {
      console.error('Error loading sequencer data:', error);
      displayMessage(`Error loading sequencer data: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [actor]);

  // --- Initialisation de la visualisation ---
  const initializeVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    transactionParticles.current = [];

    floatingOrbs.current = [
      { x: canvas.width * 0.1, y: canvas.height * 0.2, size: 40, baseSize: 40, color: 'rgba(68, 136, 255, 0.2)', phase: 0 },
      { x: canvas.width * 0.8, y: canvas.height * 0.6, size: 40, baseSize: 40, color: 'rgba(255, 170, 68, 0.2)', phase: 1.5 },
      { x: canvas.width * 0.3, y: canvas.height * 0.7, size: 40, baseSize: 40, color: 'rgba(68, 255, 136, 0.2)', phase: 3 },
      { x: canvas.width * 0.9, y: canvas.height * 0.1, size: 40, baseSize: 40, color: 'rgba(255, 68, 136, 0.2)', phase: 4.5 },
    ];
    startVisualization();
  }, []);

  const startVisualization = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      floatingOrbs.current.forEach((orb) => {
        orb.y = orb.y + Math.sin(Date.now() * 0.001 + orb.phase) * 0.5;
        orb.size = orb.baseSize + Math.sin(Date.now() * 0.001 + orb.phase) * 5;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        ctx.fill();
        ctx.strokeStyle = orb.color.replace('0.2', '0.4');
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      drawSequencerPipeline(ctx, canvas.width, canvas.height);
      updateTransactionParticles(ctx);
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);

  const drawSequencerPipeline = (ctx, width, height) => {
    const centerY = height / 2;
    const stages = [
      { x: width * 0.1, label: 'Input', color: '#4488ff' },
      { x: width * 0.3, label: 'Queue', color: '#ffaa44' },
      { x: width * 0.5, label: 'Sequence', color: '#44ff88' },
      { x: width * 0.7, label: 'Batch', color: '#ff6644' },
      { x: width * 0.9, label: 'Block', color: '#8844ff' },
    ];

    for (let i = 0; i < stages.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(stages[i].x + 30, centerY);
      ctx.lineTo(stages[i + 1].x - 30, centerY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    stages.forEach((stage, index) => {
      const isActive = isSequencing && index <= sequencingProgress;
      const size = isActive ? 25 + Math.sin(Date.now() * 0.01) * 5 : 20;
      ctx.beginPath();
      ctx.arc(stage.x, centerY, size, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? stage.color : `${stage.color}40`;
      ctx.fill();
      if (isActive) {
        ctx.beginPath();
        ctx.arc(stage.x, centerY, size + 10, 0, Math.PI * 2);
        ctx.strokeStyle = stage.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(stage.label, stage.x, centerY + 50);
    });
  };

  const updateTransactionParticles = (ctx) => {
    // Particle logic remains the same
  };

  const createSequencer = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const result = await actor.create_transaction_sequencer(selectedStrategy);
      if ('Ok' in result) {
        displayMessage(result.Ok, 'success');
        await loadSequencerData();
      } else {
        displayMessage(result.Err, 'error');
      }
    } catch (error) {
      displayMessage(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async () => {
    if (!actor || !newTransaction.sender || !newTransaction.recipient || !newTransaction.amount) {
      displayMessage('Please fill all transaction fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await actor.add_transaction_to_sequencer(
        newTransaction.sender,
        newTransaction.recipient,
        parseFloat(newTransaction.amount)
      );
      if ('Ok' in result) {
        displayMessage(result.Ok, 'success');
        setNewTransaction({ sender: '', recipient: '', amount: '' });
        await loadSequencerData();
      } else {
        displayMessage(result.Err, 'error');
      }
    } catch (error) {
      displayMessage(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const sequenceBatch = async () => {
    if (!actor) return;
    setIsSequencing(true);
    setSequencingProgress(0);
    const animateProgress = () => {
      setSequencingProgress((prev) => {
        if (prev < 4) {
          setTimeout(animateProgress, 800);
          return prev + 1;
        }
        return prev;
      });
    };
    animateProgress();

    try {
      const size = BigInt(Math.max(1, batchSize));
      const result = await actor.sequence_transaction_batch([size]);
      if ('Ok' in result) {
        displayMessage(`Batch processed: ${result.Ok.transaction_count} transactions`, 'success');
        await loadSequencerData();
      } else {
        displayMessage(result.Err, 'error');
      }
    } catch (error) {
      displayMessage(`Error: ${error.message}`, 'error');
    } finally {
      setIsSequencing(false);
      setSequencingProgress(0);
    }
  };

  const strategies = [
    { id: 'fcfs', label: 'First Come First Served', description: 'Process transactions in arrival order' },
    { id: 'priority', label: 'Priority Fee', description: 'Higher fees get priority' },
    { id: 'fair', label: 'Fair Ordering', description: 'Balanced fairness algorithm' },
    { id: 'vrf', label: 'VRF Random', description: 'Verifiable random ordering' },
  ];

  const MetricCard = ({ icon: Icon, value, label, color = '#4488ff', trend }) => (
    <div className="metric-card" style={{ '--accent-color': color }}>
      <div className="metric-icon"><Icon size={24} /></div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-label">{label}</div>
        {trend && (
          <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={14} />{Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  useEffect(() => {
    loadSequencerData();
    // Visualization init and cleanup remains the same
  }, [loadSequencerData]);

  return (
    <div className="spectacular-transaction-sequencer">
      <div className="sequencer-header">
        <div className="header-content">
          <h2><Activity className="header-icon" />Transaction Sequencer</h2>
          <p>Orchestrate blockchain transactions with advanced sequencing algorithms</p>
        </div>
        <div className="header-controls">
          <button onClick={loadSequencerData} disabled={loading} className="refresh-btn">
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />Refresh
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}{message.text}
        </div>
      )}

      <div className="sequencer-metrics">
        <MetricCard icon={Database} value={sequencerData.metrics.total_transactions_sequenced?.toLocaleString() || '0'} label="Total Sequenced" color="#4488ff" />
        <MetricCard icon={Clock} value={sequencerData.metrics.current_pending_count?.toLocaleString() || '0'} label="Pending Count" color="#ffaa44" />
        <MetricCard icon={Package} value={sequencerData.metrics.average_batch_size?.toFixed(1) || '0'} label="Avg Batch Size" color="#44ff88" />
        <MetricCard icon={Target} value={`${(sequencerData.metrics.fairness_score * 100)?.toFixed(1) || '0'}%`} label="Fairness Score" color="#ff6644" />
      </div>

      <div className="sequencer-content">
        {/* Section 1: Panneau de contrôle principal */}
        <div className="main-controls-panel">
          <div className="control-section">
            <h3><Settings size={20} />Configuration</h3>
            <div className="strategy-selector">
              <label>Ordering Strategy</label>
              <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)} className="strategy-select" disabled={loading}>
                {strategies.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <p className="strategy-description">{strategies.find((s) => s.id === selectedStrategy)?.description || ''}</p>
            </div>
            <button onClick={createSequencer} disabled={loading} className="create-sequencer-btn">
              <Plus size={18} />Create Sequencer
            </button>
          </div>

          <div className="control-section">
            <h3><Plus size={20} />Add Transaction</h3>
            <div className="transaction-form">
              <input type="text" placeholder="Sender address" value={newTransaction.sender} onChange={(e) => setNewTransaction({ ...newTransaction, sender: e.target.value })} className="form-input" disabled={loading} />
              <input type="text" placeholder="Recipient address" value={newTransaction.recipient} onChange={(e) => setNewTransaction({ ...newTransaction, recipient: e.target.value })} className="form-input" disabled={loading} />
              <input type="number" placeholder="Amount" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} step="0.01" className="form-input" disabled={loading} />
              <button onClick={addTransaction} disabled={loading} className="add-transaction-btn">
                <Plus size={18} />Add to Queue
              </button>
            </div>
          </div>

          <div className="control-section">
            <h3><Zap size={20} />Batch Processing</h3>
            <div className="batch-controls">
              <div className="batch-size-control">
                <label>Batch Size</label>
                <input type="number" value={batchSize} onChange={(e) => setBatchSize(Math.max(1, parseInt(e.target.value) || 100))} min="1" max="1000" className="batch-size-input" disabled={loading} />
              </div>
              <button onClick={sequenceBatch} disabled={loading || isSequencing || sequencerData.metrics.current_pending_count === 0} className="sequence-btn">
                {isSequencing ? <><Activity className="spinning" size={18} />Sequencing...</> : <><Play size={18} />Process Batch</>}
              </button>
            </div>
          </div>
        </div>


        <div className="activity-panel">
          <div className="activity-section">
            <h4><Package size={18} />Recent Blocks</h4>
            {createdBlocks.length > 0 ? (
              <div className="blocks-list">
                {createdBlocks.slice(0, 3).map((block, index) => (
                  <div key={index} className="block-card" style={{ '--delay': `${index * 0.1}s` }}>
                    <div className="block-header"><Hash size={14} />Block #{index + 1}</div>
                    <div className="block-info">
                      <div className="block-stat">Hash: {block.hash?.substring(0, 12) || 'N/A'}...</div>
                      <div className="block-stat">TXs: {block.transactions?.length || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state"><Package size={24} /><p>No blocks created yet</p></div>}
          </div>

          <div className="activity-section">
            <h4><Users size={18} />Recent Transactions</h4>
            {recentTransactions.length > 0 ? (
              <div className="transactions-list">
                {recentTransactions.slice(-3).map((tx, index) => (
                  <div key={index} className="transaction-card" style={{ '--delay': `${index * 0.1}s` }}>
                    <div className="tx-participants">
                      <span className="tx-sender">{tx.sender?.substring(0, 8) || 'N/A'}...</span>
                      <ArrowRight size={12} className="tx-arrow" />
                      <span className="tx-recipient">{tx.recipient?.substring(0, 8) || 'N/A'}...</span>
                    </div>
                    <div className="tx-amount">{tx.amount?.toFixed(2) || 0} POLY</div>
                    <div className="tx-status"><CheckCircle size={12} />Confirmed</div>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state"><Users size={24} /><p>No transactions yet</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectacularTransactionSequencer;
