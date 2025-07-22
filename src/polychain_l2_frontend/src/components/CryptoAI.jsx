import React, { useState, useEffect } from 'react';
import { Brain, Shield, TrendingUp, Calculator, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import './CryptoAI.css';

function CryptoAI() {
  const [recommendation, setRecommendation] = useState(null);
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [amount, setAmount] = useState(100000);
  const [threatLevel, setThreatLevel] = useState(50);
  const [performancePriority, setPerformancePriority] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdvancedMetrics();
    loadRecommendation();
  }, []);

  useEffect(() => {
    if (amount > 0) {
      loadRecommendation();
    }
  }, [amount, threatLevel, performancePriority]);

  const loadAdvancedMetrics = async () => {
    try {
      const data = await polychain_l2_backend.get_layer2_advanced_metrics();
      setAdvancedMetrics(data);
    } catch (error) {
      console.error('Failed to load advanced metrics:', error);
    }
  };

  const loadRecommendation = async () => {
    try {
      setLoading(true);
      const data = await polychain_l2_backend.get_crypto_recommendation(
        amount, // Use number directly
        [threatLevel], // Optional value
        [performancePriority] // Optional value
      );
      setRecommendation(data);
    } catch (error) {
      console.error('Failed to load recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThreatIcon = (level) => {
    if (level >= 80) return AlertTriangle;
    if (level >= 50) return Shield;
    return CheckCircle;
  };

  const getThreatColor = (level) => {
    if (level >= 80) return 'var(--danger-red)';
    if (level >= 50) return 'var(--warning-amber)';
    return 'var(--success-green)';
  };

  const getSecurityRatingColor = (rating) => {
    switch (rating) {
      case 'Excellent': return 'var(--success-green)';
      case 'Very Good': return 'var(--warning-amber)';
      case 'Good': return 'var(--accent-blue)';
      default: return 'var(--neutral-300)';
    }
  };

  return (
    <div className="crypto-ai">
      <div className="crypto-ai-header">
        <div className="ai-title">
          <Brain size={24} />
          <h2>Crypto AI Assistant</h2>
        </div>
        <p>Intelligent cryptographic algorithm selection based on real-time threat analysis</p>
      </div>

      <div className="crypto-ai-grid">
        {/* Controls Panel */}
        <div className="control-panel">
          <h3>Transaction Parameters</h3>
          
          <div className="control-group">
            <label>Amount (satoshi)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              min="1"
              max="10000000"
              className="control-input"
            />
          </div>

          <div className="control-group">
            <label>Quantum Threat Level: {threatLevel}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={threatLevel}
              onChange={(e) => setThreatLevel(parseInt(e.target.value))}
              className="control-slider"
            />
            <div className="slider-labels">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <div className="control-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={performancePriority}
                onChange={(e) => setPerformancePriority(e.target.checked)}
              />
              <span>Priority Performance over Security</span>
            </label>
          </div>

          <button 
            className="refresh-button"
            onClick={loadRecommendation}
            disabled={loading}
          >
            <Zap size={16} />
            {loading ? 'Analyzing...' : 'Refresh Recommendation'}
          </button>
        </div>

        {/* Recommendation Panel */}
        <div className="recommendation-panel">
          <h3>AI Recommendation</h3>
          
          {recommendation && (
            <div className="recommendation-card">
              <div className="algorithm-recommendation">
                <div className="algorithm-name">
                  <Shield size={20} />
                  <span>{recommendation.recommended_algorithm}</span>
                </div>
                <div className="security-rating" style={{ color: getSecurityRatingColor(recommendation.security_rating) }}>
                  {recommendation.security_rating}
                </div>
              </div>

              <div className="recommendation-metrics">
                <div className="metric">
                  <TrendingUp size={16} />
                  <span>Efficiency: {recommendation.efficiency_score.toFixed(1)}%</span>
                </div>
                <div className="metric">
                  <Calculator size={16} />
                  <span>Risk Level: {recommendation.risk_level}</span>
                </div>
              </div>

              <div className="recommendation-reason">
                <p>{recommendation.reason}</p>
              </div>

              <div className="alternatives">
                <h4>Alternative Algorithms:</h4>
                <div className="alternative-chips">
                  {recommendation.alternative_algorithms.map((algo, index) => (
                    <span key={index} className="alternative-chip">
                      {algo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Threat Monitor */}
        <div className="threat-monitor">
          <h3>Threat Monitor</h3>
          
          {advancedMetrics && (
            <div className="threat-indicators">
              <div className="threat-gauge">
                <div className="gauge-header">
                  <div className="gauge-title">
                    {React.createElement(getThreatIcon(advancedMetrics.quantum_threat_level), { 
                      size: 20, 
                      style: { color: getThreatColor(advancedMetrics.quantum_threat_level) }
                    })}
                    <span>Quantum Threat</span>
                  </div>
                  <span className="gauge-value">{advancedMetrics.quantum_threat_level}%</span>
                </div>
                <div className="gauge-bar">
                  <div 
                    className="gauge-fill"
                    style={{ 
                      width: `${advancedMetrics.quantum_threat_level}%`,
                      backgroundColor: getThreatColor(advancedMetrics.quantum_threat_level)
                    }}
                  />
                </div>
              </div>

              <div className="security-metrics">
                <div className="security-metric">
                  <span className="metric-label">Security Score</span>
                  <span className="metric-value">{advancedMetrics.security_score.toFixed(0)}/100</span>
                </div>
                <div className="security-metric">
                  <span className="metric-label">Quantum Ready</span>
                  <span className="metric-value">{advancedMetrics.quantum_ready_percentage.toFixed(0)}%</span>
                </div>
                <div className="security-metric">
                  <span className="metric-label">Migration Ready</span>
                  <span className="metric-value">{advancedMetrics.migration_readiness.toFixed(0)}%</span>
                </div>
              </div>

              <div className="adaptive-features">
                <div className="feature">
                  <CheckCircle size={16} style={{ color: 'var(--success-green)' }} />
                  <span>Auto-Selection: {advancedMetrics.auto_selection_enabled ? 'Active' : 'Disabled'}</span>
                </div>
                <div className="feature">
                  <Shield size={16} style={{ color: 'var(--warning-amber)' }} />
                  <span>Threat Detection: {advancedMetrics.threat_detection_active ? 'Active' : 'Disabled'}</span>
                </div>
                <div className="feature">
                  <TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} />
                  <span>Adaptive Security: {advancedMetrics.adaptive_security_enabled ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CryptoAI;