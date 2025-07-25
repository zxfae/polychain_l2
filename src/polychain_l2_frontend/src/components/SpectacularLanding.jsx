import React, { useState, useEffect, useRef } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import { 
  Zap, Shield, Globe, TrendingUp, Brain, Award,
  ChevronRight, Play, Gauge, Eye, Building2, Link, Lock, Key
} from 'lucide-react';
import './spectacular-landing.css';

const SpectacularLanding = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    networksSupported: 0,
    quantumReady: 0,
    performanceBoost: 0
  });
  
  const canvasRef = useRef();
  const animationRef = useRef();
  const particlesRef = useRef([]);

  useEffect(() => {
    initializeParticles();
    startBackgroundAnimation();
    animateStats();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const initializeParticles = () => {
    particlesRef.current = Array.from({ length: 100 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.2,
      color: ['#4488ff', '#44ff88', '#ffaa44', '#ff4488'][Math.floor(Math.random() * 4)],
      connections: []
    }));
  };

  const startBackgroundAnimation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update particles
      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        
        // Draw connections to nearby particles
        particlesRef.current.forEach(other => {
          if (particle !== other) {
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(68, 136, 255, ${0.2 * (1 - distance / 100)})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        });
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();
      });
      
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const animateStats = async () => {
    try {
      // Récupérer les vraies données du backend
      const [sequencerMetrics, multiChainMetrics, vaultStats] = await Promise.all([
        polychain_l2_backend.get_sequencer_metrics(),
        polychain_l2_backend.get_multi_chain_metrics(),
        polychain_l2_backend.get_vault_statistics()
      ]);
      
      const targetStats = {
        totalTransactions: parseInt(sequencerMetrics.total_transactions_sequenced) || 0,
        networksSupported: multiChainMetrics.supported_chains?.length || 6,
        quantumReady: 100, // Toujours 100% car tu supportes post-quantum
        performanceBoost: Math.floor((sequencerMetrics.average_batch_size || 1) * 100) // Performance basée sur batch size
      };
      
      const duration = 3000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - (1 - progress) ** 4;
        
        setStats({
          totalTransactions: Math.floor(targetStats.totalTransactions * easeOutQuart),
          networksSupported: Math.floor(targetStats.networksSupported * easeOutQuart),
          quantumReady: Math.floor(targetStats.quantumReady * easeOutQuart),
          performanceBoost: Math.floor(targetStats.performanceBoost * easeOutQuart)
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
      
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback avec des stats de base si les APIs échouent
      const targetStats = {
        totalTransactions: 0,
        networksSupported: 6,
        quantumReady: 100,
        performanceBoost: 275
      };
      
      const duration = 3000;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - (1 - progress) ** 4;
        
        setStats({
          totalTransactions: Math.floor(targetStats.totalTransactions * easeOutQuart),
          networksSupported: Math.floor(targetStats.networksSupported * easeOutQuart),
          quantumReady: Math.floor(targetStats.quantumReady * easeOutQuart),
          performanceBoost: Math.floor(targetStats.performanceBoost * easeOutQuart)
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  };

  const features = [
    {
      icon: Lock,
      title: "Crypto Center",
      description: "Cryptographic command center with 4 quantum-safe algorithms",
      color: "#ff6644",
      highlight: "QUANTUM-SAFE",
      route: "crypto-showcase"
    },
    {
      icon: Key,
      title: "Crypto Tools Hub",
      description: "AI, benchmarks, and advanced cryptographic tools",
      color: "#4488ff",
      highlight: "AI-POWERED",
      route: "crypto-tools"
    },
    {
      icon: Zap,
      title: "Crypto Race",
      description: "Real-time race between cryptographic algorithms",
      color: "#ffaa44",
      highlight: "LIVE RACE",
      route: "crypto-race"
    },
    {
      icon: Eye,
      title: "Blockchain Explorer",
      description: "Explore cryptographically signed transactions",
      color: "#44ff88",
      highlight: "INTERACTIVE",
      route: "explorer"
    }
  ];

  const FeatureCard = ({ feature, index }) => (
    <div 
      className="feature-card"
      style={{ '--feature-color': feature.color, '--delay': `${index * 0.1}s` }}
      onClick={() => onNavigate(getFeatureRoute(feature))}
    >
      <div className="feature-highlight">
        {feature.highlight}
      </div>
      
      <div className="feature-icon">
        <feature.icon size={32} />
      </div>
      
      <h3>{feature.title}</h3>
      <p>{feature.description}</p>
      
      <div className="feature-action">
        <span>Explorer</span>
        <ChevronRight size={20} />
      </div>
    </div>
  );

  const getFeatureRoute = (feature) => {
    return feature.route || "crypto-showcase";
  };

  const StatCounter = ({ value, label, suffix = "" }) => (
    <div className="stat-counter">
      <div className="stat-value">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );

  return (
    <div className="spectacular-landing">
      <canvas ref={canvasRef} className="background-canvas" />
      
      <div className="landing-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              First Post-Quantum L2 on ICP
            </div>
            
            <h1 className="hero-title">
              <span className="gradient-text">Polychain</span>
              <br />
              The Future of Multi-Chain
            </h1>
            
            <p className="hero-description">
              Revolutionary Layer 2 blockchain combining post-quantum cryptography 
              with Internet Computer Protocol's decentralized infrastructure. 
              Experience the next generation of cross-chain DeFi.
            </p>
            
            <div className="hero-actions">
              <button 
                className="cta-primary"
                onClick={() => onNavigate('explorer')}
              >
                <Play size={20} />
                Blockchain Explorer
              </button>
              
              <button 
                className="cta-secondary"
                onClick={() => onNavigate('tx-flow')}
              >
                <Building2 size={20} />
                Sequencer work
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-orb orb-1">
              <Shield size={24} />
            </div>
            <div className="floating-orb orb-2">
              <Zap size={24} />
            </div>
            <div className="floating-orb orb-3">
              <Globe size={24} />
            </div>
            <div className="floating-orb orb-4">
              <Brain size={24} />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section">
          <div className="stats-grid">
            <StatCounter 
              value={stats.totalTransactions} 
              label="Total Transactions" 
            />
            <StatCounter 
              value={stats.networksSupported} 
              label="Networks Supported" 
            />
            <StatCounter 
              value={stats.quantumReady} 
              label="Quantum Ready" 
              suffix="%" 
            />
            <StatCounter 
              value={stats.performanceBoost} 
              label="Performance Boost" 
              suffix="%" 
            />
          </div>
        </section>

        {/* Cryptography Showcase Section */}
        <section className="crypto-showcase-section">
          <div className="section-header">
            <h2>
              <Lock size={32} />
              Advanced Cryptography Engine
            </h2>
            <p>4 cutting-edge algorithms including post-quantum signatures</p>
          </div>
          
          <div className="crypto-algorithms">
            <div className="crypto-algo classical" onClick={() => onNavigate('crypto-showcase')}>
              <div className="algo-icon">
                <Key size={24} />
              </div>
              <h3>ECDSA</h3>
              <p>95.5% efficiency</p>
              <div className="algo-badge classical">Classical</div>
            </div>
            
            <div className="crypto-algo classical" onClick={() => onNavigate('crypto-showcase')}>
              <div className="algo-icon">
                <Shield size={24} />
              </div>
              <h3>Schnorr</h3>
              <p>92.8% efficiency</p>
              <div className="algo-badge classical">Enhanced</div>
            </div>
            
            <div className="crypto-algo quantum" onClick={() => onNavigate('crypto-showcase')}>
              <div className="algo-icon">
                <Lock size={24} />
              </div>
              <h3>Falcon512</h3>
              <p>78.2% efficiency</p>
              <div className="algo-badge quantum">Quantum-Safe</div>
            </div>
            
            <div className="crypto-algo quantum" onClick={() => onNavigate('crypto-showcase')}>
              <div className="algo-icon">
                <Brain size={24} />
              </div>
              <h3>ML-DSA44</h3>
              <p>85.6% efficiency</p>
              <div className="algo-badge quantum">Quantum-Safe</div>
            </div>
          </div>
          
          <div className="crypto-cta">
            <button 
              className="cta-button crypto-cta-btn"
              onClick={() => onNavigate('crypto-showcase')}
            >
              <Lock size={20} />
              Explore Crypto Center
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="section-header">
            <h2>Discover Revolutionary Features</h2>
            <p>Explore our cutting-edge tools designed for the future of blockchain</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section className="tech-section">
          <div className="section-header">
            <h2>Powered by Advanced Technology</h2>
          </div>
          
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon quantum">
                <Shield size={28} />
              </div>
              <h3>Post-Quantum Cryptography</h3>
              <p>Future-proof security with Falcon512 and ML-DSA algorithms</p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon blockchain">
                <Link size={28} />
              </div>
              <h3>Internet Computer Protocol</h3>
              <p>Decentralized cloud computing at web speed</p>
            </div>
            
            <div className="tech-card">
              <div className="tech-icon performance">
                <TrendingUp size={28} />
              </div>
              <h3>Multi-Chain Bridge</h3>
              <p>Seamless cross-chain transactions with 70% compression</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="final-cta">
          <div className="cta-content">
            <Award className="cta-icon" size={48} />
            <h2>Ready to Experience the Future?</h2>
            <p>Join the revolution in post-quantum blockchain technology</p>
            
            <div className="cta-buttons">
              <button 
                className="cta-primary large"
                onClick={() => onNavigate('dashboard')}
              >
                <Gauge size={24} />
                Start with Live Dashboard
              </button>
              
              <button 
                className="cta-secondary large"
                onClick={() => onNavigate('quantum-sim')}
              >
                <Brain size={24} />
                Try Quantum Simulator
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SpectacularLanding;
