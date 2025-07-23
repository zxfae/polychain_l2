import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle, Clock, Package, Shield, Settings, Plus, Play, AlertTriangle } from 'lucide-react';
import './transaction-sequencer.css';

// --- Sous-composants ---
const MetricCard = ({ icon, value, label }) => (
  <div className="metric-card" role="region" aria-label={label}>
    <div className="metric-icon">{icon}</div>
    <div className="metric-content">
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  </div>
);

const TransactionSequencer = ({ actor }) => {
  // --- États ---
  const [sequencerData, setSequencerData] = useState({
    metrics: { total_transactions_sequenced: 0, current_pending_count: 0, average_batch_size: 0, fairness_score: 0 },
  });
  const [newTransaction, setNewTransaction] = useState({ sender: '', recipient: '', amount: '' });
  const [batchSize, setBatchSize] = useState(100);
  const [selectedStrategy, setSelectedStrategy] = useState('fair');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // --- Fonctions ---
  const displayMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const loadSequencerData = useCallback(async () => {
    if (!actor) return;
    try {
      const metrics = await actor.get_sequencer_metrics();
      setSequencerData({ metrics });
    } catch (error) {
      console.error('Error loading sequencer data:', error);
      displayMessage('Failed to load sequencer data.', 'error');
    }
  }, [actor]);

  const handleAction = async (action, successMessage, errorMessage) => {
    if (!actor) return;
    setLoading(true);
    try {
      const response = await action();
      if (response && typeof response.Ok !== 'undefined') {
        displayMessage(successMessage(response.Ok), 'success');
        await loadSequencerData();
      } else if (response && typeof response.Err !== 'undefined') {
        displayMessage(`${errorMessage}: ${response.Err}`, 'error');
      } else {
        displayMessage(successMessage(response), 'success');
        await loadSequencerData();
      }
    } catch (error) {
      displayMessage(`${errorMessage}: ${error.message || 'An unknown error occurred.'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const createSequencer = () => handleAction(
    () => actor.create_transaction_sequencer(selectedStrategy),
    (res) => `Sequencer created successfully: ${res}`,
    'Error creating sequencer'
  );

  const addTransaction = () => {
    if (!newTransaction.sender || !newTransaction.recipient || !newTransaction.amount) {
      displayMessage('Please fill all transaction fields.', 'error');
      return;
    }
    handleAction(
      () => actor.add_transaction_to_sequencer(newTransaction.sender, newTransaction.recipient, parseFloat(newTransaction.amount)),
      (res) => {
        setNewTransaction({ sender: '', recipient: '', amount: '' });
        return `Transaction added: ${res}`;
      },
      'Error adding transaction'
    );
  };

  const sequenceBatch = () => handleAction(
    () => actor.sequence_transaction_batch([batchSize]),
    (res) => `Batch created: ${res.batch_id} (${res.transaction_count} txs, ${res.sequencing_time_ms}ms)`,
    'Error sequencing batch'
  );

  useEffect(() => {
    loadSequencerData();
  }, [loadSequencerData]);

  // --- Rendu JSX ---
  return (
    <div className="transaction-sequencer" role="main" aria-label="Transaction Sequencer">
      <div className="sequencer-header">
        <h1><RefreshCw size={24} aria-hidden="true" /> PolyChain L2 Sequencer</h1>
        <p>Streamlined transaction sequencing with fair ordering.</p>
      </div>

      <div className="sequencer-metrics">
        <div className="metrics-grid">
          <MetricCard
            icon={<CheckCircle size={20} aria-hidden="true" />}
            value={sequencerData.metrics.total_transactions_sequenced.toLocaleString()}
            label="Transactions Sequenced"
          />
          <MetricCard
            icon={<Clock size={20} aria-hidden="true" />}
            value={sequencerData.metrics.current_pending_count.toLocaleString()}
            label="Pending Transactions"
          />
          <MetricCard
            icon={<Package size={20} aria-hidden="true" />}
            value={sequencerData.metrics.average_batch_size.toFixed(1)}
            label="Average Batch Size"
          />
          <MetricCard
            icon={<Shield size={20} aria-hidden="true" />}
            value={`${(sequencerData.metrics.fairness_score * 100).toFixed(1)}%`}
            label="Fairness Score"
          />
        </div>
      </div>

      <div className="sequencer-main">
        <div className="sequencer-actions">
          <div className="sequencer-controls">
            <h2><Settings size={20} aria-hidden="true" /> Configuration</h2>
            <div className="control-group">
              <label htmlFor="strategy-select">Ordering Strategy</label>
              <select
                id="strategy-select"
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                disabled={loading}
                aria-describedby="strategy-help"
              >
                <option value="fair">Fair Ordering</option>
                <option value="fcfs">First Come First Served</option>
                <option value="priority">Priority Fee</option>
                <option value="vrf">VRF Random</option>
              </select>
              <p id="strategy-help" className="sr-only">Select the ordering strategy for transaction sequencing.</p>
            </div>
            <div className="action-buttons">
              <button onClick={createSequencer} disabled={loading} className="create-btn" aria-busy={loading}>
                <RefreshCw size={16} className={loading ? 'spinning' : ''} aria-hidden="true" />
                {loading ? 'Creating...' : 'Create Sequencer'}
              </button>
            </div>
          </div>

          <div className="add-transaction">
            <h2><Plus size={20} aria-hidden="true" /> Add Transaction</h2>
            <div className="transaction-form">
              <div className="control-group">
                <label htmlFor="sender">Sender Address</label>
                <input
                  id="sender"
                  type="text"
                  placeholder="Sender Address"
                  value={newTransaction.sender}
                  onChange={(e) => setNewTransaction({ ...newTransaction, sender: e.target.value })}
                  disabled={loading}
                  aria-required="true"
                />
              </div>
              <div className="control-group">
                <label htmlFor="recipient">Recipient Address</label>
                <input
                  id="recipient"
                  type="text"
                  placeholder="Recipient Address"
                  value={newTransaction.recipient}
                  onChange={(e) => setNewTransaction({ ...newTransaction, recipient: e.target.value })}
                  disabled={loading}
                  aria-required="true"
                />
              </div>
              <div className="control-group">
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  disabled={loading}
                  min="0"
                  step="0.01"
                  aria-required="true"
                />
              </div>
            </div>
            <button onClick={addTransaction} disabled={loading} className="add-tx-btn" aria-busy={loading}>
              <Plus size={16} aria-hidden="true" />
              {loading ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </div>

        <div className="batch-processing">
          <h2><Package size={20} aria-hidden="true" /> Batch Processing</h2>
          <div className="batch-controls">
            <div className="control-group">
              <label htmlFor="batch-size">Batch Size</label>
              <input
                id="batch-size"
                type="number"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value) || 100)}
                disabled={loading}
                min="1"
                max="1000"
                aria-describedby="batch-size-help"
              />
              <p id="batch-size-help" className="sr-only">Enter the number of transactions to process in a batch.</p>
            </div>
            <button onClick={sequenceBatch} disabled={loading} className="batch-btn" aria-busy={loading}>
              <Play size={16} aria-hidden="true" />
              {loading ? 'Processing...' : 'Sequence Batch'}
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`} role="alert">
          <div className="message-icon">
            {message.type === 'error' ? <AlertTriangle size={20} aria-hidden="true" /> : <CheckCircle size={20} aria-hidden="true" />}
          </div>
          <span>{message.text}</span>
        </div>
      )}

      <div className="sequencer-footer">
        <button onClick={loadSequencerData} disabled={loading} className="refresh-btn" aria-busy={loading}>
          <RefreshCw size={16} className={loading ? 'spinning' : ''} aria-hidden="true" />
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default TransactionSequencer;
