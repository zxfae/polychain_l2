# PolyChain Layer 2 on ICP

**The first post-quantum Layer 2 blockchain on Internet Computer Protocol (ICP)**

## 🎯 Project Vision

PolyChain L2 combines post-quantum cryptographic innovation with ICP's decentralized infrastructure to create a revolutionary Layer 2 blockchain. Our solution provides:

- **Post-Quantum Security**: Native support for ECDSA, Falcon, and ML-DSA
- **Hybrid Consensus**: Proof of Work + Proof of Stake (Algorand-style)
- **Bitcoin Integration**: Native cross-chain DeFi via ICP
- **Web Performance**: Web-speed with blockchain security

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│          INTERNET COMPUTER          │
│  ┌─────────────┐  ┌─────────────┐   │
│  │    MAIN     │  │  CONSENSUS  │   │
│  │  CANISTER   │  │  CANISTER   │   │
│  └─────────────┘  └─────────────┘   │
│  ┌─────────────┐  ┌─────────────┐   │
│  │   CRYPTO    │  │   BRIDGE    │   │
│  │  CANISTER   │  │  CANISTER   │   │
│  └─────────────┘  └─────────────┘   │
└─────────────────────────────────────┘
```

### 🔐 Cryptography Layer

**Multi-Algorithm Support:**
- **ECDSA**: Classical elliptic curve signatures (secp256k1)
- **Schnorr**: Compact signatures for Bitcoin compatibility
- **Falcon (Post-Quantum)**: FIPS 205 SLH-DSA-SHA2-128f (128-bit security)
- **ML-DSA (Post-Quantum)**: FIPS 204 ML-DSA-44 (128-bit security)

**Performance Characteristics:**
- **Classical algorithms**: ~1-5ms per operation
- **Post-quantum algorithms**: ~10-50ms per operation
- **Memory efficiency**: Optimized for WASM deployment
- **Blockchain integration**: Multi-signature transaction support

## 🚀 Development Setup

### Prerequisites

1. **Rust** (stable version)
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown
```

2. **Node.js** (version 18+)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **DFX** (ICP SDK)
```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

### Project Installation

```bash
# Clone the repository
git clone https://github.com/zxfae/polychain_l2
cd polychain_l2

# Install frontend dependencies
npm install

# Start local ICP network
dfx start --background

# Create canisters
dfx canister create --all

# Deploy
dfx deploy
```

### Installation Verification

```bash
# Test backend
dfx canister call polychain_l2_backend greet '("PolyChain")'

# Expected result: ("Hello, PolyChain!")
```

## 🧪 Local Development

### Project Structure

```
polychain_l2/
├── src/
│   ├── polychain_l2_backend/     # Rust Logic (main code)
│   │   ├── src/lib.rs           # API functions
│   │   └── Cargo.toml           # Rust dependencies
│   └── polychain_l2_frontend/    # React Interface
│       ├── src/
│       └── package.json
├── dfx.json                     # ICP Configuration
└── README.md
```

### Development Workflow

1. **Modify backend code:**
```bash
# Edit functions
nano src/polychain_l2_backend/src/lib.rs
```

2. **Redeploy:**
```bash
dfx deploy polychain_l2_backend
```

3. **Test:**
```bash
dfx canister call polychain_l2_backend your_function '("param")'
```

### Local URLs

After `dfx deploy`, access:

- **Frontend**: http://[canister-id].localhost:4943/
- **Backend Candid UI**: http://127.0.0.1:4943/?canisterId=[candid-ui-id]&id=[backend-id]
- **Internet Identity**: http://[ii-canister-id].localhost:4943/

## 📋 Current Features

### ✅ Implemented
- [x] ICP multi-canister infrastructure
- [x] Bitcoin integration (regtest)
- [x] Internet Identity authentication
- [x] Basic PolyTransaction structures
- [x] **Comprehensive Cryptography Test Suite**
  - [x] ECDSA, Schnorr, Falcon (Post-Quantum), ML-DSA (Post-Quantum)
  - [x] **Performance Benchmarking** (10-iteration timing comparisons)
  - [x] Security validation and invalid signature rejection
  - [x] Blockchain integration testing

### 🚧 In Development
- [ ] Complete PolyChain logic migration
- [ ] Stable storage for blockchain state
- [ ] Multi-signature (ECDSA + Post-Quantum)
- [ ] Hybrid PoW/PoS consensus
- [ ] React user interface

### 🎯 WCHL Roadmap (4 weeks)

**Week 1 (July 1-7):**
- [x] Infrastructure setup
- [ ] Core structures migrated
- [ ] Basic transaction API
- [ ] Minimal stable storage

**Week 2 (July 8-14):**
- [ ] Multi-signature working
- [ ] Consensus logic adapted
- [ ] Advanced Bitcoin integration
- [ ] Performance testing

**Week 3 (July 15-21):**
- [ ] Multi-canister communication
- [ ] Frontend interface
- [ ] Mainnet deployment
- [ ] Complete documentation

**Week 4 (July 22-26):**
- [ ] Demo video
- [ ] Pitch deck
- [ ] WCHL submission
- [ ] Final testing

## 🔧 Useful Commands

### Canister Management

```bash
# Check canister status
dfx canister status --all

