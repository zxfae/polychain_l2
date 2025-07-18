import { useState } from 'react';
import { polychain_l2_backend } from '../declarations/polychain_l2_backend';

function TransactionManager() {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [blockPreviousHash, setBlockPreviousHash] = useState('genesis_block_hash');

  const createTransaction = async () => {
    if (!sender || !recipient || !amount) {
      setResult('Please fill in all transaction fields');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const response = await polychain_l2_backend.create_transaction(
        sender,
        recipient,
        parseFloat(amount)
      );

      if (response.Ok) {
        const newTransaction = {
          id: Date.now(),
          sender,
          recipient,
          amount: parseFloat(amount),
          timestamp: new Date().toISOString(),
          status: 'pending'
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setResult(`Transaction created successfully: ${response.Ok}`);
        
        // Clear form
        setSender('');
        setRecipient('');
        setAmount('');
      } else {
        setResult(`Error: ${response.Err}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const createBlock = async () => {
    if (transactions.length === 0) {
      setResult('No transactions available to create a block');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      // Convert transactions to the format expected by the backend
      const blockTransactions = transactions.map(tx => ({
        sender: tx.sender,
        recipient: tx.recipient,
        amount: tx.amount,
        timestamp: tx.timestamp,
        signature: '',
        is_signed: false
      }));

      const response = await polychain_l2_backend.create_block(
        blockTransactions,
        blockPreviousHash
      );

      if (response.Ok) {
        setResult(`Block created successfully: ${response.Ok}`);
        // Update transactions status
        setTransactions(prev => prev.map(tx => ({ ...tx, status: 'confirmed' })));
        // Update previous hash for next block
        const hashMatch = response.Ok.match(/hash: (\w+)/);
        if (hashMatch) {
          setBlockPreviousHash(hashMatch[1]);
        }
      } else {
        setResult(`Error: ${response.Err}`);
      }
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTransactions = () => {
    setTransactions([]);
    setResult('Transaction pool cleared');
  };

  const getBalance = async () => {
    if (!sender && !recipient) {
      setResult('Please enter an address to check balance');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const address = sender || recipient;
      const balance = await polychain_l2_backend.get_balance(address);
      setResult(`Balance for ${address}: ${balance} tokens`);
    } catch (error) {
      setResult(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Transaction Manager</h2>
        <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '2rem' }}>
          Create transactions and blocks on Polychain L2. Build and manage your blockchain operations.
        </p>

        <div className="grid">
          <div>
            <h3>Create Transaction</h3>
            <div className="form-group">
              <label htmlFor="sender">Sender Address:</label>
              <input
                id="sender"
                type="text"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                placeholder="Enter sender address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="recipient">Recipient Address:</label>
              <input
                id="recipient"
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>

            <button 
              className="button" 
              onClick={createTransaction}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Transaction'}
            </button>

            <button 
              className="button secondary" 
              onClick={getBalance}
              disabled={loading}
            >
              Check Balance
            </button>
          </div>

          <div>
            <h3>Block Operations</h3>
            <div className="form-group">
              <label htmlFor="previousHash">Previous Block Hash:</label>
              <input
                id="previousHash"
                type="text"
                value={blockPreviousHash}
                onChange={(e) => setBlockPreviousHash(e.target.value)}
                placeholder="Previous block hash"
              />
            </div>

            <button 
              className="button" 
              onClick={createBlock}
              disabled={loading || transactions.length === 0}
            >
              {loading ? 'Creating...' : 'Create Block'}
            </button>

            <button 
              className="button danger" 
              onClick={clearTransactions}
              disabled={transactions.length === 0}
            >
              Clear Transaction Pool
            </button>

            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
              <strong>Transaction Pool: {transactions.length} pending</strong>
            </div>
          </div>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="card">
          <h3>Transaction Pool</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', color: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Sender</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Recipient</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: '0.5rem' }}>#{tx.id}</td>
                    <td style={{ padding: '0.5rem' }}>{tx.sender}</td>
                    <td style={{ padding: '0.5rem' }}>{tx.recipient}</td>
                    <td style={{ padding: '0.5rem' }}>{tx.amount}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <span style={{ 
                        color: tx.status === 'confirmed' ? '#4ade80' : '#fbbf24',
                        fontWeight: 'bold'
                      }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem' }}>
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default TransactionManager;