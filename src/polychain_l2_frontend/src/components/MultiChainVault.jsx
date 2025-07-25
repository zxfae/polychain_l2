import React, { useState, useEffect } from 'react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import ChainSelector, { SUPPORTED_CHAINS } from './ChainSelector';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Shield, Zap, AlertTriangle, Link } from 'lucide-react';
import '../design-system.css';
import './multi-chain-vault.css';

function MultiChainVault() {
  const [selectedChain, setSelectedChain] = useState('Bitcoin');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [quantumSecure, setQuantumSecure] = useState(true);
  const [balances, setBalances] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadBalances();
    loadMetrics();
  }, [selectedChain, address]);

  const loadBalances = async () => {
    if (!address) return;
    
    try {
      let formattedBalances = [];

      if (selectedChain === 'Bitcoin') {
        const bitcoinBalance = await polychain_l2_backend.get_bitcoin_balance(address);
        formattedBalances = [{
          chain: 'Bitcoin',
          native_balance: bitcoinBalance.native_bitcoin / 100_000_000, // Convertir satoshi en BTC
          wrapped_balance: bitcoinBalance.wrapped_bitcoin / 100_000_000,
          total_balance: bitcoinBalance.total_bitcoin / 100_000_000
        }];
      } else if (selectedChain === 'Ethereum') {
        const ethereumBalance = await polychain_l2_backend.get_ethereum_balance(address);
        formattedBalances = [{
          chain: 'Ethereum',
          native_balance: ethereumBalance.native_ethereum / 1_000_000_000_000_000_000, // Convertir wei en ETH
          wrapped_balance: ethereumBalance.wrapped_ethereum / 1_000_000_000_000_000_000,
          total_balance: ethereumBalance.total_ethereum / 1_000_000_000_000_000_000
        }];
      } else if (selectedChain === 'Internet Computer') {
        const icpBalance = await polychain_l2_backend.get_icp_balance(address);
        formattedBalances = [{
          chain: 'Internet Computer',
          native_balance: icpBalance.native_icp / 100_000_000, // Convertir e8s en ICP
          wrapped_balance: icpBalance.wrapped_icp / 100_000_000,
          total_balance: icpBalance.total_icp / 100_000_000
        }];
      } else if (selectedChain === 'Solana') {
        const solanaBalance = await polychain_l2_backend.get_solana_balance(address);
        formattedBalances = [{
          chain: 'Solana',
          native_balance: solanaBalance.native_solana / 1_000_000_000, // Convertir lamports en SOL
          wrapped_balance: solanaBalance.wrapped_solana / 1_000_000_000,
          total_balance: solanaBalance.total_solana / 1_000_000_000
        }];
      } else {
        // Pour les autres chaînes, simuler des balances nulles
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

  const handleDeposit = async () => {
    if (!address || !amount) {
      setResult('Please fill in address and amount');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const numAmount = parseFloat(amount);
      let response;
      
      // Utiliser les fonctions spécifiques selon la chaîne
      if (selectedChain === 'Bitcoin') {
        // Convertir en satoshi (1 BTC = 100,000,000 satoshi)
        const satoshiAmount = Math.round(numAmount * 100_000_000);
        response = await polychain_l2_backend.deposit_bitcoin(address, satoshiAmount);
      } else if (selectedChain === 'Ethereum') {
        // Convertir en wei (1 ETH = 10^18 wei)
        const weiAmount = BigInt(Math.round(numAmount * 1_000_000_000_000_000_000));
        response = await polychain_l2_backend.deposit_ethereum(address, Number(weiAmount));
      } else if (selectedChain === 'Internet Computer') {
        // Convertir en e8s (1 ICP = 10^8 e8s)
        const e8sAmount = Math.round(numAmount * 100_000_000);
        response = await polychain_l2_backend.deposit_icp(address, e8sAmount);
      } else if (selectedChain === 'Solana') {
        // Convertir en lamports (1 SOL = 10^9 lamports)
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

  const handleWithdraw = async () => {
    if (!address || !amount) {
      setResult('Please fill in address and amount');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const numAmount = parseFloat(amount);
      let response;
      
      // Utiliser les fonctions spécifiques selon la chaîne
      if (selectedChain === 'Bitcoin') {
        // Convertir en satoshi (1 BTC = 100,000,000 satoshi)
        const satoshiAmount = Math.round(numAmount * 100_000_000);
        
        if (quantumSecure) {
          response = await polychain_l2_backend.withdraw_bitcoin_adaptive(
            address,
            satoshiAmount,
            true, // auto_select_crypto
            75 // quantum_threat_level
          );
        } else {
          response = await polychain_l2_backend.withdraw_bitcoin(
            address,
            satoshiAmount,
            false // quantum_secure
          );
        }
      } else if (selectedChain === 'Ethereum') {
        // Convertir en wei (1 ETH = 10^18 wei)
        const weiAmount = BigInt(Math.round(numAmount * 1_000_000_000_000_000_000));
        response = await polychain_l2_backend.withdraw_ethereum(address, Number(weiAmount), quantumSecure);
      } else if (selectedChain === 'Internet Computer') {
        // Convertir en e8s (1 ICP = 10^8 e8s)
        const e8sAmount = Math.round(numAmount * 100_000_000);
        response = await polychain_l2_backend.withdraw_icp(address, e8sAmount, quantumSecure);
      } else if (selectedChain === 'Solana') {
        // Convertir en lamports (1 SOL = 10^9 lamports)
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

  const selectedChainInfo = SUPPORTED_CHAINS.find(c => c.id === selectedChain);
  const selectedChainBalance = balances.find(b => 
    b.chain === selectedChain
  );

  return (
    <div className="multi-chain-vault ds-card">
      <div className="vault-header">
        <h2>
          <Link size={20} />
          Polychain L2 Universal Multi-Chain Vault
        </h2>
        <div className="compression-badge ds-badge">
          <Zap size={16} />
          70% Compression • All Chains
        </div>
      </div>

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
            <label>Wallet Address:</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter ${selectedChainInfo?.name} address...`}
              className="address-input ds-input"
            />
          </div>

          <div className="ds-form-group">
            <label>Amount ({selectedChainInfo?.token}):</label>
            <input
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`0.00000000 ${selectedChainInfo?.token}`}
              className="amount-input ds-input"
            />
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
              onClick={handleDeposit}
              disabled={loading}
              className="deposit-btn ds-button"
            >
              <ArrowDownCircle size={18} />
              {loading ? 'Processing...' : 'Deposit'}
            </button>

            <button 
              onClick={handleWithdraw}
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
  );
}

export default MultiChainVault;
