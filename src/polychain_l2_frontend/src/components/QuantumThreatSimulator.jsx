import React, { useState, useEffect, useRef } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { 
  Shield, AlertTriangle, Zap, Brain, Cpu, Activity,
  Lock, Unlock, ChevronRight, BarChart3, TrendingUp
} from 'lucide-react';
import './quantum-threat-simulator.css';

const QuantumThreatSimulator = () => {
  const [threatLevel, setThreatLevel] = useState(25);
  const [isSimulating, setIsSimulating] = useState(false);
  const [algorithms, setAlgorithms] = useState({
    ecdsa: { active: true, performance: 95.5, security: 85, quantumVulnerable: true },
    schnorr: { active: false, performance: 92.8, security: 88, quantumVulnerable: true },
    falcon: { active: false, performance: 78.2, security: 98, quantumVulnerable: false },
    mldsa: { active: false, performance: 85.6, security: 96, quantumVulnerable: false }
  });
  
  const [recommendation, setRecommendation] = useState(null);
  const [transactionSize, setTransactionSize] = useState(100000);
  const [simulationResults, setSimulationResults] = useState([]);
  const [quantumComputers, setQuantumComputers] = useState({
    current: 127, // Qubits actuels
    breakthrough: 2030, // Année de breakthrough estimée
    threat: threatLevel
  });

  const canvasRef = useRef();
  const animationRef = useRef();

  useEffect(() => {
    updateRecommendation();
    if (isSimulating) {
      startQuantumAnimation();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [threatLevel, transactionSize, isSimulating]);

  const startQuantumAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles = [];
    const particleCount = Math.floor(threatLevel * 2);
    
    // Initialize quantum particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: Math.random() * 4 + 2,
        opacity: Math.random() * 0.8 + 0.2,
        color: threatLevel > 60 ? '#ff4444' : threatLevel > 30 ? '#ffaa00' : '#44ff44',
        energy: Math.random() * 100
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw quantum field
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
      );
      gradient.addColorStop(0, `rgba(68, 136, 255, ${threatLevel / 1000})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Animate particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.energy += Math.sin(Date.now() * 0.01) * 2;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
        
        // Add quantum effect
        if (Math.random() < 0.1) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.strokeStyle = particle.color;
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const updateRecommendation = async () => {
    try {
      const rec = await polychain_l2_backend.get_crypto_recommendation(
        transactionSize,
        Math.floor(threatLevel),
        true
      );
      setRecommendation(rec);
      
      // Update algorithm states based on recommendation
      const newAlgorithms = { ...algorithms };
      Object.keys(newAlgorithms).forEach(key => {
        newAlgorithms[key].active = false;
      });
      
      const recommendedAlgo = rec.recommended_algorithm.toLowerCase();
      if (newAlgorithms[recommendedAlgo]) {
        newAlgorithms[recommendedAlgo].active = true;
      }
      
      setAlgorithms(newAlgorithms);
      
    } catch (error) {
      console.error('Error getting recommendation:', error);
    }
  };

  const runBenchmarkSimulation = async () => {
    setIsSimulating(true);
    const results = [];
    const testMessage = `Quantum threat simulation at level ${threatLevel}% - ${Date.now()}`;
    
    for (const algoName of ['ecdsa', 'schnorr', 'falcon', 'mldsa']) {
      try {
        const result = await polychain_l2_backend.crypto_algorithm_benchmark(
          testMessage,
          algoName
        );
        
        if ('Ok' in result) {
          results.push({
            algorithm: algoName,
            total_time_ns: result.Ok.total_time_ns,
            quantum_resistant: result.Ok.quantum_resistant,
            success: result.Ok.success,
            message_length: result.Ok.message_length,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error(`Error benchmarking ${algoName}:`, error);
        // Ajouter un résultat d'échec si le benchmark échoue
        results.push({
          algorithm: algoName,
          total_time_ns: 999999999,
          quantum_resistant: ['falcon', 'mldsa'].includes(algoName),
          success: false,
          message_length: testMessage.length,
          timestamp: Date.now()
        });
      }
    }
    
    setSimulationResults(results);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  const getThreatColor = (level) => {
    if (level >= 80) return '#ff4444';
    if (level >= 60) return '#ff8800';
    if (level >= 30) return '#ffaa00';
    return '#44ff88';
  };

  const getThreatIcon = (level) => {
    if (level >= 80) return AlertTriangle;
    if (level >= 60) return Shield;
    return Lock;
  };

  const AlgorithmCard = ({ name, algo, isRecommended }) => {
    const Icon = algo.quantumVulnerable ? Unlock : Lock;
    const vulnerabilityColor = algo.quantumVulnerable ? '#ff4444' : '#44ff88';
    
    return (
      <div className={`algorithm-card ${algo.active ? 'active' : ''} ${isRecommended ? 'recommended' : ''}`}>
        <div className="algo-header">
          <div className="algo-name">
            <Icon size={20} style={{ color: vulnerabilityColor }} />
            {name.toUpperCase()}
          </div>
          {isRecommended && (
            <div className="recommended-badge">
              <Zap size={14} />
              RECOMMENDED
            </div>
          )}
        </div>
        
        <div className="algo-metrics">
          <div className="metric">
            <span>Performance</span>
            <div className="progress-bar">
              <div 
                className="progress-fill performance" 
                style={{ width: `${algo.performance}%` }}
              ></div>
            </div>
            <span>{algo.performance}%</span>
          </div>
          
          <div className="metric">
            <span>Security</span>
            <div className="progress-bar">
              <div 
                className="progress-fill security" 
                style={{ width: `${algo.security}%` }}
              ></div>
            </div>
            <span>{algo.security}%</span>
          </div>
        </div>
        
        <div className="quantum-status">
          <span className={`status ${algo.quantumVulnerable ? 'vulnerable' : 'resistant'}`}>
            {algo.quantumVulnerable ? 'Quantum Vulnerable' : 'Quantum Resistant'}
          </span>
        </div>
      </div>
    );
  };

  const ThreatIcon = getThreatIcon(threatLevel);

  return (
    <div className="quantum-threat-simulator">
      <canvas ref={canvasRef} className="quantum-canvas" />
      
      <div className="simulator-header">
        <h2>
          <Brain className="quantum-brain" />
          Quantum Threat Simulator
        </h2>
        <div className="threat-indicator" style={{ '--threat-color': getThreatColor(threatLevel) }}>
          <ThreatIcon size={24} />
          <span>Threat Level: {threatLevel}%</span>
        </div>
      </div>

      <div className="simulation-controls">
        <div className="control-group">
          <label>Quantum Threat Level</label>
          <div className="threat-slider-container">
            <input
              type="range"
              min="0"
              max="100"
              value={threatLevel}
              onChange={(e) => setThreatLevel(parseInt(e.target.value))}
              className="threat-slider"
              style={{ '--threat-color': getThreatColor(threatLevel) }}
            />
            <div className="threat-markers">
              <span className="marker safe">Safe</span>
              <span className="marker warning">Warning</span>
              <span className="marker danger">Critical</span>
            </div>
          </div>
        </div>

        <div className="control-group">
          <label>Transaction Size (satoshi)</label>
          <input
            type="number"
            value={transactionSize}
            onChange={(e) => setTransactionSize(parseInt(e.target.value))}
            className="size-input"
            min="1000"
            max="10000000"
            step="1000"
          />
        </div>

        <button 
          onClick={runBenchmarkSimulation}
          disabled={isSimulating}
          className="simulate-btn"
        >
          {isSimulating ? (
            <>
              <Activity className="spin" />
              Simulating...
            </>
          ) : (
            <>
              <Cpu />
              Run Quantum Simulation
            </>
          )}
        </button>
      </div>

      <div className="quantum-info">
        <div className="info-card">
          <h3>Current Quantum State</h3>
          <div className="quantum-stats">
            <div className="stat">
              <span>Current Qubits</span>
              <span className="value">{quantumComputers.current}</span>
            </div>
            <div className="stat">
              <span>Breakthrough Year</span>
              <span className="value">{quantumComputers.breakthrough}</span>
            </div>
            <div className="stat">
              <span>Risk Assessment</span>
              <span className={`value ${threatLevel > 60 ? 'high' : threatLevel > 30 ? 'medium' : 'low'}`}>
                {threatLevel > 60 ? 'HIGH' : threatLevel > 30 ? 'MEDIUM' : 'LOW'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="algorithms-grid">
        {Object.entries(algorithms).map(([name, algo]) => (
          <AlgorithmCard
            key={name}
            name={name}
            algo={algo}
            isRecommended={recommendation && recommendation.recommended_algorithm.toLowerCase() === name}
          />
        ))}
      </div>

      {recommendation && (
        <div className="recommendation-panel">
          <h3>
            <TrendingUp />
            AI Recommendation
          </h3>
          <div className="recommendation-content">
            <div className="recommended-algo">
              <strong>{recommendation.recommended_algorithm}</strong>
              <span className="efficiency">Efficiency: {recommendation.efficiency_score}%</span>
            </div>
            <p className="reason">{recommendation.reason}</p>
            <div className="alternatives">
              <span>Alternatives:</span>
              {recommendation.alternative_algorithms.map((alt, index) => (
                <span key={index} className="alt-algo">{alt}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {simulationResults.length > 0 && (
        <div className="benchmark-results">
          <h3>
            <BarChart3 />
            Benchmark Results
          </h3>
          <div className="results-grid">
            {simulationResults.map((result, index) => (
              <div key={index} className="result-card">
                <div className="result-header">
                  <span className="algo-name">{result.algorithm.toUpperCase()}</span>
                  <span className={`quantum-badge ${result.quantum_resistant ? 'resistant' : 'vulnerable'}`}>
                    {result.quantum_resistant ? 'Q-Safe' : 'Q-Vulnerable'}
                  </span>
                </div>
                <div className="result-time">
                  {(result.total_time_ns / 1_000_000).toFixed(2)}ms
                </div>
                <div className="result-status">
                  {result.success ? '✅ Success' : '❌ Failed'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumThreatSimulator;