import { useState, useEffect } from 'react';
import { polychain_l2_backend } from '../declarations/polychain_l2_backend';

function BitcoinVault() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [quantumSecure, setQuantumSecure] = useState(false);

  const handleDeposit = async () => {
    if (!address || !amount) {
      setResult('Please enter both address and amount');
      return;
    }

    if (!polychain_l2_backend) {
      setResult('Error: Backend not initialized');
      return;
    }

    setLoading(true);
    setResult('');
    
    try {
      const amountSatoshi = Math.floor(parseFloat(amount) * 100000000);
      const response = await polychain_l2_backend.deposit_bitcoin(address, amountSatoshi);
      setResult(response.Ok || response);
      loadBalance();
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!address || !amount) {
      setResult('Please enter both address and amount');
      return;
    }

    if (!polychain_l2_backend) {
      setResult('Error: Backend not initialized');
      return;
    }

    setLoading(true);
    setResult('');
    
    try {
      const amountSatoshi = Math.floor(parseFloat(amount) * 100000000);
      const response = await polychain_l2_backend.withdraw_bitcoin(address, amountSatoshi, quantumSecure);
      setResult(response.Ok || response);
      loadBalance();
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    if (!address) return;
    
    try {
      if (!polychain_l2_backend) {
        console.error('Backend not initialized');
        return;
      }
      const balanceData = await polychain_l2_backend.get_bitcoin_balance(address);
      setBalance(balanceData);
    } catch (error) {
      console.error('Failed to load balance:', error);
      setBalance(null);
    }
  };

  useEffect(() => {
    if (address && address.length > 2) {
      const timer = setTimeout(() => {
        loadBalance();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setBalance(null);
    }
  }, [address]);

  if (!polychain_l2_backend) {
    return (
      <div className="card">
        <h2>Bitcoin Vault - Layer 2 Hybrid System</h2>
        <div className="loading">
          Initializing backend connection...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Bitcoin Vault - Layer 2 Hybrid System</h2>
      <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
        Advanced Bitcoin Layer 2 solution with quantum-resistant cryptography. 
        Deposits above 100,000 sats are stored as native Bitcoin, smaller amounts as wrapped tokens.
      </p>

      <div className="form-group">
        <label htmlFor="address">Bitcoin Address:</label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter Bitcoin address (e.g., alice, bob, charlie)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="amount">Amount (BTC):</label>
        <input
          id="amount"
          type="number"
          step="0.00000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in BTC"
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={quantumSecure}
            onChange={(e) => setQuantumSecure(e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          Use Quantum-Resistant Cryptography (Falcon512)
        </label>
      </div>

      <div>
        <button 
          className="button" 
          onClick={handleDeposit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Deposit Bitcoin'}
        </button>
        <button 
          className="button danger" 
          onClick={handleWithdraw}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Withdraw Bitcoin'}
        </button>
        <button 
          className="button secondary" 
          onClick={loadBalance}
          disabled={!address}
        >
          Refresh Balance
        </button>
      </div>

      {balance && (
        <div className="balance-display">
          <h4>Balance for {address}</h4>
          <div className="balance-item">
            <span>Native Bitcoin:</span>
            <span className="amount">{(Number(balance.native_bitcoin) / 100000000).toFixed(8)} BTC</span>
          </div>
          <div className="balance-item">
            <span>Wrapped Bitcoin:</span>
            <span className="amount">{(Number(balance.wrapped_bitcoin) / 100000000).toFixed(8)} BTC</span>
          </div>
          <div className="balance-item">
            <span>Total Bitcoin:</span>
            <span className="amount">{(Number(balance.total_bitcoin) / 100000000).toFixed(8)} BTC</span>
          </div>
        </div>
      )}

      {result && (
        <div className={`result ${result.includes('Error') ? 'error' : 'success'}`}>
          {result}
        </div>
      )}
    </div>
  );
}

export default BitcoinVault;