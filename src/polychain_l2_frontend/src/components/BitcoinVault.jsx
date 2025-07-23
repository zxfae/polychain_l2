// BitcoinVault.jsx
import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { polychain_l2_backend } from 'declarations/polychain_l2_backend';
import './bitcoin-vault.css';

function BitcoinVault() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [quantumSecure, setQuantumSecure] = useState(false);

  const handleDeposit = async () => {
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
      loadBalance();
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
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
      const data = await polychain_l2_backend.get_bitcoin_balance(address);
      setBalance({
        native_bitcoin: Number(data.native_bitcoin || 0),
        wrapped_bitcoin: Number(data.wrapped_bitcoin || 0),
        total_bitcoin: Number(data.total_bitcoin || 0)
      });
    } catch (error) {
      console.error('Failed to load balance:', error);
      setBalance(null);
    }
  };

  useEffect(() => {
    if (address.length > 2) {
      const timer = setTimeout(loadBalance, 500);
      return () => clearTimeout(timer);
    } else {
      setBalance(null);
    }
  }, [address]);

  if (!polychain_l2_backend) {
    return (
      <div className="vault-card">
        <h2>Bitcoin Vault - Layer 2 Hybrid System</h2>
        <div className="loading shimmer">Initializing backend connection...</div>
      </div>
    );
  }

  return (
    <div className="vault-card">
      <h2>Bitcoin Vault - Layer 2 Hybrid System</h2>
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
        <button onClick={handleDeposit} disabled={loading}>
          <ArrowDown size={16} /> {loading ? 'Processing...' : 'Deposit'}
        </button>
        <button className="danger" onClick={handleWithdraw} disabled={loading}>
          <ArrowUp size={16} /> {loading ? 'Processing...' : 'Withdraw'}
        </button>
        <button className="secondary" onClick={loadBalance} disabled={!address}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {balance && (
        <div className="balance">
          <h4>Balance</h4>
          <div><strong>Native:</strong> {(balance.native_bitcoin / 1e8).toFixed(8)} BTC</div>
          <div><strong>Wrapped:</strong> {(balance.wrapped_bitcoin / 1e8).toFixed(8)} BTC</div>
          <div><strong>Total:</strong> {(balance.total_bitcoin / 1e8).toFixed(8)} BTC</div>
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

