#!/bin/bash

# PolyChain Layer 2 - Development Setup Script
# This script sets up the development environment for new team members

set -e

# Set this to the desired DFX version for reproducibility
DFX_VERSION="0.15.2"
export DFX_VERSION

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
    log_info "DFX_VERSION is set to $DFX_VERSION"

    # Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        if [[ "$(echo $NODE_VERSION | cut -d'.' -f1)" -ge 18 ]]; then
            log_success "Node.js $NODE_VERSION found"
        else
            log_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
            exit 1
        fi
    else
        log_error "Node.js not found. Please install Node.js 18 or higher."
        exit 1
    fi

    # npm
    if command_exists npm; then
        log_success "npm $(npm --version) found"
    else
        log_error "npm not found. Please install npm."
        exit 1
    fi

    # Rust
    if command_exists rustc; then
        log_success "Rust $(rustc --version) found"
    else
        log_error "Rust not found. Please install Rust[](https://rustup.rs/)."
        exit 1
    fi

    # wasm32 target
    if rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
        log_success "wasm32-unknown-unknown target found"
    else
        log_warning "wasm32-unknown-unknown target not found. Installing..."
        rustup target add wasm32-unknown-unknown || {
            log_error "Failed to add wasm32 target"
            exit 1
        }
        log_success "wasm32-unknown-unknown target installed"
    fi

    # DFX
    if command_exists dfx; then
        DFX_INSTALLED_VERSION=$(dfx --version | awk '{print $2}')
        log_success "DFX $DFX_INSTALLED_VERSION found"
        if [ "$DFX_INSTALLED_VERSION" != "$DFX_VERSION" ]; then
            log_warning "DFX version $DFX_INSTALLED_VERSION does not match requested $DFX_VERSION. Reinstalling..."
            sh -c "$(curl -fsSL https://internetcomputer.org/install.sh)" -- --yes --version "$DFX_VERSION" || {
                log_error "Failed to install DFX $DFX_VERSION"
                exit 1
            }
            log_success "DFX $DFX_VERSION installed"
        fi
    else
        log_warning "DFX not found. Installing DFX $DFX_VERSION..."
        sh -c "$(curl -fsSL https://internetcomputer.org/install.sh)" -- --yes --version "$DFX_VERSION" || {
            log_error "Failed to install DFX $DFX_VERSION"
            exit 1
        }
        log_success "DFX $DFX_VERSION installed"
    fi

    # Update PATH
    export PATH="$HOME/bin:$HOME/.local/bin:$HOME/.local/share/dfx/bin:$PATH"
    log_info "Updated PATH to include DFX binary locations"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."

    log_info "Installing root dependencies..."
    npm ci || {
        log_error "Failed to install root dependencies"
        exit 1
    }

    log_info "Installing frontend dependencies..."
    npm ci --workspace=src/polychain_l2_frontend || {
        log_error "Failed to install frontend dependencies"
        exit 1
    }

    log_success "Dependencies installed"
}

# Setup DFX
setup_dfx() {
    log_info "Setting up DFX..."

    # Stop any existing DFX processes
    if command_exists dfx && dfx ping >/dev/null 2>&1; then
        log_warning "DFX is already running. Stopping..."
        dfx stop || log_warning "Could not stop DFX, continuing anyway..."
    fi

    log_info "Starting DFX..."
    dfx start --background --clean || {
        log_error "Failed to start DFX"
        exit 1
    }

    # Wait for DFX to be ready
    sleep 5

    log_info "Deploying Internet Identity..."
    dfx deploy internet_identity || {
        log_warning "Failed to deploy Internet Identity"
        return 1
    }

    log_info "Deploying backend..."
    dfx deploy polychain_l2_backend || {
        log_warning "Failed to deploy backend"
        return 1
    }

    log_info "Generating frontend declarations for backend..."
    dfx generate polychain_l2_backend || {
        log_warning "Failed to generate backend declarations"
        return 1
    }
    sleep 2

    log_info "Deploying frontend..."
    dfx deploy polychain_l2_frontend || {
        log_warning "Failed to deploy frontend"
        return 1
    }

    log_success "DFX setup complete"
}

# Run initial tests
run_tests() {
    log_info "Running initial tests..."

    log_info "Testing Rust backend..."
    cargo test || {
        log_warning "Backend tests failed"
        return 1
    }

    if [ -f "src/polychain_l2_frontend/package.json" ]; then
        log_info "Testing frontend..."
        npm run --workspace=src/polychain_l2_frontend --if-present test || {
            log_warning "Frontend tests failed or not found"
            return 1
        }
    fi

    log_success "Tests completed"
}

# Show URLs and next steps
show_next_steps() {
    log_success "🎉 Setup complete!"
    echo
    echo "📋 Next steps:"
    echo "1. Frontend:    http://localhost:$(dfx webserver-port)?canisterId=$(dfx canister id polychain_l2_frontend)"
    echo "2. Backend Candid UI: http://localhost:$(dfx webserver-port)?canisterId=$(dfx canister id polychain_l2_backend)&id=polychain_l2_backend"
    echo "3. Internet Identity: http://localhost:$(dfx webserver-port)?canisterId=$(dfx canister id internet_identity)"
    echo
    echo "🔧 Development commands:"
    echo "  npm start                    # Start frontend development server"
    echo "  cargo test                   # Run backend tests"
    echo "  dfx deploy                   # Deploy all canisters"
    echo
    echo "📚 Useful resources:"
    echo "  - DFX SDK: https://internetcomputer.org/docs/current/developer-docs/cli-tools/dfx"
    echo "  - IC CDK: https://docs.rs/ic-cdk/"
    echo "  - React: https://reactjs.org/docs/"
    echo
    echo "🚀 Happy coding!"
}

# ----- Main execution -----
main() {
    echo
    echo "🔧 PolyChain Layer 2 - Development Setup"
    echo "========================================"
    echo

    check_requirements
    install_dependencies
    setup_dfx
    run_tests
    show_next_steps
}

main "$@"
