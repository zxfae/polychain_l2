#!/usr/bin/env node

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function testFunction(name, command) {
    console.log(`\n🧪 Testing ${name}...`);
    try {
        const { stdout } = await execAsync(command);
        console.log(`✅ ${name} - SUCCESS`);
        return true;
    } catch (error) {
        console.log(`❌ ${name} - FAILED: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 Testing all Polychain L2 functions...\n');
    
    const tests = [
        {
            name: 'Bitcoin Deposit',
            command: `dfx canister call polychain_l2_backend deposit_bitcoin '("test_user", 50000)'`
        },
        {
            name: 'Bitcoin Balance Check',
            command: `dfx canister call polychain_l2_backend get_bitcoin_balance '("test_user")'`
        },
        {
            name: 'Bitcoin Withdrawal', 
            command: `dfx canister call polychain_l2_backend withdraw_bitcoin '("test_user", 25000, false)'`
        },
        {
            name: 'Crypto Recommendation',
            command: `dfx canister call polychain_l2_backend get_crypto_recommendation '(100000.0, opt 60, opt true)'`
        },
        {
            name: 'Performance Metrics',
            command: `dfx canister call polychain_l2_backend get_performance_metrics`
        },
        {
            name: 'Advanced Metrics',
            command: `dfx canister call polychain_l2_backend get_layer2_advanced_metrics`
        },
        {
            name: 'Vault Statistics',
            command: `dfx canister call polychain_l2_backend get_vault_statistics`
        },
        {
            name: 'Compression Performance',
            command: `dfx canister call polychain_l2_backend get_compression_performance_metrics`
        },
        {
            name: 'API Performance Info',
            command: `dfx canister call polychain_l2_backend get_api_performance_info`
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const success = await testFunction(test.name, test.command);
        if (success) {
            passed++;
        } else {
            failed++;
        }
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📊 Test Results:`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log(`\n🎉 All tests passed! The application is ready for use.`);
        console.log(`🌐 Frontend URL: http://uzt4z-lp777-77774-qaabq-cai.localhost:4943/`);
    } else {
        console.log(`\n⚠️  Some tests failed. Please check the errors above.`);
    }
}

runAllTests().catch(console.error);