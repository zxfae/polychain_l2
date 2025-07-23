import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Activity, TrendingUp, Hash, Clock, Users, Zap } from 'lucide-react';
import { safeNumber } from '../utils/bigint-utils';
import './blockchain-explorer.css';

const BlockchainExplorer = ({ actor }) => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [stats, setStats] = useState({
    total_blocks: 0,
    total_transactions: 0,
    latest_block_time: 0,
    average_tx_per_block: 0,
    chain_height: 0,
  });
  const [loading, setLoading] = useState(false);

  // Charger les données de la blockchain
  const loadBlockchainData = async () => {
    if (!actor) return;

    setLoading(true);
    try {
      const [recentBlocks, blockchainStats] = await Promise.all([
        actor.get_recent_blocks(10), // Derniers 10 blocs
        actor.get_blockchain_stats(),
      ]);

      // Inverser les blocs pour afficher le plus récent en premier
      const sortedBlocks = recentBlocks.reverse();
      setBlocks(sortedBlocks);
      // Convertir toutes les valeurs en float64
      setStats({
        ...blockchainStats,
        total_blocks: safeNumber(blockchainStats.total_blocks),
        total_transactions: safeNumber(blockchainStats.total_transactions),
        latest_block_time: safeNumber(blockchainStats.latest_block_time),
        average_tx_per_block: safeNumber(blockchainStats.average_tx_per_block),
        chain_height: safeNumber(blockchainStats.chain_height),
      });
    } catch (error) {
      console.error('Error loading blockchain data:', error);
    }
    setLoading(false);
  };

  // Formater le timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      // Convertir nat64 en float64 pour éviter l'erreur
      const ms = parseFloat(timestamp.toString()) / 1000000;
      return new Date(ms).toLocaleString();
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Formater l'adresse pour affichage
  const formatAddress = (address) => {
    if (!address || typeof address !== 'string') return 'N/A';
    return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
  };

  // Formater le hash
  const formatHash = (hash) => {
    if (!hash || typeof hash !== 'string') return 'N/A';
    return `${hash.substring(0, 12)}...${hash.substring(hash.length - 8)}`;
  };

  // Sélectionner un bloc pour voir les détails
  const selectBlock = (block) => {
    setSelectedBlock(selectedBlock?.hash === block.hash ? null : block);
  };

  useEffect(() => {
    loadBlockchainData();
    // Actualiser toutes les 10 secondes
    const interval = setInterval(loadBlockchainData, 10000);
    return () => clearInterval(interval);
  }, [actor]);

  return (
    <div className="blockchain-explorer">
      {/* En-tête avec statistiques */}
      <div className="explorer-header">
        <div className="header-content">
          <h2>
            <Search size={24} />
            PolyChain L2 Blockchain Explorer
          </h2>
          <div className="status-badge">
            <Activity size={16} />
            Real-time Network Monitor
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Hash size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total_blocks.toString()}</div>
              <div className="stat-label">Total Blocks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total_transactions.toString()}</div>
              <div className="stat-label">Total Transactions</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.chain_height.toString()}</div>
              <div className="stat-label">Chain Height</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <Zap size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.average_tx_per_block.toFixed(1)}</div>
              <div className="stat-label">Avg TX/Block</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des blocs */}
      <div className="blocks-section">
        <div className="section-header">
          <h3>
            <Hash size={20} />
            Recent Blocks
          </h3>
          <button onClick={loadBlockchainData} className="refresh-btn" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {blocks.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} />
            <h4>No Blocks Found</h4>
            <p>Create some transactions to see blocks appear in real-time</p>
          </div>
        ) : (
          <div className="blocks-list">
            {blocks.map((block, index) => (
              <div
                key={block.hash}
                className={`block-card ${selectedBlock?.hash === block.hash ? 'selected' : ''}`}
                onClick={() => selectBlock(block)}
              >
                <div className="block-header">
                  <div className="block-info">
                    <div className="block-height">
                      <Hash size={16} />
                      Block #{stats.total_blocks - index}
                    </div>
                    <div className="block-time">
                      <Clock size={14} />
                      {formatTime(block.timestamp)}
                    </div>
                  </div>
                  <div className="block-stats">
                    <div className="tx-count">
                      <Users size={14} />
                      {block.transactions.length} TXs
                    </div>
                  </div>
                </div>

                <div className="block-hashes">
                  <div className="hash-row">
                    <span className="hash-label">Hash:</span>
                    <span className="hash-value">{formatHash(block.hash)}</span>
                  </div>
                  <div className="hash-row">
                    <span className="hash-label">Previous:</span>
                    <span className="hash-value">{formatHash(block.previous_hash)}</span>
                  </div>
                </div>

                {selectedBlock?.hash === block.hash && (
                  <div className="block-details">
                    <div className="detail-section">
                      <h4>
                        <Hash size={18} />
                        Block Details
                      </h4>
                      <div className="detail-grid">
                        <div className="detail-item">
                          <span className="detail-label">Full Hash:</span>
                          <span className="detail-value hash">{block.hash}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Previous Hash:</span>
                          <span className="detail-value hash">{block.previous_hash}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Timestamp:</span>
                          <span className="detail-value">{formatTime(block.timestamp)}</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-label">Nonce:</span>
                          <span className="detail-value">{parseFloat(block.nonce.toString())}</span>
                        </div>
                      </div>
                    </div>

                    {block.transactions.length > 0 && (
                      <div className="transactions-section">
                        <h4>
                          <Users size={18} />
                          Transactions ({block.transactions.length})
                        </h4>
                        <div className="transactions-list">
                          {block.transactions.map((tx, txIndex) => (
                            <div key={txIndex} className="transaction-card">
                              <div className="tx-addresses">
                                <div className="tx-from">
                                  <span className="tx-label">From:</span>
                                  <span className="address">{formatAddress(tx.sender)}</span>
                                </div>
                                <div className="tx-arrow">→</div>
                                <div className="tx-to">
                                  <span className="tx-label">To:</span>
                                  <span className="address">{formatAddress(tx.recipient)}</span>
                                </div>
                              </div>
                              <div className="tx-details">
                                <div className="tx-amount">{parseFloat(tx.amount.toString())} Coins</div>
                                <div className="tx-time">{formatTime(tx.time_stamp)}</div>
                              </div>
                              {tx.hash && tx.hash[0] && (
                                <div className="tx-hash">
                                  <span className="tx-label">TX Hash:</span>
                                  <span className="hash">{formatHash(tx.hash[0])}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status de la blockchain */}
      <div className="blockchain-status">
        <div className="status-indicator">
          <Activity size={16} className="status-icon" />
          <span>Blockchain Active</span>
        </div>
        <div className="last-updated">
          <Clock size={14} />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default BlockchainExplorer;
