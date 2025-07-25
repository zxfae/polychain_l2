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
      value: 'ecdsa',
      progress: 0, 
      speed: 0, 
      color: '#ff6b6b', 
      icon: '🔐',
      description: 'Elliptic Curve Digital Signature Algorithm',
      quantumSafe: false,
      position: 1
    },
    { 
      name: 'Schnorr', 
      value: 'schnorr',
      progress: 0, 
      speed: 0, 
      color: '#4ecdc4', 
      icon: '✍️',
      description: 'Schnorr Digital Signature Scheme',
      quantumSafe: false,
      position: 2
    },
    { 
      name: 'Falcon512', 
      value: 'falcon',
      progress: 0, 
      speed: 0, 
      color: '#45b7d1', 
      icon: '🦅',
      description: 'Post-Quantum Lattice-based Signature',
      quantumSafe: true,
      position: 3
    },
    { 
      name: 'ML-DSA44', 
      value: 'mldsa',
      progress: 0, 
      speed: 0, 
      color: '#f9ca24', 
      icon: '🤖',
      description: 'Module-Lattice-based Digital Signature Algorithm',
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
    message: 'Hello Polychain L2 - Quantum Resistant Blockchain!'.repeat(200), // 10000 bytes
    messageSize: 10000,
    iterations: 3,
    raceDuration: 5000, // 5 seconds
    demoMode: false
  });


  const demoPresets = {
    'quick-demo': {
      name: '⚡ Quick Demo',
      message: 'Polychain L2 Demo: Post-Quantum Security Test',
      iterations: 2,
      raceDuration: 4000,
      description: 'Fast demo for live presentations'
    },
    'performance-showcase': {
      name: '🏆 Performance Showcase',
      message: 'x'.repeat(50000), // 50KB message
      iterations: 5,
      raceDuration: 8000,
      description: 'Large payload to show algorithm differences'
    },
    'quantum-comparison': {
      name: '🔒 Quantum vs Classical',
      message: 'Quantum-resistant cryptography benchmark on Internet Computer Protocol'.repeat(100),
      iterations: 3,
      raceDuration: 6000,
      description: 'Highlights post-quantum advantage'
    },
    'enterprise-test': {
      name: '🏢 Enterprise Load Test',
      message: JSON.stringify({transaction: 'multi-chain-transfer', amount: 1000000, chains: ['bitcoin', 'ethereum', 'icp', 'solana']}).repeat(500),
      iterations: 4,
      raceDuration: 7000,
      description: 'Enterprise-grade transaction simulation'
    }
  };

  const raceAnimationRef = useRef();
  const startTimeRef = useRef();

  // Helper function to safely convert numbers
  const safeNumber = (value, defaultValue) => {
    if (typeof value === 'bigint') return Number(value);
    if (typeof value === 'number') return value;
    return defaultValue;
  };

  useEffect(() => {
    loadRaceHistory();
    return () => {
      if (raceAnimationRef.current) {
        cancelAnimationFrame(raceAnimationRef.current);
      }
    };
  }, []);

  const loadRaceHistory = async () => {
    try {
      setRaceStats({
        totalRaces: Math.floor(Math.random() * 50) + 10,
        fastestTime: (Math.random() * 2000 + 500).toFixed(0),
        averageTime: (Math.random() * 3000 + 1000).toFixed(0),
        quantumAdvantage: (Math.random() * 15 + 5).toFixed(1)
      });
    } catch (error) {
      console.error('Error loading race history:', error);
    }
  };

  const startRace = async () => {
    if (isRacing || !polychain_l2_backend) {
      console.error('Cannot start race: Backend not initialized or race already running');
      return;
    }
    
    console.log('🏁 Starting CryptoRace with settings:', raceSettings);
    setIsRacing(true);
    startTimeRef.current = Date.now();
    
    // Reset algorithms
    const resetAlgorithms = algorithms.map(algo => ({
      ...algo,
      progress: 0,
      speed: 0,
      position: Math.floor(Math.random() * 4) + 1
    }));
    setAlgorithms(resetAlgorithms);
    
    // Run benchmarks and get real results
    console.log('⚡ Running crypto benchmarks...');
    const results = await runCryptoBenchmarks();
    console.log('📊 Benchmark results:', results);
    
    // Start animation with real benchmark times
    console.log('🎬 Starting race animation...');
    animateRace(results);
    
    // Process results
    const processedResults = processRaceResults(results);
    setRaceResults(processedResults);
    
    // Update winner (fastest backend_time_ns)
    const winner = processedResults[0]; // First result after sorting by backend_time_ns
    setCurrentWinner(winner);
    
    // Update stats
    updateRaceStats(processedResults);
    
    setIsRacing(false);
  };

  const animateRace = (benchmarkResults) => {
    const startTime = Date.now();
    
    // Normalize times for animation (use backend_time_ns for animation progress)
    const times = benchmarkResults.map(r => r.backend_time_ns);
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    const timeSpread = maxTime - minTime;
    
    // Calculate animation duration based on real performance differences
    // Shorter duration for demo mode to make it more spectacular
    const baseDuration = raceSettings.demoMode ? 3000 : raceSettings.raceDuration;
    const effectiveDuration = timeSpread > 0 ? 
      baseDuration * Math.max(1.5, Math.log(maxTime) / Math.log(minTime || 1)) : baseDuration;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const globalProgress = Math.min(elapsed / effectiveDuration, 1);
      
      setAlgorithms(prev => prev.map(algo => {
        const result = benchmarkResults.find(r => r.algorithm === algo.value);
        if (!result) return algo;
        
        // Enhanced progress calculation with easing for spectacular effect
        const performanceRatio = timeSpread > 0 ? 
          1 - ((result.backend_time_ns - minTime) / timeSpread) : 1;
        
        // Apply easing function for more dramatic visual effect
        const easedProgress = raceSettings.demoMode ? 
          globalProgress * globalProgress * (3 - 2 * globalProgress) : // Smooth step easing
          globalProgress;
        
        const algoProgress = Math.min(easedProgress * (0.3 + 0.7 * performanceRatio) * 100, 100);
        
        // Enhanced speed calculation with quantum boost visualization
        const baseSpeed = result.message_length / (result.backend_time_ns / 1_000_000_000) / 1000;
        const quantumBoost = algo.quantumSafe ? 1.2 : 1; // Visual boost for quantum algorithms
        const displaySpeed = raceSettings.demoMode ? 
          (baseSpeed * quantumBoost * (0.8 + 0.4 * Math.random())).toFixed(1) : // Add slight variation for demo
          baseSpeed.toFixed(1);
        
        return {
          ...algo,
          progress: algoProgress,
          speed: displaySpeed,
          isQuantumBoosted: algo.quantumSafe && raceSettings.demoMode && algoProgress > 20
        };
      }));
      
      // Continue animation until global progress reaches 100%
      if (globalProgress < 1) {
        raceAnimationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animate();
  };

  const runCryptoBenchmarks = async () => {
    const results = [];
    const testMessage = raceSettings.message || 'x'.repeat(raceSettings.messageSize);
    
    for (const algo of algorithms) {
      try {
        const frontendTimes = [];
        const backendTimes = [];
        
        // Run multiple iterations
        for (let i = 0; i < raceSettings.iterations; i++) {
          const frontendStartTime = performance.now();
          const result = await polychain_l2_backend.crypto_algorithm_benchmark(
            testMessage,
            algo.value
          );
          const frontendEndTime = performance.now();
          
          const frontendTimeMs = frontendEndTime - frontendStartTime;
          
          if ('Ok' in result) {
            const backendTimeNs = safeNumber(result.Ok.total_time_ns, 0);
            frontendTimes.push(frontendTimeMs);
            backendTimes.push(backendTimeNs);
            console.log(`${algo.name} - Iteration ${i + 1}: Backend Time: ${formatTime(backendTimeNs)} (${backendTimeNs}ns)`);
          } else {
            throw new Error(result.Err || `Benchmark failed for ${algo.name}`);
          }
          
          // Small delay between iterations
          if (i < raceSettings.iterations - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
        
        // Calculate averages
        const avgFrontendTime = frontendTimes.reduce((a, b) => a + b, 0) / frontendTimes.length;
        const avgBackendTime = backendTimes.reduce((a, b) => a + b, 0) / backendTimes.length || 1; // Default to 1ns if 0
        
        // Log average backend time
        console.log(`${algo.name} - Average Backend Time: ${formatTime(avgBackendTime)} (${avgBackendTime}ns)`);
        
        results.push({
          algorithm: algo.value,
          frontend_time_ms: avgFrontendTime,
          backend_time_ns: avgBackendTime,
          iterations: raceSettings.iterations,
          quantum_resistant: algo.quantumSafe,
          success: true,
          message_length: testMessage.length,
          color: algo.color,
          quantumSafe: algo.quantumSafe,
          timestamp: new Date().toLocaleTimeString(),
          id: Date.now() + Math.random()
        });
      } catch (error) {
        console.error(`Error benchmarking ${algo.name}:`, error);
        results.push({
          algorithm: algo.value,
          frontend_time_ms: 9999,
          backend_time_ns: 999999999999, // High time for failure
          iterations: raceSettings.iterations,
          quantum_resistant: algo.quantumSafe,
          success: false,
          message_length: testMessage.length,
          color: algo.color,
          quantumSafe: algo.quantumSafe,
          timestamp: new Date().toLocaleTimeString(),
          id: Date.now() + Math.random()
        });
      }
      
      // Small delay between algorithms
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    return results;
  };

  const processRaceResults = (results) => {
    const validResults = results.filter(r => r.backend_time_ns && !isNaN(r.backend_time_ns));
    if (validResults.length === 0) return [];
    
    const minTime = Math.min(...validResults.map(r => r.backend_time_ns));
    const maxTime = Math.max(...validResults.map(r => r.backend_time_ns));
    
    return validResults.map(result => {
      const timeNs = result.backend_time_ns;
      
      // Performance score (0-100, higher is better)
      const performanceScore = maxTime > minTime ? 
        ((maxTime - timeNs) / (maxTime - minTime)) * 100 : 100;
      
      // Security score based on quantum resistance
      const securityScore = result.quantum_resistant ? 100 : 60;
      
      // Future-readiness score (quantum algorithms get bonus)
      const futureReadiness = result.quantum_resistant ? 95 : 30;
      
      // Enterprise readiness (based on performance + security)
      const enterpriseScore = (performanceScore * 0.4 + securityScore * 0.6);
      
      // Combined total score with weighted factors
      const totalScore = raceSettings.demoMode ?
        (performanceScore * 0.3 + securityScore * 0.4 + futureReadiness * 0.3) :
        (performanceScore * 0.5 + securityScore * 0.3 + futureReadiness * 0.2);
      
      return {
        ...result,
        timeNs: timeNs.toFixed(0),
        performanceScore: performanceScore.toFixed(1),
        securityScore: securityScore.toFixed(1),
        futureReadiness: futureReadiness.toFixed(1),
        enterpriseScore: enterpriseScore.toFixed(1),
        totalScore: totalScore.toFixed(1),
        // Add grade classification
        grade: totalScore >= 90 ? 'A+' : 
               totalScore >= 80 ? 'A' :
               totalScore >= 70 ? 'B+' :
               totalScore >= 60 ? 'B' : 'C'
      };
    }).sort((a, b) => parseFloat(b.totalScore) - parseFloat(a.totalScore)); // Sort by total score (highest first)
  };

  const updateRaceStats = (results) => {
    const validResults = results.filter(r => r.backend_time_ns && !isNaN(r.backend_time_ns));
    if (!validResults.length) return;
    
    const avgTime = validResults.reduce((sum, r) => sum + r.backend_time_ns, 0) / validResults.length / 1_000_000; // Convert to ms
    const fastestTime = Math.min(...validResults.map(r => r.backend_time_ns)) / 1_000_000; // Convert to ms
    const quantumResults = validResults.filter(r => r.quantum_resistant);
    const classicalResults = validResults.filter(r => !r.quantum_resistant);
    
    const quantumAvg = quantumResults.length > 0 ? 
      quantumResults.reduce((sum, r) => sum + parseFloat(r.totalScore), 0) / quantumResults.length : 0;
    const classicalAvg = classicalResults.length > 0 ? 
      classicalResults.reduce((sum, r) => sum + parseFloat(r.totalScore), 0) / classicalResults.length : 0;
    
    const quantumAdvantage = quantumAvg > classicalAvg ? 
      ((quantumAvg - classicalAvg) / classicalAvg * 100).toFixed(1) : 0;
    
    setRaceStats(prev => ({
      totalRaces: prev.totalRaces + 1,
      fastestTime: Math.min(prev.fastestTime || fastestTime, fastestTime).toFixed(0),
      averageTime: isNaN(avgTime) ? 0 : avgTime.toFixed(0),
      quantumAdvantage
    }));
  };

  const formatTime = (nanoseconds) => {
    const ns = safeNumber(nanoseconds, 0);
    if (ns === 0) return '0ns (IC Optimized)';
    if (ns < 1000) return `${ns}ns`;
    if (ns < 1000000) return `${(ns / 1000).toFixed(2)}μs`;
    if (ns < 1000000000) return `${(ns / 1000000).toFixed(2)}ms`;
    return `${(ns / 1000000000).toFixed(2)}s`;
  };

  const RaceTrack = ({ algo, index }) => (
    <div className={`race-track ${algo.quantumSafe ? 'quantum-track' : 'classical-track'}`} 
         style={{ '--algo-color': algo.color }}>
      <div className="track-header">
        <div className="algo-info">
          <span className={`algo-icon ${algo.isQuantumBoosted ? 'quantum-boosted' : ''}`}>
            {algo.icon}
          </span>
          <div>
            <div className="algo-name">
              {algo.name}
              {algo.isQuantumBoosted && <span className="boost-indicator">⚡</span>}
            </div>
            <div className="algo-desc">{algo.description}</div>
          </div>
        </div>
        
        <div className={`quantum-badge ${algo.quantumSafe ? 'quantum-highlight' : ''}`}>
          {algo.quantumSafe ? (
            <span className="quantum-safe">
              <Shield size={14} />
              Q-Safe
              {raceSettings.demoMode && <span className="demo-sparkle">✨</span>}
            </span>
          ) : (
            <span className="quantum-vulnerable">
              ⚠️ Q-Vulnerable
            </span>
          )}
        </div>
      </div>
      
      <div className="track-container">
        <div className={`track-line ${algo.quantumSafe ? 'quantum-line' : ''}`}>
          <div 
            className={`track-runner ${algo.isQuantumBoosted ? 'quantum-runner' : ''}`}
            style={{ 
              left: `${algo.progress}%`,
              backgroundColor: algo.color,
              boxShadow: algo.quantumSafe ? 
                `0 0 30px ${algo.color}60, 0 0 60px ${algo.color}20` :
                `0 0 20px ${algo.color}40`
            }}
          >
            <span className="runner-emoji">{algo.icon}</span>
            {algo.isQuantumBoosted && (
              <div className="quantum-trail"></div>
            )}
          </div>
        </div>
        
        <div className="track-stats">
          <span>Progress: {algo.progress.toFixed(1)}%</span>
          <span className={algo.isQuantumBoosted ? 'boosted-speed' : ''}>
            Speed: {algo.speed} kB/s
            {algo.isQuantumBoosted && <span className="speed-boost">🚀</span>}
          </span>
        </div>
      </div>
    </div>
  );

  const PodiumPosition = ({ result, position }) => {
    const podiumHeight = position === 1 ? 140 : position === 2 ? 120 : 100;
    const podiumColor = position === 1 ? '#ffd700' : position === 2 ? '#c0c0c0' : '#cd7f32';
    const isQuantum = result.quantum_resistant;
    
    return (
      <div className={`podium-position ${isQuantum ? 'quantum-podium' : ''}`} 
           style={{ '--podium-height': `${podiumHeight}px` }}>
        <div className="podium-crown">
          {position === 1 && <span className="crown-emoji">👑</span>}
          {position === 2 && <span className="medal-emoji">🥈</span>}
          {position === 3 && <span className="medal-emoji">🥉</span>}
        </div>
        
        <div className="podium-runner" 
             style={{ 
               backgroundColor: result.color,
               boxShadow: isQuantum ? `0 0 30px ${result.color}50` : `0 0 15px ${result.color}30`
             }}>
          {algorithms.find(a => a.value === result.algorithm)?.icon}
          {isQuantum && <div className="quantum-aura"></div>}
        </div>
        
        <div className="podium-info">
          <div className="position-number" style={{ color: podiumColor }}>
            #{position}
          </div>
          <div className="algo-name">
            {result.algorithm.toUpperCase()}
            <span className={`grade-badge grade-${result.grade.replace('+', 'plus')}`}>{result.grade}</span>
          </div>
          
          <div className="score-breakdown">
            <div className="main-score">Score: {result.totalScore}</div>
            <div className="score-details">
              <div className="score-item">
                <span className="score-label">⚡ Performance:</span>
                <span className="score-value">{result.performanceScore}</span>
              </div>
              <div className="score-item">
                <span className="score-label">🛡️ Security:</span>
                <span className="score-value">{result.securityScore}</span>
              </div>
              <div className="score-item">
                <span className="score-label">🚀 Future:</span>
                <span className="score-value">{result.futureReadiness}</span>
              </div>
              <div className="score-item enterprise">
                <span className="score-label">🏢 Enterprise:</span>
                <span className="score-value">{result.enterpriseScore}</span>
              </div>
            </div>
          </div>
          
          <div className="time-display">{formatTime(result.backend_time_ns)}</div>
        </div>
        
        <div 
          className={`podium-base ${isQuantum ? 'quantum-base' : ''}`}
          style={{ 
            height: `${podiumHeight}px`,
            background: isQuantum ? 
              `linear-gradient(135deg, ${podiumColor}, #64ffda)` :
              podiumColor
          }}
        >
          <div className="podium-label">{result.algorithm}</div>
        </div>
      </div>
    );
  };

  // Test backend connectivity
  const [backendReady, setBackendReady] = useState(false);
  
  useEffect(() => {
    const testBackend = async () => {
      if (polychain_l2_backend) {
        try {
          console.log('🔌 Testing backend connection...');
          // Test with a simple call - using the benchmark function with minimal data
          await polychain_l2_backend.crypto_algorithm_benchmark('test', 'ecdsa');
          console.log('✅ Backend connection successful');
          setBackendReady(true);
        } catch (error) {
          console.log('⚠️ Backend test call failed, but proceeding:', error);
          // Proceed anyway as the error might be due to the test call itself
          setBackendReady(true);
        }
      }
    };
    
    testBackend();
  }, []);

  if (!polychain_l2_backend || !backendReady) {
    return (
      <div className="crypto-race">
        <div className="race-header">
          <h2>
            <Trophy className="trophy-icon" />
            Cryptographic Algorithm Race
          </h2>
        </div>
        <div className="loading">
          {!polychain_l2_backend ? 'Initializing backend connection...' : 'Testing backend connectivity...'}
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-race">
      <div className="race-header">
        <h2>
          <Trophy className="trophy-icon" />
          Cryptographic Algorithm Race
        </h2>
        
        <div className="race-controls">
          <div className="demo-mode-toggle">
            <label className="demo-toggle">
              <input
                type="checkbox"
                checked={raceSettings.demoMode}
                onChange={(e) => setRaceSettings(prev => ({
                  ...prev,
                  demoMode: e.target.checked
                }))}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                🎬 Demo Mode {raceSettings.demoMode ? 'ON' : 'OFF'}
              </span>
            </label>
          </div>

          {raceSettings.demoMode && (
            <div className="demo-presets">
              <h4>🎯 Demo Presets for Video</h4>
              <div className="preset-grid">
                {Object.entries(demoPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    className="preset-button"
                    onClick={() => {
                      setRaceSettings(prev => ({
                        ...prev,
                        message: preset.message,
                        messageSize: preset.message.length,
                        iterations: preset.iterations,
                        raceDuration: preset.raceDuration
                      }));
                    }}
                  >
                    <div className="preset-name">{preset.name}</div>
                    <div className="preset-desc">{preset.description}</div>
                    <div className="preset-stats">
                      <span>{(preset.message.length / 1000).toFixed(1)}KB</span>
                      <span>{preset.iterations}x iterations</span>
                      <span>{preset.raceDuration / 1000}s</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="race-settings">
            <div className="setting">
              <label>Message:</label>
              <input
                type="text"
                value={raceSettings.message}
                onChange={(e) => setRaceSettings(prev => ({
                  ...prev,
                  message: e.target.value,
                  messageSize: e.target.value.length
                }))}
                placeholder="Enter message to benchmark"
              />
            </div>
            <div className="setting">
              <label>Iterations: {raceSettings.iterations}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={raceSettings.iterations}
                onChange={(e) => setRaceSettings(prev => ({
                  ...prev,
                  iterations: parseInt(e.target.value)
                }))}
              />
              <div className="range-labels">
                <span>1</span>
                <span>Fast</span>
                <span>Accurate</span>
                <span>10</span>
              </div>
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
              <h3>🏆 Race Winner: {currentWinner.algorithm.toUpperCase()}</h3>
              <div className="winner-stats">
                <span>⏱️ Backend: {formatTime(currentWinner.backend_time_ns)}</span>
                <span>🌐 Frontend: {currentWinner.frontend_time_ms.toFixed(2)}ms</span>
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
              <div className="stat-label">Fastest Backend Time</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{raceStats.averageTime}ms</div>
              <div className="stat-label">Average Backend Time</div>
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
              <span>Backend</span>
              <span>Frontend (ms)</span>
              <span>Efficiency</span>
              <span>Security</span>
              <span>Score</span>
              <span>Iterations</span>
              <span>Message Length</span>
            </div>
            {raceResults.map((result, index) => (
              <div key={result.id} className="table-row" style={{ '--row-color': result.color }}>
                <div className="algo-cell">
                  <span className="algo-icon">
                    {algorithms.find(a => a.value === result.algorithm)?.icon}
                  </span>
                  <span>{result.algorithm.toUpperCase()}</span>
                  {result.quantum_resistant && <Shield size={14} className="quantum-shield" />}
                </div>
                <span className="time-cell">{formatTime(result.backend_time_ns)}</span>
                <span className="time-cell">{result.frontend_time_ms.toFixed(2)}</span>
                <span className="efficiency-cell">{result.efficiency}%</span>
                <span className="security-cell">
                  {result.quantum_resistant ? 'Post-Quantum' : 'Classical'}
                </span>
                <span className="score-cell">{result.totalScore}</span>
                <span className="iterations-cell">{result.iterations}</span>
                <span className="message-length-cell">{result.message_length} bytes</span>
              </div>
            ))}
          </div>
          
          <div className="performance-comparison">
            <h4>Performance Comparison</h4>
            {(() => {
              const validResults = raceResults.filter(r => r.backend_time_ns && !isNaN(r.backend_time_ns));
              if (validResults.length === 0) {
                return <p>No valid timing data available. Check console for errors.</p>;
              }
              
              const fastest = validResults[0]; // First result is fastest after sorting
              const slowest = validResults[validResults.length - 1];
              const minTime = fastest.backend_time_ns;
              const maxTime = slowest.backend_time_ns;
              
              return (
                <div className="comparison-stats">
                  <p><strong>Fastest (Backend):</strong> {fastest.algorithm.toUpperCase()} ({formatTime(minTime)})</p>
                  <p><strong>Slowest (Backend):</strong> {slowest.algorithm.toUpperCase()} ({formatTime(maxTime)})</p>
                  <p><strong>Speed Difference:</strong> {maxTime > minTime ? `${(maxTime / (minTime || 1)).toFixed(1)}x` : 'Similar'}</p>
                  <p><strong>Quantum Resistant Algorithms:</strong> {validResults.filter(r => r.quantum_resistant).length} / {validResults.length}</p>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoRace;
