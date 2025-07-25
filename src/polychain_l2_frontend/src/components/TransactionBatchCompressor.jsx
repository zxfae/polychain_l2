import React, { useState, useEffect, useCallback } from 'react';
import { Package, Plus, Settings, XCircle } from 'lucide-react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import './transaction-batch-compressor.css';

function TransactionBatchCompressor() {
  const [transactions, setTransactions] = useState([]);
  const [newTransaction, setNewTransaction] = useState({ sender: '', recipient: '', amount: '' });
  const [loading, setLoading] = useState(false);
  const [recentBatches, setRecentBatches] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [batchConfig, setBatchConfig] = useState({
    algorithm: 'CryptoOptimized',
    compression_level: 6,
    enable_aggregation: true,
    batch_size_limit: 1000
  });

  const loadData = useCallback(async () => {
    try {
      const [batches, metrics] = await Promise.all([
        polychain_l2_backend.list_compressed_batches(),
        polychain_l2_backend.get_compression_performance_metrics()
      ]);
      setRecentBatches(safeConvertObject(batches));
      setPerformanceMetrics(safeConvertObject(metrics));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addTransaction = () => {
    if (!newTransaction.sender || !newTransaction.recipient || !newTransaction.amount) {
      alert('Please fill all transaction fields');
      return;
    }
    const transaction = {
      id: `tx_${Date.now()}`,
      sender: newTransaction.sender,
      recipient: newTransaction.recipient,
      amount: parseFloat(newTransaction.amount),
      timestamp: Date.now(),
      tx_type: 'transfer'
    };
    setTransactions(prev => [...prev, transaction]);
    setNewTransaction({ sender: '', recipient: '', amount: '' });
  };

  const createCompressedBatch = async () => {
    if (transactions.length === 0) {
      alert('No transactions to compress');
      return;
    }
    setLoading(true);
    try {
      const response = await polychain_l2_backend.create_compressed_batch(transactions, [batchConfig]);
      if ('Ok' in response) {
        setTransactions([]);
        loadData();
      } else {
        alert(`Error: ${response.Err}`);
      }
    } catch (error) {
      console.error('Failed to create batch:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>Transaction Batch Compressor</h2>
        <p>Compressez des lots de transactions pour une efficacité optimale.</p>
      </div>
      <div className="card-body">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div className="compressor-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div className="card">
              <div className="card-header">
                <h4><Settings size={18} /> Configuration</h4>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Algorithme</label>
                  <select
                    className="form-input"
                    value={batchConfig.algorithm}
                    onChange={(e) => setBatchConfig(prev => ({ ...prev, algorithm: e.target.value }))}
                  >
                    <option value="CryptoOptimized">Crypto Optimized</option>
                    <option value="LZ4">LZ4 (Fast)</option>
                    <option value="ZSTD">ZSTD (Balanced)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Niveau de compression</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    max="9"
                    value={batchConfig.compression_level}
                    onChange={(e) => setBatchConfig(prev => ({ ...prev, compression_level: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h4><Plus size={18} /> Ajouter une Transaction</h4>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Expéditeur</label>
                  <input
                    className="form-input"
                    type="text"
                    value={newTransaction.sender}
                    onChange={e => setNewTransaction({ ...newTransaction, sender: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destinataire</label>
                  <input
                    className="form-input"
                    type="text"
                    value={newTransaction.recipient}
                    onChange={e => setNewTransaction({ ...newTransaction, recipient: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Montant</label>
                  <input
                    className="form-input"
                    type="number"
                    value={newTransaction.amount}
                    onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  />
                </div>
                <button onClick={addTransaction} className="button button-secondary">
                  Ajouter
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
              <h4><Package size={18} /> Lot Actuel ({transactions.length} txs)</h4>
            </div>
            <div className="card-body">
              <div className="batch-list">
                {transactions.length > 0 ? (
                  transactions.map((tx, i) => (
                    <div className="batch-item" key={i}>
                      <span>{tx.sender.substring(0, 6)}.. → {tx.recipient.substring(0, 6)}..</span>
                      <span>{tx.amount}</span>
                      <button
                        onClick={() => setTransactions(txs => txs.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }}
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Le lot est vide.</p>
                )}
              </div>
              <button
                onClick={createCompressedBatch}
                disabled={loading || transactions.length === 0}
                className="button button-primary"
              >
                <Package size={16} /> {loading ? 'Compression...' : 'Créer le Lot Compressé'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionBatchCompressor;
