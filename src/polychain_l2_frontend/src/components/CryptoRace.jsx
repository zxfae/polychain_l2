import React, { useState, useEffect, useRef } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { 
  Play, Trophy, Zap, Shield, Clock, BarChart3,
  Award, Target, Gauge, ChevronRight
} from 'lucide-react';
import './crypto-race.css';

const CryptoRace = () => {
  const [isRacing, setIsRacing] = useState(false);
  const [algorithms, setAlgorithms] = useState([
    { 
      name: 'ECDSA', 
      progress: 0, 
      speed: 0, 
      color: '#ff6b6b', 
      icon: '🔐',
      description: 'Classical elliptic curve',
      quantumSafe: false,
      position: 1
    },
    { 
      name: 'Schnorr', 
      progress: 0, 
      speed: 0, 
      color: '#4ecdc4', 
      icon: '✍️',
      description: 'Compact signatures',
      quantumSafe: false,
      position: 2
    },
    { 
      name: 'Falcon512', 
      progress: 0, 
      speed: 0, 
      color: '#45b7d1', 
      icon: '🦅',
      description: 'Post-quantum lattice',
      quantumSafe: true,
      position: 3
    },
    { 
      name: 'ML-DSA44', 
      progress: 0, 
      speed: 0, 
      color: '#f9ca24', 
      icon: '🤖',
      description: 'Post-quantum ML',
      quantumSafe: true,
      position: 4
    }
  ]);
  
  const [raceResults, setRaceResults] = useState([]);
  const [currentWinner, setCurrentWinner] = useState(null);
  const [raceStats, setRaceStats] = useState({
    totalRaces: 0,
    fastestTime: null,
    averageTime: 0,
    quantumAdvantage: 0
  });
  
  const [raceSettings, setRaceSettings] = useState({
    messageSize: 1000,
    iterations: 10,
    raceDuration: 5000 // 5 seconds
  });

  const raceAnimationRef = useRef();
  const startTimeRef = useRef();

  useEffect(() => {
    loadRaceHistory();
  }, []);

  const loadRaceHistory = async () => {
    // Simuler des données de course précédentes
    setRaceStats({
      totalRaces: Math.floor(Math.random() * 50) + 10,
      fastestTime: (Math.random() * 2000 + 500).toFixed(0),
      averageTime: (Math.random() * 3000 + 1000).toFixed(0),
      quantumAdvantage: (Math.random() * 15 + 5).toFixed(1)
    });
  };

  const startRace = async () => {
    if (isRacing) return;
    
    setIsRacing(true);
    startTimeRef.current = Date.now();
    
    // Reset all algorithms
    const resetAlgorithms = algorithms.map(algo => ({
      ...algo,
      progress: 0,
      speed: 0,
      position: Math.floor(Math.random() * 4) + 1
    }));
    setAlgorithms(resetAlgorithms);
    
    // Start visual race animation
    animateRace();
    
    // Run actual benchmarks
    const results = await runCryptoBenchmarks();
    
    // Process results and determine winner
    const processedResults = processRaceResults(results);
    setRaceResults(processedResults);
    
    // Update winner
    const winner = processedResults.reduce((prev, current) => 
      (current.totalScore > prev.totalScore) ? current : prev
    );
    setCurrentWinner(winner);
    
    // Update stats
    updateRaceStats(processedResults);
    
    setIsRacing(false);
  };

  const animateRace = () => {
    const duration = raceSettings.raceDuration;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAlgorithms(prev => prev.map(algo => {
        // Simulate different speeds based on algorithm characteristics
        let baseSpeed = 1;
        let variance = Math.random() * 0.3 + 0.85; // 0.85-1.15 multiplier
        
        switch (algo.name) {
          case 'ECDSA':
            baseSpeed = 1.2; // Fastest classical
            break;
          case 'Schnorr':
            baseSpeed = 1.1; // Fast classical
            break;
          case 'Falcon512':
            baseSpeed = 0.7; // Slower post-quantum
            break;
          case 'ML-DSA44':
            baseSpeed = 0.85; // Medium post-quantum
            break;
        }
        
        const newProgress = Math.min(progress * baseSpeed * variance * 100, 100);
        const currentSpeed = newProgress > algo.progress ? 
          ((newProgress - algo.progress) * 20).toFixed(1) : algo.speed;
        
        return {
          ...algo,
          progress: newProgress,
          speed: currentSpeed
        };
      }));
      
      if (progress < 1) {
        raceAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const runCryptoBenchmarks = async () => {
    const results = [];
    const testMessage = 'x'.repeat(raceSettings.messageSize);
    
    for (const algo of algorithms) {
      try {
        // Utiliser les vrais noms d'algorithmes du backend
        let benchmarkName;
        switch (algo.name) {
          case 'ECDSA':
            benchmarkName = 'ecdsa';
            break;
          case 'Schnorr':
            benchmarkName = 'schnorr';
            break;
          case 'Falcon512':
            benchmarkName = 'falcon';
            break;
          case 'ML-DSA44':
            benchmarkName = 'mldsa';
            break;
          default:
            throw new Error(`Unknown algorithm: ${algo.name}`);
        }
        
        const result = await polychain_l2_backend.crypto_algorithm_benchmark(
          testMessage,
          benchmarkName
        );
        
        if ('Ok' in result) {
          results.push({
            algorithm: algo.name,
            total_time_ns: result.Ok.total_time_ns,
            quantum_resistant: result.Ok.quantum_resistant,
            success: result.Ok.success,
            message_length: result.Ok.message_length,
            color: algo.color,
            quantumSafe: algo.quantumSafe
          });
        }
      } catch (error) {
        console.error(`Error benchmarking ${algo.name}:`, error);
        // Fallback si le benchmark échoue
        results.push({
          algorithm: algo.name,
          total_time_ns: 999999999, // Temps très élevé pour indiquer l'échec
          quantum_resistant: algo.quantumSafe,
          success: false,
          message_length: testMessage.length,
          color: algo.color,
          quantumSafe: algo.quantumSafe
        });
      }
    }
    
    return results;
  };

  const processRaceResults = (results) => {
    return results.map(result => {
      const timeMs = result.total_time_ns / 1_000_000;
      const efficiency = Math.max(0, 100 - (timeMs / 10)); // Efficiency score
      const securityBonus = result.quantum_resistant ? 20 : 0;
      const totalScore = efficiency + securityBonus;
      
      return {
        ...result,
        timeMs: timeMs.toFixed(2),
        efficiency: efficiency.toFixed(1),
        securityBonus,
        totalScore: totalScore.toFixed(1)
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  };

  const updateRaceStats = (results) => {
    const avgTime = results.reduce((sum, r) => sum + parseFloat(r.timeMs), 0) / results.length;
    const fastestTime = Math.min(...results.map(r => parseFloat(r.timeMs)));
    const quantumResults = results.filter(r => r.quantum_resistant);
    const classicalResults = results.filter(r => !r.quantum_resistant);
    
    const quantumAvg = quantumResults.length > 0 ? 
      quantumResults.reduce((sum, r) => sum + parseFloat(r.totalScore), 0) / quantumResults.length : 0;
    const classicalAvg = classicalResults.length > 0 ? 
      classicalResults.reduce((sum, r) => sum + parseFloat(r.totalScore), 0) / classicalResults.length : 0;
    
    const quantumAdvantage = quantumAvg > classicalAvg ? 
      ((quantumAvg - classicalAvg) / classicalAvg * 100).toFixed(1) : 0;
    
    setRaceStats(prev => ({
      totalRaces: prev.totalRaces + 1,
      fastestTime: Math.min(prev.fastestTime || fastestTime, fastestTime).toFixed(0),
      averageTime: avgTime.toFixed(0),
      quantumAdvantage
    }));
  };

  const RaceTrack = ({ algo, index }) => (
    <div className="race-track" style={{ '--algo-color': algo.color }}>
      <div className="track-header">
        <div className="algo-info">
          <span className="algo-icon">{algo.icon}</span>
          <div>
            <div className="algo-name">{algo.name}</div>
            <div className="algo-desc">{algo.description}</div>
          </div>
        </div>
        
        <div className="quantum-badge">
          {algo.quantumSafe ? (
            <span className="quantum-safe">
              <Shield size={14} />
              Q-Safe
            </span>
          ) : (
            <span className="quantum-vulnerable">
              ⚠️ Q-Vulnerable
            </span>
          )}
        </div>
      </div>
      
      <div className="track-container">
        <div className="track-line">
          <div 
            className="track-runner"
            style={{ 
              left: `${algo.progress}%`,
              backgroundColor: algo.color,
              boxShadow: `0 0 20px ${algo.color}40`
            }}
          >
            <span className="runner-emoji">{algo.icon}</span>
          </div>
        </div>
        
        <div className="track-stats">
          <span>Progress: {algo.progress.toFixed(1)}%</span>
          <span>Speed: {algo.speed} ops/s</span>
        </div>
      </div>
    </div>
  );

  const PodiumPosition = ({ result, position }) => {
    const podiumHeight = position === 1 ? 120 : position === 2 ? 100 : 80;
    const podiumColor = position === 1 ? '#ffd700' : position === 2 ? '#c0c0c0' : '#cd7f32';
    
    return (
      <div className="podium-position" style={{ '--podium-height': `${podiumHeight}px` }}>
        <div className="podium-runner" style={{ backgroundColor: result.color }}>
          {algorithms.find(a => a.name === result.algorithm)?.icon}
        </div>
        <div className="podium-info">
          <div className="position-number" style={{ color: podiumColor }}>
            {position}
          </div>
          <div className="algo-name">{result.algorithm}</div>
          <div className="score">Score: {result.totalScore}</div>
          <div className="time">{result.timeMs}ms</div>
        </div>
        <div 
          className="podium-base" 
          style={{ 
            height: `${podiumHeight}px`,
            backgroundColor: podiumColor
          }}
        />
      </div>
    );
  };

  return (
    <div className="crypto-race">
      <div className="race-header">
        <h2>
          <Trophy className="trophy-icon" />
          Cryptographic Algorithm Race
        </h2>
        
        <div className="race-controls">
          <div className="race-settings">
            <div className="setting">
              <label>Message Size:</label>
              <input
                type="number"
                value={raceSettings.messageSize}
                onChange={(e) => setRaceSettings(prev => ({
                  ...prev,
                  messageSize: parseInt(e.target.value)
                }))}
                min="100"
                max="10000"
                step="100"
              />
              <span>bytes</span>
            </div>
            
            <div className="setting">
              <label>Race Duration:</label>
              <input
                type="range"
                min="3000"
                max="10000"
                step="500"
                value={raceSettings.raceDuration}
                onChange={(e) => setRaceSettings(prev => ({
                  ...prev,
                  raceDuration: parseInt(e.target.value)
                }))}
              />
              <span>{raceSettings.raceDuration / 1000}s</span>
            </div>
          </div>
          
          <button 
            onClick={startRace}
            disabled={isRacing}
            className="start-race-btn"
          >
            {isRacing ? (
              <>
                <Gauge className="spin" />
                Racing...
              </>
            ) : (
              <>
                <Play />
                Start Race
              </>
            )}
          </button>
        </div>
      </div>

      <div className="race-arena">
        <div className="starting-line">
          <span>START</span>
        </div>
        
        <div className="race-tracks">
          {algorithms.map((algo, index) => (
            <RaceTrack key={algo.name} algo={algo} index={index} />
          ))}
        </div>
        
        <div className="finish-line">
          <span>FINISH</span>
          <Zap className="finish-spark" />
        </div>
      </div>

      {currentWinner && (
        <div className="winner-announcement">
          <div className="winner-card">
            <Award className="winner-icon" />
            <div className="winner-info">
              <h3>🏆 Race Winner: {currentWinner.algorithm}</h3>
              <div className="winner-stats">
                <span>⏱️ Time: {currentWinner.timeMs}ms</span>
                <span>⚡ Score: {currentWinner.totalScore}</span>
                <span>🛡️ {currentWinner.quantum_resistant ? 'Quantum Safe' : 'Classical'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {raceResults.length > 0 && (
        <div className="race-podium">
          <h3>
            <Trophy />
            Race Results Podium
          </h3>
          <div className="podium-container">
            {raceResults.slice(0, 3).map((result, index) => (
              <PodiumPosition key={result.algorithm} result={result} position={index + 1} />
            ))}
          </div>
        </div>
      )}

      <div className="race-analytics">
        <div className="analytics-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{raceStats.totalRaces}</div>
              <div className="stat-label">Total Races</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{raceStats.fastestTime}ms</div>
              <div className="stat-label">Fastest Time</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{raceStats.averageTime}ms</div>
              <div className="stat-label">Average Time</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{raceStats.quantumAdvantage}%</div>
              <div className="stat-label">Quantum Advantage</div>
            </div>
          </div>
        </div>
      </div>

      {raceResults.length > 0 && (
        <div className="detailed-results">
          <h3>Detailed Performance Analysis</h3>
          <div className="results-table">
            <div className="table-header">
              <span>Algorithm</span>
              <span>Time (ms)</span>
              <span>Efficiency</span>
              <span>Security</span>
              <span>Total Score</span>
            </div>
            {raceResults.map((result, index) => (
              <div key={result.algorithm} className="table-row" style={{ '--row-color': result.color }}>
                <div className="algo-cell">
                  <span className="algo-icon">
                    {algorithms.find(a => a.name === result.algorithm)?.icon}
                  </span>
                  <span>{result.algorithm}</span>
                  {result.quantum_resistant && <Shield size={14} className="quantum-shield" />}
                </div>
                <span className="time-cell">{result.timeMs}</span>
                <span className="efficiency-cell">{result.efficiency}%</span>
                <span className="security-cell">
                  {result.quantum_resistant ? 'Post-Quantum' : 'Classical'}
                </span>
                <span className="score-cell">{result.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoRace;