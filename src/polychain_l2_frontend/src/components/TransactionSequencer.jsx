import React, { useState, useEffect } from 'react';
import { RefreshCw, BarChart3, Zap, Settings, Plus, Package, Shield, Play, Clock, TrendingUp, DollarSign, CheckCircle } from 'lucide-react';
import './transaction-sequencer.css';

const TransactionSequencer = ({ actor }) => {
  const [sequencerData, setSequencerData] = useState({
    metrics: {
      total_transactions_sequenced: 0,
      current_pending_count: 0,
      average_batch_size: 0,
      total_batches_created: 0,
      average_sequencing_time_ms: 0,
      fairness_score: 0,
      ordering_strategy: "FairOrdering"
    },
    benefits: {
      mev_protection_score: 0,
      fairness_improvement: 0,
      throughput_improvement: 0,
      gas_savings_percentage: 0,
      front_running_prevention: false,
      deterministic_ordering: false,
      multi_chain_support: false,
      recommended_strategy: "FairOrdering"
    }
  });
  
  const [newTransaction, setNewTransaction] = useState({
    sender: '',
    recipient: '',
    amount: ''
  });
  
  const [batchSize, setBatchSize] = useState(100);
  const [selectedStrategy, setSelectedStrategy] = useState('fair');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Charger les données du séquenceur
  const loadSequencerData = async () => {
    if (!actor) return;
    
    try {
      const [metrics, benefits] = await Promise.all([
        actor.get_sequencer_metrics(),
        actor.analyze_sequencing_benefits()
      ]);
      
      setSequencerData({
        metrics,
        benefits
      });
    } catch (error) {
      console.error('Error loading sequencer data:', error);
    }
  };

  // Créer un séquenceur
  const createSequencer = async () => {
    if (!actor) return;
    
    setLoading(true);
    try {
      const response = await actor.create_transaction_sequencer(selectedStrategy);
      if (response.Ok) {
        setMessage(`✅ ${response.Ok}`);
      } else if (response.Err) {
        setMessage(`❌ Error: ${response.Err}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message || error}`);
    }
    setLoading(false);
  };

  // Ajouter une transaction au séquenceur
  const addTransaction = async () => {
    if (!actor || !newTransaction.sender || !newTransaction.recipient || !newTransaction.amount) {
      setMessage('❌ Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    try {
      const response = await actor.add_transaction_to_sequencer(
        newTransaction.sender,
        newTransaction.recipient,
        parseFloat(newTransaction.amount)
      );
      if (response.Ok) {
        setMessage(`✅ ${response.Ok}`);
        
        // Reset form
        setNewTransaction({ sender: '', recipient: '', amount: '' });
        
        // Recharger les métriques
        await loadSequencerData();
      } else if (response.Err) {
        setMessage(`❌ Error: ${response.Err}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message || error}`);
    }
    setLoading(false);
  };

  // Séquencer un batch
  const sequenceBatch = async () => {
    if (!actor) return;
    
    setLoading(true);
    try {
      const response = await actor.sequence_transaction_batch([batchSize]);
      if (response.Ok) {
        const result = response.Ok;
        setMessage(`✅ Batch créé: ${result.batch_id} (${result.transaction_count} transactions, ${result.sequencing_time_ms}ms)`);
        
        // Recharger les métriques
        await loadSequencerData();
      } else if (response.Err) {
        setMessage(`❌ Error: ${response.Err}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message || error}`);
    }
    setLoading(false);
  };

  // Test du consensus PoS
  const testPosConsensus = async () => {
    if (!actor) return;
    
    setLoading(true);
    try {
      const response = await actor.test_pos_consensus();
      if (response.Ok) {
        setMessage(`✅ PoS Consensus: ${response.Ok}`);
      } else if (response.Err) {
        setMessage(`❌ Consensus Error: ${response.Err}`);
      }
    } catch (error) {
      setMessage(`❌ Consensus Error: ${error.message || error}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSequencerData();
  }, [actor]);

  return (
    <div className="transaction-sequencer">
      <div className="sequencer-header">
        <div className="header-content">
          <h2>
            <RefreshCw size={24} />
            PolyChain L2 Transaction Sequencer
          </h2>
          <div className="sequencer-badge">
            <Shield size={16} />
            MEV Protection • Fair Ordering
          </div>
        </div>
        <p>Advanced transaction sequencing with deterministic ordering and maximum fairness</p>
      </div>

      {/* Métriques du séquenceur */}
      <div className="sequencer-metrics">
        <h3>
          <BarChart3 size={20} />
          Sequencer Metrics
        </h3>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">
              <CheckCircle size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-value">{sequencerData.metrics.total_transactions_sequenced.toLocaleString()}</div>
              <div className="metric-label">Transactions Séquencées</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Clock size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-value">{sequencerData.metrics.current_pending_count}</div>
              <div className="metric-label">En Attente</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Package size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-value">{sequencerData.metrics.average_batch_size.toFixed(1)}</div>
              <div className="metric-label">Taille Batch Moyenne</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Shield size={20} />
            </div>
            <div className="metric-content">
              <div className="metric-value">{(sequencerData.metrics.fairness_score * 100).toFixed(1)}%</div>
              <div className="metric-label">Score Fairness</div>
            </div>
          </div>
        </div>
      </div>

      {/* Avantages du séquençage */}
      <div className="sequencer-benefits">
        <h3>
          <Zap size={20} />
          Sequencing Benefits
        </h3>
        <div className="benefits-grid">
          <div className="benefit-item">
            <div className="benefit-icon">
              <Shield size={16} />
            </div>
            <div className="benefit-content">
              <span className="benefit-label">MEV Protection</span>
              <span className="benefit-value">{(sequencerData.benefits.mev_protection_score * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <TrendingUp size={16} />
            </div>
            <div className="benefit-content">
              <span className="benefit-label">Fairness Improvement</span>
              <span className="benefit-value">+{(sequencerData.benefits.fairness_improvement * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <Zap size={16} />
            </div>
            <div className="benefit-content">
              <span className="benefit-label">Throughput Boost</span>
              <span className="benefit-value">{sequencerData.benefits.throughput_improvement.toFixed(1)}x</span>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">
              <DollarSign size={16} />
            </div>
            <div className="benefit-content">
              <span className="benefit-label">Gas Savings</span>
              <span className="benefit-value">{sequencerData.benefits.gas_savings_percentage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration du séquenceur */}
      <div className="sequencer-controls">
        <h3>
          <Settings size={20} />
          Sequencer Configuration
        </h3>
        
        <div className="control-group">
          <label>Stratégie d'Ordering:</label>
          <select 
            value={selectedStrategy} 
            onChange={(e) => setSelectedStrategy(e.target.value)}
            disabled={loading}
          >
            <option value="fcfs">First Come First Served</option>
            <option value="priority">Priority Fee</option>
            <option value="fair">Fair Ordering (Anti-MEV)</option>
            <option value="vrf">VRF Random</option>
          </select>
        </div>

        <div className="action-buttons">
          <button 
            onClick={createSequencer}
            disabled={loading}
            className="create-btn"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            {loading ? 'Création...' : 'Créer Séquenceur'}
          </button>
          
          <button 
            onClick={testPosConsensus}
            disabled={loading}
            className="consensus-btn"
          >
            <Shield size={16} />
            {loading ? 'Test...' : 'Test PoS Consensus'}
          </button>
        </div>
      </div>

      {/* Ajout de transactions */}
      <div className="add-transaction">
        <h3>
          <Plus size={20} />
          Add Transaction to Sequencer
        </h3>
        
        <div className="transaction-form">
          <input
            type="text"
            placeholder="Sender Address"
            value={newTransaction.sender}
            onChange={(e) => setNewTransaction({...newTransaction, sender: e.target.value})}
            disabled={loading}
          />
          <input
            type="text"
            placeholder="Recipient Address"
            value={newTransaction.recipient}
            onChange={(e) => setNewTransaction({...newTransaction, recipient: e.target.value})}
            disabled={loading}
          />
          <input
            type="number"
            placeholder="Amount"
            value={newTransaction.amount}
            onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
            disabled={loading}
            min="0"
            step="0.01"
          />
        </div>

        <button 
          onClick={addTransaction}
          disabled={loading}
          className="add-tx-btn"
        >
          <Plus size={16} />
          {loading ? 'Ajout...' : 'Ajouter Transaction'}
        </button>
      </div>

      {/* Batch Processing */}
      <div className="batch-processing">
        <h3>
          <Package size={20} />
          Batch Processing
        </h3>
        
        <div className="batch-controls">
          <label>Batch Size:</label>
          <input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(parseInt(e.target.value) || 100)}
            disabled={loading}
            min="1"
            max="1000"
          />
          
          <button 
            onClick={sequenceBatch}
            disabled={loading}
            className="batch-btn"
          >
            <Play size={16} />
            {loading ? 'Processing...' : 'Sequence Batch'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className={`message ${message.includes('Error') || message.includes('❌') ? 'error' : 'success'}`}>
          {message.includes('Error') || message.includes('❌') ? 
            <Shield size={16} className="message-icon" /> : 
            <CheckCircle size={16} className="message-icon" />
          }
          <span>{message}</span>
        </div>
      )}

      {/* Refresh Button */}
      <div className="sequencer-footer">
        <button onClick={loadSequencerData} className="refresh-btn">
          <RefreshCw size={16} />
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default TransactionSequencer;