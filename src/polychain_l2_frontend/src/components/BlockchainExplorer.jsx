// BlockchainExplorer.jsx - Nouveau design professionnel et fonctionnel

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Hash, Clock, Users, ArrowRight, CornerUpLeft } from 'lucide-react';
import { safeNumber } from '../utils/bigint-utils';
import './blockchain-explorer.css'; 

// --- Petits composants pour la clarté ---

// Carte pour une statistique unique
const StatCard = ({ icon, label, value }) => (
  <div className="stat-item">
    <div className="label">{icon}{label}</div>
    <div className="value">{value}</div>
  </div>
);

// Élément cliquable dans la liste des blocs
const BlockListItem = ({ block, isSelected, onClick }) => {
  const formatHash = (hash) => hash ? `${hash.substring(0, 10)}...${hash.substring(hash.length - 10)}` : 'N/A';
  
  return (
    <div className={`block-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="block-item-header">
        <span className="block-height"><Hash size={16} /> Block #{block.height}</span>
        <span className="block-tx-count">{block.transactions.length} TXs</span>
      </div>
      <div className="block-hash">{formatHash(block.hash)}</div>
    </div>
  );
};

// Panneau affichant les détails d'un bloc sélectionné
const BlockDetailsPanel = ({ block, formatTime }) => {
  if (!block) {
    return (
      <div className="details-panel details-placeholder">
        <CornerUpLeft size={48} />
        <h3>Sélectionnez un bloc</h3>
        <p>Les détails du bloc sélectionné s'afficheront ici.</p>
      </div>
    );
  }
  
  return (
    <div className="details-panel">
      <div className="details-header">
        <h3>Détails du Bloc #{block.height}</h3>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
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
            <div key={i} className="transaction-item">
                <div className="detail-item"><span className="label">De</span><span className="value">{tx.sender}</span></div>
                <div style={{textAlign: 'center', margin: '8px'}}><ArrowRight size={16} color="var(--text-secondary)"/></div>
                <div className="detail-item"><span className="label">À</span><span className="value">{tx.recipient}</span></div>
                <div className="detail-item" style={{marginTop: '16px'}}><span className="label">Montant</span><span className="value">{safeNumber(tx.amount)} COIN</span></div>
            </div>
          )) : <p style={{color: 'var(--text-secondary)', fontSize: '14px'}}>Aucune transaction dans ce bloc.</p>}
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

  const loadBlockchainData = async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [recentBlocks, blockchainStats] = await Promise.all([
        actor.get_recent_blocks(20),
        actor.get_blockchain_stats(),
      ]);

      const sortedBlocks = recentBlocks.map((b, i) => ({...b, height: safeNumber(blockchainStats.chain_height) - i})).reverse();
      
      setBlocks(sortedBlocks);
      setStats({
        height: safeNumber(blockchainStats.chain_height),
        total_txs: safeNumber(blockchainStats.total_transactions),
        total_blocks: safeNumber(blockchainStats.total_blocks),
        avg_tx_per_block: safeNumber(blockchainStats.average_tx_per_block).toFixed(1),
      });

      // Si un bloc était sélectionné, on met à jour ses données
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

  const formatTime = (timestamp) => { /* ... Logique inchangée ... */ };

  useEffect(() => {
    loadBlockchainData();
    const interval = setInterval(loadBlockchainData, 15000); // Rafraichissement toutes les 15s
    return () => clearInterval(interval);
  }, [actor]);

  return (
    <div className="explorer-layout">
      {/* Colonne de Gauche */}
      <div className="blocks-list-panel">
        {stats && (
          <div className="stats-grid">
            <StatCard icon={<Hash size={16} />} label="Hauteur" value={stats.height.toLocaleString()} />
            <StatCard icon={<Users size={16} />} label="Transactions" value={stats.total_txs.toLocaleString()} />
          </div>
        )}
        <div className="blocks-list-container">
           <h3 style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               Blocs Récents
               <button onClick={loadBlockchainData} disabled={loading} className='button button-secondary' style={{padding: '8px 12px', fontSize: '12px'}}>
                   <RefreshCw size={14} className={loading ? 'ds-animate-spin' : ''} />
                   Rafraîchir
               </button>
           </h3>
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

      {/* Colonne de Droite */}
      <BlockDetailsPanel block={selectedBlock} formatTime={formatTime} />
    </div>
  );
};

export default BlockchainExplorer;
