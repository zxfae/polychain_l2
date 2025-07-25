import React, { useState, useEffect } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import ChainSelector, { SUPPORTED_CHAINS } from './ChainSelector';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, Shield, Zap, AlertTriangle, 
  Link, Bitcoin, RefreshCw, ArrowDown, ArrowUp, Building2 
} from 'lucide-react';
import '../design-system.css';
import './multi-chain-vault.css';
import './bitcoin-vault.css';
import './unified-components.css';

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
  
  // Bitcoin Legacy specific states
  const [bitcoinBalance, setBitcoinBalance] = useState(null);

  const tabs = [
    { id: 'multichain', label: 'Multi-Chain Vault', icon: Building2 },
    { id: 'bitcoin-legacy', label: 'Bitcoin Legacy', icon: Bitcoin },
  ];

  useEffect(() => {
    if (activeTab === 'multichain') {
      loadBalances();
      loadMetrics();
    } else if (activeTab === 'bitcoin-legacy' && address.length > 2) {
      loadBitcoinBalance();
    }
  }, [selectedChain, address, activeTab]);

  const loadBalances = async () => {
    if (!address || activeTab !== 'multichain') return;
    
    try {
      let formattedBalances = [];

      if (selectedChain === 'Bitcoin') {
        const bitcoinBalance = await polychain_l2_backend.get_bitcoin_balance(address);
        formattedBalances = [{
          chain: 'Bitcoin',
          native_balance: bitcoinBalance.native_bitcoin / 100_000_000,
          wrapped_balance: bitcoinBalance.wrapped_bitcoin / 100_000_000,
          total_balance: bitcoinBalance.total_bitcoin / 100_000_000
        }];
      } else if (selectedChain === 'Ethereum') {
        const ethereumBalance = await polychain_l2_backend.get_ethereum_balance(address);
        formattedBalances = [{
          chain: 'Ethereum',
          native_balance: ethereumBalance.native_ethereum / 1_000_000_000_000_000_000,
          wrapped_balance: ethereumBalance.wrapped_ethereum / 1_000_000_000_000_000_000,
          total_balance: ethereumBalance.total_ethereum / 1_000_000_000_000_000_000
        }];
      } else if (selectedChain === 'Internet Computer') {
        const icpBalance = await polychain_l2_backend.get_icp_balance(address);
        formattedBalances = [{
          chain: 'Internet Computer',
          native_balance: icpBalance.native_icp / 100_000_000,
          wrapped_balance: icpBalance.wrapped_icp / 100_000_000,
          total_balance: icpBalance.total_icp / 100_000_000
        }];
      } else if (selectedChain === 'Solana') {
        const solanaBalance = await polychain_l2_backend.get_solana_balance(address);
        formattedBalances = [{
          chain: 'Solana',
          native_balance: solanaBalance.native_solana / 1_000_000_000,
          wrapped_balance: solanaBalance.wrapped_solana / 1_000_000_000,
          total_balance: solanaBalance.total_solana / 1_000_000_000
        }];
      } else {
        formattedBalances = [{
          chain: selectedChain,
          native_balance: 0,
          wrapped_balance: 0,
          total_balance: 0
        }];
      }
      
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
      } else if (selectedChain === 'Internet Computer') {
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
      } else if (selectedChain === 'Internet Computer') {
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

  // Bitcoin Legacy handlers
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
      setResult(response.Ok || `Error: ${response.Err || response}`);
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
      setResult(response.Ok || `Error: ${response.Err || response}`);
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
      <div className="vault-header">
        <h2 className="ds-heading-component">
          <Link size={20} />
          Polychain L2 Universal Multi-Chain Vault
        </h2>
        <div className="ds-badge">
          <Zap size={16} />
          70% Compression • All Chains
        </div>
      </div>

      {/* Tabs Navigation */}
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
                // Focus next tab
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

      {/* Multi-Chain Tab */}
      {activeTab === 'multichain' && (
        <div id="tabpanel-multichain" role="tabpanel" aria-labelledby="tab-multichain">
          <ChainSelector 
            selectedChain={selectedChain}
            onChainChange={setSelectedChain}
            showMetrics={true}
          />

          <div className="vault-grid ds-grid ds-grid-2">
            <div className="vault-actions ds-card-glass">
              <h3>
                <Wallet size={20} />
                {selectedChainInfo?.name} Operations
              </h3>
              
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
                  className="withdraw-btn ds-button ds-button-secondary"
                >
                  <ArrowUpCircle size={18} />
                  {loading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>

              {result && (
                <div className={`result ds-alert ${result.includes('Error') ? 'ds-alert-error' : 'ds-alert-success'}`}>
                  {result.includes('Error') && <AlertTriangle size={16} />}
                  {result}
                </div>
              )}
            </div>

            <div className="balance-panel ds-card-glass">
              <h3>
                <Wallet size={20} />
                Your Balances
              </h3>

              {selectedChainBalance && (
                <div className="current-balance" style={{ '--chain-color': selectedChainInfo?.color }}>
                  <div className="balance-header">
                    <selectedChainInfo.icon size={24} style={{ color: selectedChainInfo?.color }} />
                    <span>{selectedChainInfo?.name}</span>
                  </div>
                  <div className="balance-amounts">
                    <div className="balance-item">
                      <span>Native:</span>
                      <span>{formatAmount(selectedChainBalance.native_balance, selectedChain)}</span>
                    </div>
                    <div className="balance-item">
                      <span>Wrapped:</span>
                      <span>{formatAmount(selectedChainBalance.wrapped_balance, selectedChain)}</span>
                    </div>
                    <div className="balance-total">
                      <span>Total:</span>
                      <span>{formatAmount(selectedChainBalance.total_balance, selectedChain)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="all-balances">
                <h4>All Chain Balances:</h4>
                {balances.length > 0 ? (
                  <div className="balance-list">
                    {balances.map((balance, index) => {
                      const chainId = balance.chain;
                      const chainInfo = SUPPORTED_CHAINS.find(c => c.id === chainId);
                      const IconComponent = chainInfo?.icon || Wallet;
                      
                      return (
                        <div key={index} className="balance-row" style={{ '--i': index }}>
                          <div className="chain-info">
                            <IconComponent size={16} style={{ color: chainInfo?.color }} />
                            <span>{chainInfo?.token}</span>
                          </div>
                          <span className="balance-value">
                            {formatAmount(balance.total_balance, chainId)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-balances">Enter an address to view balances</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bitcoin Legacy Tab */}
      {activeTab === 'bitcoin-legacy' && (
        <div id="tabpanel-bitcoin-legacy" role="tabpanel" aria-labelledby="tab-bitcoin-legacy" className="vault-card">
          <h3>Bitcoin Vault - Layer 2 Hybrid System</h3>
          <p className="description">
            Advanced Bitcoin Layer 2 solution with quantum-resistant cryptography.
            Deposits above 100,000 sats are stored as native Bitcoin, lower amounts as wrapped tokens.
          </p>

          <div className="form-group">
            <label htmlFor="address">Bitcoin Address</label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. alice, bob, 1A1zP1..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (BTC)</label>
            <input
              id="amount"
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00001234"
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={quantumSecure}
                onChange={(e) => setQuantumSecure(e.target.checked)}
              />
              Use quantum-resistant cryptography (Falcon512)
            </label>
          </div>

          <div className="button-row">
            <button onClick={handleBitcoinDeposit} disabled={loading}>
              <ArrowDown size={16} /> {loading ? 'Processing...' : 'Deposit'}
            </button>
            <button className="danger" onClick={handleBitcoinWithdraw} disabled={loading}>
              <ArrowUp size={16} /> {loading ? 'Processing...' : 'Withdraw'}
            </button>
            <button className="secondary" onClick={loadBitcoinBalance} disabled={!address}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {bitcoinBalance && (
            <div className="balance">
              <h4>Balance</h4>
              <div><strong>Native:</strong> {(bitcoinBalance.native_bitcoin / 1e8).toFixed(8)} BTC</div>
              <div><strong>Wrapped:</strong> {(bitcoinBalance.wrapped_bitcoin / 1e8).toFixed(8)} BTC</div>
              <div><strong>Total:</strong> {(bitcoinBalance.total_bitcoin / 1e8).toFixed(8)} BTC</div>
            </div>
          )}

          {result && (
            <div className={`result ${result.includes('Error') ? 'error' : 'success'}`}>
              {result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MultiChainUnifiedVault;
