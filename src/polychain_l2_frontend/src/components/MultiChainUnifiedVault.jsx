import React, { useState, useEffect, useRef } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import ChainSelector, { SUPPORTED_CHAINS } from './ChainSelector';
import {
  Wallet, ArrowUpCircle, ArrowDownCircle, Shield, Zap, AlertTriangle,
  Link, Bitcoin, RefreshCw, ArrowDown, ArrowUp, Building2
} from 'lucide-react';
import '../design-system.css';
import './multi-chain-vault.css';

function MultiChainUnifiedVault() {
  const [activeTab, setActiveTab] = useState('multichain');
  const [selectedChain, setSelectedChain] = useState('Bitcoin');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [quantumSecure, setQuantumSecure] = useState(true);
  const [balances, setBalances] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [bitcoinBalance, setBitcoinBalance] = useState(null);

  const canvasRef = useRef();
  const animationRef = useRef();
  const particlesRef = useRef([]);

  const tabs = [
    { id: 'multichain', label: 'Multi-Chain Vault', icon: Building2 },
    { id: 'bitcoin-legacy', label: 'Bitcoin Legacy', icon: Bitcoin },
  ];

  useEffect(() => {
    initializeParticles();
    startBackgroundAnimation();
    if (activeTab === 'multichain' && address) {
      loadBalances();
      loadMetrics();
    } else if (activeTab === 'bitcoin-legacy' && address.length > 2) {
      loadBitcoinBalance();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [selectedChain, address, activeTab]);

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

      particlesRef.current.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

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

  const loadBalances = async () => {
    if (!address || activeTab !== 'multichain') {
      console.log('Skip loading balances - no address or wrong tab');
      return;
    }

    console.log('Loading balances for:', selectedChain, address);
    
    try {
      let formattedBalances = [];

      if (selectedChain === 'Bitcoin') {
        const bitcoinBalance = await polychain_l2_backend.get_bitcoin_balance(address);
        console.log('Bitcoin balance response:', bitcoinBalance);
        formattedBalances = [{
          chain: 'Bitcoin',
          native_balance: Number(bitcoinBalance.native_bitcoin) / 100_000_000,
          wrapped_balance: Number(bitcoinBalance.wrapped_bitcoin) / 100_000_000,
          total_balance: Number(bitcoinBalance.total_bitcoin) / 100_000_000
        }];
      } else if (selectedChain === 'Ethereum') {
        const ethereumBalance = await polychain_l2_backend.get_ethereum_balance(address);
        console.log('Ethereum balance response:', ethereumBalance);
        formattedBalances = [{
          chain: 'Ethereum',
          native_balance: Number(ethereumBalance.native_ethereum) / 1_000_000_000_000_000_000,
          wrapped_balance: Number(ethereumBalance.wrapped_ethereum) / 1_000_000_000_000_000_000,
          total_balance: Number(ethereumBalance.total_ethereum) / 1_000_000_000_000_000_000
        }];
      } else if (selectedChain === 'ICP') {
        const icpBalance = await polychain_l2_backend.get_icp_balance(address);
        console.log('ICP balance response:', icpBalance);
        formattedBalances = [{
          chain: 'ICP',
          native_balance: Number(icpBalance.native_icp) / 100_000_000,
          wrapped_balance: Number(icpBalance.wrapped_icp) / 100_000_000,
          total_balance: Number(icpBalance.total_icp) / 100_000_000
        }];
      } else if (selectedChain === 'Solana') {
        const solanaBalance = await polychain_l2_backend.get_solana_balance(address);
        console.log('Solana balance response:', solanaBalance);
        formattedBalances = [{
          chain: 'Solana',
          native_balance: Number(solanaBalance.native_solana) / 1_000_000_000,
          wrapped_balance: Number(solanaBalance.wrapped_solana) / 1_000_000_000,
          total_balance: Number(solanaBalance.total_solana) / 1_000_000_000
        }];
      } else {
        formattedBalances = [{
          chain: selectedChain,
          native_balance: 0,
          wrapped_balance: 0,
          total_balance: 0
        }];
      }

      console.log('Setting balances:', formattedBalances);
      setBalances(formattedBalances);
    } catch (error) {
      console.error('Failed to load balances:', error);
      setBalances([]);
    }
  };

  const loadBitcoinBalance = async () => {
    if (!address || activeTab !== 'bitcoin-legacy') return;

    try {
      const data = await polychain_l2_backend.get_bitcoin_balance(address);
      setBitcoinBalance({
        native_bitcoin: Number(data.native_bitcoin || 0),
        wrapped_bitcoin: Number(data.wrapped_bitcoin || 0),
        total_bitcoin: Number(data.total_bitcoin || 0)
      });
    } catch (error) {
      console.error('Failed to load bitcoin balance:', error);
      setBitcoinBalance(null);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await polychain_l2_backend.get_multi_chain_metrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const formatAmount = (amount, chain) => {
    const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chain);
    return `${parseFloat(amount).toFixed(8)} ${chainInfo?.token || chain}`;
  };

  const handleMultiChainDeposit = async () => {
    if (!address || !amount) {
      setResult('Please fill in address and amount');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const numAmount = parseFloat(amount);
      let response;

      if (selectedChain === 'Bitcoin') {
        const satoshiAmount = Math.round(numAmount * 100_000_000);
        response = await polychain_l2_backend.deposit_bitcoin(address, satoshiAmount);
      } else if (selectedChain === 'Ethereum') {
        const weiAmount = BigInt(Math.round(numAmount * 1_000_000_000_000_000_000));
        response = await polychain_l2_backend.deposit_ethereum(address, Number(weiAmount));
      } else if (selectedChain === 'ICP') {
        const e8sAmount = Math.round(numAmount * 100_000_000);
        response = await polychain_l2_backend.deposit_icp(address, e8sAmount);
      } else if (selectedChain === 'Solana') {
        const lamportsAmount = Math.round(numAmount * 1_000_000_000);
        response = await polychain_l2_backend.deposit_solana(address, lamportsAmount);
      } else {
        setResult(`❌ ${selectedChain} deposits not yet implemented.`);
        setLoading(false);
        return;
      }

      if ('Ok' in response) {
        setResult(`✅ ${response.Ok}`);
        setAmount('');
        loadBalances();
        loadMetrics();
      } else {
        setResult(`❌ ${response.Err}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiChainWithdraw = async () => {
    if (!address || !amount) {
      setResult('Please fill in address and amount');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const numAmount = parseFloat(amount);
      let response;

      if (selectedChain === 'Bitcoin') {
        const satoshiAmount = Math.round(numAmount * 100_000_000);
        if (quantumSecure) {
          response = await polychain_l2_backend.withdraw_bitcoin_adaptive(
            address,
            satoshiAmount,
            true,
            75
          );
        } else {
          response = await polychain_l2_backend.withdraw_bitcoin(
            address,
            satoshiAmount,
            false
          );
        }
      } else if (selectedChain === 'Ethereum') {
        const weiAmount = BigInt(Math.round(numAmount * 1_000_000_000_000_000_000));
        response = await polychain_l2_backend.withdraw_ethereum(address, Number(weiAmount), quantumSecure);
      } else if (selectedChain === 'ICP') {
        const e8sAmount = Math.round(numAmount * 100_000_000);
        response = await polychain_l2_backend.withdraw_icp(address, e8sAmount, quantumSecure);
      } else if (selectedChain === 'Solana') {
        const lamportsAmount = Math.round(numAmount * 1_000_000_000);
        response = await polychain_l2_backend.withdraw_solana(address, lamportsAmount, quantumSecure);
      } else {
        setResult(`❌ ${selectedChain} withdrawals not yet implemented.`);
        setLoading(false);
        return;
      }

      if ('Ok' in response) {
        setResult(`✅ ${response.Ok}`);
        setAmount('');
        loadBalances();
        loadMetrics();
      } else {
        setResult(`❌ ${response.Err}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBitcoinDeposit = async () => {
    if (!address || !amount) {
      setResult('Please enter an address and amount');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const amountSatoshi = Math.floor(parseFloat(amount) * 100000000);
      const response = await polychain_l2_backend.deposit_bitcoin(address, amountSatoshi);
      setResult(response.Ok ? `✅ ${response.Ok}` : `❌ Error: ${response.Err || response}`);
      setAmount('');
      loadBitcoinBalance();
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBitcoinWithdraw = async () => {
    if (!address || !amount) {
      setResult('Please enter an address and amount');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const amountSatoshi = Math.floor(parseFloat(amount) * 100000000);
      const response = await polychain_l2_backend.withdraw_bitcoin(address, amountSatoshi, quantumSecure);
      setResult(response.Ok ? `✅ ${response.Ok}` : `❌ Error: ${response.Err || response}`);
      setAmount('');
      loadBitcoinBalance();
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const selectedChainInfo = SUPPORTED_CHAINS.find(c => c.id === selectedChain);
  const selectedChainBalance = balances.find(b => b.chain === selectedChain);

  if (!polychain_l2_backend) {
    return (
      <div className="ds-card-workspace">
        <div className="ds-skeleton" style={{ height: '120px', borderRadius: 'var(--ds-radius-lg)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--ds-space-component-lg)', color: 'var(--ds-text-secondary)' }}>
            Initializing backend connection...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-card-workspace">
      <canvas ref={canvasRef} className="background-canvas" />
      <div className="vault-content">
        <div className="vault-header">
          <h2 className="ds-heading-component">
            <Link size={28} />
            Polychain L2 Universal Multi-Chain Vault
          </h2>
          <div className="ds-badge">
            <Zap size={16} />
            70% Compression • All Chains
          </div>
        </div>

        <div className="tabs-nav" role="tablist" aria-label="Vault navigation">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setResult('');
                setAmount('');
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const direction = e.key === 'ArrowRight' ? 1 : -1;
                  const nextIndex = (index + direction + tabs.length) % tabs.length;
                  const nextTab = tabs[nextIndex];
                  setActiveTab(nextTab.id);
                  setResult('');
                  setAmount('');
                  setTimeout(() => {
                    document.getElementById(`tab-${nextTab.id}`)?.focus();
                  }, 0);
                } else if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveTab(tab.id);
                  setResult('');
                  setAmount('');
                }
              }}
            >
              <tab.icon size={18} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="vault-content-inner">
          {activeTab === 'multichain' && (
            <div id="tabpanel-multichain" role="tabpanel" aria-labelledby="tab-multichain">
              <ChainSelector
                selectedChain={selectedChain}
                onChainChange={setSelectedChain}
                showMetrics={true}
              />

              <div className="vault-actions ds-card-glass">
                <div className="panel-header">
                  <h3 className="panel-title">
                    <Wallet size={24} />
                    {selectedChainInfo?.name} Operations
                  </h3>
                  <button
                    onClick={loadBalances}
                    disabled={loading || !address}
                    className="button button-secondary ds-button"
                    aria-label="Refresh balances"
                  >
                    <RefreshCw size={14} className={loading ? 'ds-animate-spin' : ''} />
                    Refresh
                  </button>
                </div>

                <div className="ds-form-group">
                  <label htmlFor="wallet-address">Wallet Address:</label>
                  <input
                    id="wallet-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={`Enter ${selectedChainInfo?.name} address...`}
                    className="address-input ds-input"
                    aria-describedby="wallet-address-help"
                    aria-required="true"
                  />
                  <div id="wallet-address-help" className="sr-only">
                    Enter your {selectedChainInfo?.name} wallet address to view balances and perform transactions
                  </div>
                </div>

                <div className="ds-form-group">
                  <label htmlFor="transaction-amount">Amount ({selectedChainInfo?.token}):</label>
                  <input
                    id="transaction-amount"
                    type="number"
                    step="0.00000001"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`0.00000000 ${selectedChainInfo?.token}`}
                    className="amount-input ds-input"
                    aria-describedby="amount-help"
                    aria-required="true"
                  />
                  <div id="amount-help" className="sr-only">
                    Enter the amount in {selectedChainInfo?.token} to deposit or withdraw
                  </div>
                </div>

                <div className="quantum-toggle">
                  <label>
                    <input
                      type="checkbox"
                      checked={quantumSecure}
                      onChange={(e) => setQuantumSecure(e.target.checked)}
                    />
                    <Shield size={16} />
                    Quantum-Secured Withdrawal
                  </label>
                </div>

                <div className="action-buttons button-group">
                  <button
                    onClick={handleMultiChainDeposit}
                    disabled={loading}
                    className="deposit-btn ds-button"
                  >
                    <ArrowDownCircle size={18} />
                    {loading ? 'Processing...' : 'Deposit'}
                  </button>

                  <button
                    onClick={handleMultiChainWithdraw}
                    disabled={loading}
                    className="withdraw-btn ds-button"
                  >
                    <ArrowUpCircle size={18} />
                    {loading ? 'Processing...' : 'Withdraw'}
                  </button>
                </div>

                {result && (
                  <div
                    className={`result ds-result ${result.includes('Error') ? 'ds-alert-error' : 'ds-alert-success'}`}
                  >
                    {result.includes('Error') && <AlertTriangle size={16} />}
                    {result}
                  </div>
                )}

                <div className="balance-section">
                  <h4 className="section-title">
                    <Wallet size={20} />
                    Your Balances
                  </h4>
                  {address ? (
                    <div className="balances-horizontal-container">
                      {balances.length > 0 ? (
                        balances.map((balance, index) => {
                          const chainId = balance.chain;
                          const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
                          const IconComponent = chainInfo?.icon || Wallet;

                          return (
                            <div
                              key={index}
                              className={`balance-item ds-card-glass ${selectedChain === chainId ? 'selected' : ''}`}
                              onClick={() => setSelectedChain(chainId)}
                              role="button"
                              tabIndex={0}
                              aria-label={`Select ${chainInfo?.name} balance`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setSelectedChain(chainId);
                                }
                              }}
                            >
                              <div className="balance-header">
                                <IconComponent size={18} style={{ color: chainInfo?.color }} />
                                <span>{chainInfo?.name}</span>
                              </div>
                              <div className="balance-amounts">
                                <div className="balance-detail">
                                  <span className="label">Native:</span>
                                  <span className="value">{formatAmount(balance.native_balance, chainId)}</span>
                                </div>
                                <div className="balance-detail">
                                  <span className="label">Wrapped:</span>
                                  <span className="value">{formatAmount(balance.wrapped_balance, chainId)}</span>
                                </div>
                                <div className="balance-detail balance-total">
                                  <span className="label">Total:</span>
                                  <span className="value">{formatAmount(balance.total_balance, chainId)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="no-balances">Loading balances...</p>
                      )}
                    </div>
                  ) : (
                    <div className="balances-placeholder">
                      <Wallet size={48} />
                      <h3>Enter an Address</h3>
                      <p>Please provide a wallet address to view your balances.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bitcoin-legacy' && (
            <div id="tabpanel-bitcoin-legacy" role="tabpanel" aria-labelledby="tab-bitcoin-legacy" className="vault-card ds-card-glass">
              <h3>Bitcoin Vault - Layer 2 Ethereum</h3>
              <p className="description">
                Advanced Bitcoin Layer 2 solution with quantum-resistant cryptography.
                Deposits above 100,000 sats are stored as native Bitcoin, lower amounts as wrapped tokens on Ethereum.
              </p>

              <div className="form-group">
                <label htmlFor="bitcoin-address">Bitcoin Address</label>
                <input
                  id="bitcoin-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., bc1q..., 1A1zP1..."
                  className="address-input ds-input"
                  aria-describedby="bitcoin-address-desc"
                  aria-required="true"
                />
                <div id="bitcoin-address-desc" className="sr-only">
                  Enter your Bitcoin wallet address to deposit or withdraw funds
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bitcoin-amount">Amount (BTC)</label>
                <input
                  id="bitcoin-amount"
                  type="number"
                  step="0.00000001"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00000000"
                  className="amount-input ds-input"
                  aria-describedby="bitcoin-amount-desc"
                  aria-required="true"
                />
                <div id="bitcoin-amount-desc" className="sr-only">
                  Enter the amount in Bitcoin (BTC) to deposit or withdraw
                </div>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={quantumSecure}
                    onChange={(e) => setQuantumSecure(e.target.checked)}
                  />
                  <Shield size={16} />
                  Use quantum-resistant cryptography (Falcon512)
                </label>
              </div>

              <div className="button-row">
                <button
                  onClick={handleBitcoinDeposit}
                  disabled={loading}
                  className="ds-button"
                >
                  <ArrowDown size={18} />
                  {loading ? 'Processing...' : 'Deposit'}
                </button>
                <button
                  onClick={handleBitcoinWithdraw}
                  disabled={loading}
                  className="danger ds-button"
                >
                  <ArrowUp size={18} />
                  {loading ? 'Processing...' : 'Withdraw'}
                </button>
                <button
                  onClick={loadBitcoinBalance}
                  disabled={loading || !address}
                  className="secondary ds-button"
                >
                  <RefreshCw size={18} />
                  Refresh Balance
                </button>
              </div>

              {bitcoinBalance && (
                <div className="balance">
                  <h4>Balance</h4>
                  <div>
                    <strong>Native:</strong> {(bitcoinBalance.native_bitcoin / 1e8).toFixed(8)} BTC
                  </div>
                  <div>
                    <strong>Wrapped:</strong> {(bitcoinBalance.wrapped_bitcoin / 1e8).toFixed(8)} BTC
                  </div>
                  <div>
                    <strong>Total:</strong> {(bitcoinBalance.total_bitcoin / 1e8).toFixed(8)} BTC
                  </div>
                </div>
              )}

              {result && (
                <div className={`result ${result.includes('Error') ? 'error' : 'success'}`}>
                  {result.includes('Error') && <AlertTriangle size={16} />}
                  {result}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiChainUnifiedVault;
