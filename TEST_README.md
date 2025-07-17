# PolyChain Layer 2 - Testing Guide

This guide provides comprehensive instructions for running tests in the PolyChain Layer 2 project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Test Categories](#test-categories)
- [Running Tests](#running-tests)
- [Test Scripts](#test-scripts)
- [Code Quality Checks](#code-quality-checks)
- [Continuous Integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running tests, ensure you have the following installed:

### Required Tools
- **Rust** (stable version): `rustup install stable && rustup default stable`
- **Node.js** (version 18+): Required for frontend tests
- **DFX** (ICP SDK): Required for canister tests
- **npm** (version 7+): For frontend dependency management

### Development Dependencies
```bash
# Install Rust development tools
rustup target add wasm32-unknown-unknown
cargo install cargo-audit cargo-machete

# Install Node.js dependencies
npm install

# Verify installations
dfx --version
cargo --version
node --version
npm --version
```

## Quick Start

### Run All Tests (Recommended)
```bash
# Quick test run (fastest)
./scripts/test-quick.sh

# Full test suite with quality checks
./scripts/check-quality.sh
```

### Run Specific Test Categories
```bash
# Backend tests only
./scripts/test-quick.sh --rust-only

# Frontend tests only  
./scripts/test-quick.sh --frontend-only

# DFX deployment tests only
./scripts/test-quick.sh --dfx-only

# Skip DFX tests (for faster development)
./scripts/test-quick.sh --skip-dfx
```

## Test Categories

### 1. Backend Tests (Rust)
- **Unit Tests**: Individual function/module testing
- **Integration Tests**: Component interaction testing
- **Cryptography Tests**: Post-quantum crypto functionality
- **Canister Tests**: ICP-specific functionality

### 2. Frontend Tests (React/TypeScript)
- **Type Checking**: TypeScript compilation
- **Build Tests**: Vite build verification
- **Integration Tests**: Component interaction (when implemented)

### 3. DFX Tests (ICP Deployment)
- **Deployment Check**: Canister deployment verification
- **Candid Interface**: API contract validation
- **Network Tests**: ICP network connectivity

### 4. Quality Assurance
- **Code Formatting**: Rust fmt, Prettier
- **Linting**: Clippy, ESLint
- **Security Audits**: Dependency vulnerability scanning

## Running Tests

### Backend Tests (Rust)

```bash
# Run all backend tests
cargo test

# Run specific test module
cargo test cryptography

# Run with verbose output
cargo test -- --nocapture

# Run tests in specific package
cargo test --package polychain_l2_backend

# Performance tests
cargo test --release
```

### Frontend Tests (React/TypeScript)

```bash
# Type checking
npm run lint --workspace=src/polychain_l2_frontend

# Build test
npm run build --workspace=src/polychain_l2_frontend

# Run all frontend tests
npm test --workspace=src/polychain_l2_frontend

# Format code
npm run format --workspace=src/polychain_l2_frontend
```

### DFX Tests (ICP Deployment)

```bash
# Start local ICP network
dfx start --background --clean

# Deploy all canisters
dfx deploy

# Run canister tests
dfx canister call polychain_l2_backend greet '("Test")'

# Check deployment status
dfx canister status --all

# Stop network
dfx stop
```

## Test Scripts

### `./scripts/test-quick.sh`
Fast development testing script with multiple options:

```bash
# Usage examples
./scripts/test-quick.sh                # Run all tests
./scripts/test-quick.sh --rust-only    # Backend only
./scripts/test-quick.sh --frontend-only # Frontend only  
./scripts/test-quick.sh --dfx-only     # DFX only
./scripts/test-quick.sh --skip-dfx     # Skip DFX tests
./scripts/test-quick.sh --help         # Show help
```

**Features:**
- Color-coded output
- Elapsed time tracking
- Individual test category results
- Fast execution optimized for development

### `./scripts/check-quality.sh`
Comprehensive code quality and security checking:

```bash
# Usage examples
./scripts/check-quality.sh                # Full quality check
./scripts/check-quality.sh --rust-only    # Rust quality only
./scripts/check-quality.sh --frontend-only # Frontend quality only
./scripts/check-quality.sh --security-only # Security audit only
./scripts/check-quality.sh --skip-security # Skip security checks
./scripts/check-quality.sh --fix          # Auto-fix issues
./scripts/check-quality.sh --help         # Show help
```

**Quality Checks:**
- Rust formatting (`cargo fmt`)
- Rust linting (`cargo clippy`)
- TypeScript compilation
- Dependency vulnerability scanning
- Secret scanning
- File structure validation

## Code Quality Checks

### Rust Quality
```bash
# Format code
cargo fmt --all

# Check formatting
cargo fmt --all -- --check

# Run clippy linter
cargo clippy --all-targets --all-features -- -D warnings

# Check for unused dependencies
cargo machete

# Security audit
cargo audit
```

### Frontend Quality
```bash
# Type checking
npm run lint --workspace=src/polychain_l2_frontend

# Format code
npm run format --workspace=src/polychain_l2_frontend

# Build verification
npm run build --workspace=src/polychain_l2_frontend
```

### Security Checks
```bash
# NPM vulnerability audit
npm audit --audit-level=moderate

# Rust dependency audit
cargo audit

# Manual secret scanning
grep -r -i "password\|secret\|key\|token" src/
```

## Continuous Integration

### Pre-commit Checks
Before committing code, run:
```bash
./scripts/check-quality.sh --fix
./scripts/test-quick.sh
```

### GitHub Actions Integration
The project uses automated testing in CI/CD:
- All tests run on push/PR
- Quality checks enforced
- Security scanning included
- Multi-platform testing

## Troubleshooting

### Common Issues

#### "Cannot find canister id"
```bash
dfx canister create --all
dfx deploy
```

#### "Rust check failed"
```bash
cargo clean
cargo check
```

#### "Frontend build failed"
```bash
rm -rf node_modules
npm install
npm run build --workspace=src/polychain_l2_frontend
```

#### "DFX not running"
```bash
dfx stop
dfx start --background --clean
```

### Performance Issues

#### Slow Tests
```bash
# Run only essential tests
./scripts/test-quick.sh --skip-dfx

# Use release mode for performance tests
cargo test --release
```

#### Memory Issues
```bash
# Clean build artifacts
cargo clean
rm -rf target/
rm -rf node_modules/

# Restart with clean state
dfx start --clean --background
```

### Environment Issues

#### Missing Dependencies
```bash
# Check Rust installation
rustup show

# Check Node.js version
node --version

# Check DFX status
dfx --version
```

#### Network Issues
```bash
# Reset local network
dfx stop
dfx start --clean --background

# Check connectivity
dfx ping
```

## Test Coverage

### Backend Coverage
```bash
# Install coverage tools
cargo install cargo-tarpaulin

# Generate coverage report
cargo tarpaulin --out html --output-dir coverage/
```

### Frontend Coverage
```bash
# Coverage tools (when implemented)
npm run test:coverage --workspace=src/polychain_l2_frontend
```

## Performance Testing

### Load Testing
```bash
# Backend performance tests
cargo test --release performance

# Canister performance
dfx canister call polychain_l2_backend benchmark_function
```

### Memory Testing
```bash
# Memory usage analysis
cargo test --release -- --test-threads=1
```

## Integration Testing

### End-to-End Tests
```bash
# Full integration test
./scripts/test-quick.sh
./scripts/check-quality.sh
```

### Cross-Platform Testing
```bash
# Test on different targets
cargo test --target wasm32-unknown-unknown
```

## Development Workflow

### Recommended Testing Flow
1. **Before coding**: `./scripts/test-quick.sh` (verify baseline)
2. **During development**: `cargo test` (focused testing)
3. **Before commit**: `./scripts/check-quality.sh --fix` (quality check)
4. **Final verification**: `./scripts/test-quick.sh` (full test)

### Debug Mode
```bash
# Enable debug logging
RUST_LOG=debug cargo test

# Debug specific test
cargo test test_name -- --nocapture
```

---

## Getting Help

- **Script Help**: `./scripts/test-quick.sh --help`
- **Quality Help**: `./scripts/check-quality.sh --help`
- **ICP Documentation**: https://docs.dfinity.org/
- **Project Issues**: Check existing README.md

**Happy Testing! 🧪**
