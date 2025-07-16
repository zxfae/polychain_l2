#!/bin/bash

# PolyChain Layer 2 - Development Setup Script
# This script sets up the development environment for new team members

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check system requirements
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d 'v' -f 2)
        log_success "Node.js $NODE_VERSION found"
    else
        log_error "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        log_success "npm $NPM_VERSION found"
    else
        log_error "npm not found. Please install npm."
        exit 1
    fi
    
    # Check Rust
    if command_exists rustc; then
        RUST_VERSION=$(rustc --version | cut -d ' ' -f 2)
        log_success "Rust $RUST_VERSION found"
    else
        log_error "Rust not found. Please install Rust from https://rustup.rs/"
        exit 1
    fi
    
    # Check wasm32 target
    if rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
        log_success "wasm32-unknown-unknown target found"
    else
        log_warning "wasm32-unknown-unknown target not found. Installing..."
        rustup target add wasm32-unknown-unknown
    fi
    
    # Check DFX
    if command_exists dfx; then
        DFX_VERSION=$(dfx --version | cut -d ' ' -f 2)
        log_success "DFX $DFX_VERSION found"
    else
        log_warning "DFX not found. Installing..."
        wget -O install-dfx.sh "https://raw.githubusercontent.com/dfinity/sdk/main/public/install-dfx.sh"
        DFXVM_INIT_YES=true bash install-dfx.sh < /dev/null
        rm install-dfx.sh
        export PATH="$HOME/.local/share/dfx/bin:$PATH"
        log_success "DFX installed"
    fi
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Install root dependencies
    log_info "Installing root dependencies..."
    npm ci
    
    # Install frontend dependencies (handled by workspace)
    log_info "Installing frontend dependencies..."
    npm ci --workspace=src/polychain_l2_frontend
    
    log_success "Dependencies installed"
}

# Setup DFX
setup_dfx() {
    log_info "Setting up DFX..."
    
    # Stop any existing DFX processes
    if dfx ping > /dev/null 2>&1; then
        log_warning "DFX is already running. Stopping..."
        dfx stop
    fi
    
    # Start DFX
    log_info "Starting DFX..."
    dfx start --background --clean
    
    # Wait for DFX to be ready
    sleep 5
    
    # Deploy Internet Identity
    log_info "Deploying Internet Identity..."
    dfx deploy internet_identity
    
    # Deploy backend
    log_info "Deploying backend..."
    dfx deploy polychain_l2_backend
    
    # Generate frontend declarations
    log_info "Generating frontend declarations..."
    dfx generate polychain_l2_backend
    
    # Deploy frontend
    log_info "Deploying frontend..."
    dfx deploy polychain_l2_frontend
    
    log_success "DFX setup complete"
}

# Run initial tests
run_tests() {
    log_info "Running initial tests..."
    
    # Test backend
    log_info "Testing Rust backend..."
    cargo test
    
    # Test frontend (if tests exist)
    if [ -f "src/polychain_l2_frontend/package.json" ] && grep -q "test" "src/polychain_l2_frontend/package.json"; then
        log_info "Testing frontend..."
        npm test --workspace=src/polychain_l2_frontend
    fi
    
    log_success "Tests completed"
}

# Show URLs and next steps
show_next_steps() {
    log_success "🎉 Setup complete!"
    
    echo ""
    echo "📋 Next steps:"
    echo "1. Frontend: http://localhost:4943?canisterId=$(dfx canister id polychain_l2_frontend)"
    echo "2. Backend Candid UI: http://localhost:4943?canisterId=$(dfx canister id polychain_l2_backend)"
    echo "3. Internet Identity: http://localhost:4943?canisterId=$(dfx canister id internet_identity)"
    echo ""
    echo "🔧 Development commands:"
    echo "  npm start                    # Start frontend development server"
    echo "  cargo test                   # Run backend tests"
    echo "  dfx deploy                   # Deploy all canisters"
    echo "  ./scripts/test-quick.sh      # Run quick tests"
    echo "  ./scripts/check-quality.sh  # Check code quality"
    echo ""
    echo "📚 Useful resources:"
    echo "  - DFX SDK: https://sdk.dfinity.org/"
    echo "  - IC CDK: https://docs.rs/ic-cdk/"
    echo "  - React: https://reactjs.org/docs/"
    echo ""
    echo "🚀 Happy coding!"
}

# Main execution
main() {
    echo "🔧 PolyChain Layer 2 - Development Setup"
    echo "========================================"
    echo ""
    
    check_requirements
    install_dependencies
    setup_dfx
    run_tests
    show_next_steps
}

# Run main function
main "$@"