# Stop canisters
dfx canister stop --all

# Restart local network
dfx start --clean --background

# View canister logs
dfx canister logs polychain_l2_backend
```

### Development

```bash
# Build without deploy
dfx build

# Deploy single canister
dfx deploy polychain_l2_backend

# Upgrade a canister
dfx canister install --mode upgrade polychain_l2_backend
```

### Testing

```bash
# Standard Rust tests
cargo test

# ICP-specific tests
dfx test
```

### Cryptography Testing

```bash
# Run all cryptography tests
cargo test cryptography

# Performance benchmarking (recommended)
cargo test --release performance

# Specific performance comparison test
cargo test test_cryptography_performance_comparison --release

# Individual algorithm tests
cargo test ecdsa
cargo test schnorr
cargo test falcon
cargo test mldsa

# Debug mode with detailed output
RUST_LOG=debug cargo test cryptography -- --nocapture
```

#### 🔐 Cryptography Performance Tests

Our comprehensive cryptography test suite includes performance benchmarking for all supported algorithms:

```bash
# Run performance comparison tests
cargo test test_cryptography_performance_comparison --release

# Run all cryptography tests with timing
cargo test cryptography --release -- --nocapture

# Performance test results include:
# - ECDSA: Key generation + signing + verification timing
# - Schnorr: Compact signature performance
# - Falcon (Post-Quantum): FIPS 205 SLH-DSA-SHA2-128f performance
# - ML-DSA (Post-Quantum): FIPS 204 ML-DSA-44 performance
```

**Performance Test Features:**
- **10-iteration benchmarks** for statistical accuracy
- **Comparative timing analysis** between classical and post-quantum algorithms
- **Memory efficiency testing** (key and signature sizes)
- **Blockchain integration performance** testing
- **Security validation** with invalid signature rejection tests

## 🛠️ Troubleshooting

### Common Errors

**"Can't find crate for core":**
```bash
rustup target add wasm32-unknown-unknown
```

**"Cannot find canister id":**
```bash
dfx canister create --all
dfx deploy
```

**"Serde not found":**
Add to `src/polychain_l2_backend/Cargo.toml`:
```toml
[dependencies]
serde = { version = "1.0", features = ["derive"] }
```

### Complete Reset

```bash
dfx stop
dfx start --clean --background
dfx canister create --all
dfx deploy
```

## 👥 Team & Contribution

### Roles
- **Architecture & Crypto**: Philippe Lecrosnier aka ZxFae33
- **ICP Development**: See contributors
- **Frontend & UX**: See contributors
- **DevOps & Documentation**: See contributors

### Contribution Guidelines

1. **Feature branches**: `git checkout -b feature/new-function`
2. **Testing**: Verify `dfx deploy` works
3. **Documentation**: Update this README
4. **Pull Requests**: Review required

## 🏆 WCHL 2025

**Track**: Fully On-Chain - Pure Decentralization

**Differentiators:**
- First post-quantum L2 on ICP
- Unique hybrid consensus
- Bitcoin DeFi integration
- Proven modular architecture

**Critical Timeline:**
- **Final Submission**: July 26, 2025
- **Demo Video**: Max 10 minutes
- **Mainnet Deploy**: Required

## 📚 Resources

- [ICP Documentation](https://docs.dfinity.org/)
- [Candid Reference](https://github.com/dfinity/candid)
- [IC SDK (DFX)](https://github.com/dfinity/sdk)
- [WCHL Discord](https://discord.gg/wchl2025)

## 🚨 Support

For technical issues:
1. Check **Troubleshooting** above
2. Post in team channel
3. Consult [ICP Developer Discord](https://discord.gg/cA7y6ezyE2)

---

**Let's build the future of post-quantum blockchain! 🚀**
