import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Shield, Settings, Zap } from 'lucide-react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import './CryptoAI.css';

function CryptoAI() {
  const [recommendation, setRecommendation] = useState(null);
  const [amount, setAmount] = useState(100000);
  const [threatLevel, setThreatLevel] = useState(50);
  const [performancePriority, setPerformancePriority] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadRecommendation = useCallback(async () => {
    setLoading(true);
    try {
      const data = await polychain_l2_backend.get_crypto_recommendation(
        amount, [threatLevel], [performancePriority]
      );
      setRecommendation(data);
    } catch (error) {
      console.error('Failed to load recommendation:', error);
    } finally {
      setLoading(false);
    }
  }, [amount, threatLevel, performancePriority]);

  useEffect(() => {
    loadRecommendation();
  }, [loadRecommendation]);

  return (
    <div className="card">
      <div className="card-header">
        <h2>AI Recommendations</h2>
        <p>Configurez les paramètres pour obtenir une recommandation d'algorithme.</p>
      </div>
      <div className="card-body">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        <div className="ai-grid">
          {/* Panneau de Contrôle */}
          <div className="card">
            <div className="card-header">
              <h4><Settings size={18} /> Paramètres</h4>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Montant (satoshi)</label>
                <input
                  className="form-input"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Niveau de Menace Quantique: {threatLevel}%</label>
                <input
                  className="form-input"
                  type="range"
                  min="0"
                  max="100"
                  value={threatLevel}
                  onChange={(e) => setThreatLevel(parseInt(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={performancePriority}
                    onChange={(e) => setPerformancePriority(e.target.checked)}
                  />
                  Prioriser la Performance
                </label>
              </div>
              <button onClick={loadRecommendation} disabled={loading} className="button button-primary">
                <Zap size={16} /> {loading ? 'Analyse en cours...' : 'Rafraîchir la Recommandation'}
              </button>
            </div>
          </div>

          {/* Panneau de Résultats */}
          <div className="card">
            <div className="card-header">
              <h4><Brain size={18} /> Recommandation de l'IA</h4>
            </div>
            <div className="card-body">
              {recommendation ? (
                <div className="recommendation-display" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                  <div>
                    <p className="label">Algorithme Recommandé</p>
                    <p className="value">{recommendation.recommended_algorithm}</p>
                  </div>
                  <div>
                    <p className="label">Niveau de Sécurité</p>
                    <p>{recommendation.security_rating}</p>
                  </div>
                  <div>
                    <p className="label">Raison de la recommandation</p>
                    <p className="reason">{recommendation.reason}</p>
                  </div>
                </div>
              ) : (
                <p>Les résultats s'afficheront ici.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CryptoAI;
