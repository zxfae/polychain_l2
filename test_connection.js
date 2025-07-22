import { polychain_l2_backend } from './src/declarations/polychain_l2_backend/index.js';

async function testConnection() {
  console.log('Testing connection to backend...');
  
  try {
    const result = await polychain_l2_backend.greet("Connection Test");
    console.log('✅ Success:', result);
    
    // Test another function
    const metrics = await polychain_l2_backend.get_performance_metrics();
    console.log('✅ Metrics:', metrics);
    
  } catch (error) {
    console.error('❌ Connection Error:', error);
  }
}

testConnection();