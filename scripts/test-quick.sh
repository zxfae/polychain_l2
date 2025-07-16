#!/bin/bash

# PolyChain Layer 2 - Quick Test Script
# Fast testing for development workflow

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

# Check if we're in the right directory
if [ ! -f "dfx.json" ]; then
    log_error "dfx.json not found. Please run this script from the project root."
    exit 1
fi

# Track start time
START_TIME=$(date +%s)

# Function to show elapsed time
show_elapsed() {
    END_TIME=$(date +%s)
    ELAPSED=$((END_TIME - START_TIME))
    log_info "⏱️  Total time: ${ELAPSED}s"
}

# Test Rust backend (fast)
test_rust() {
    log_info "🦀 Testing Rust backend..."
    
    # Run cargo check first (faster than build)
    if cargo check --quiet; then
        log_success "Rust check passed"
    else
        log_error "Rust check failed"
        return 1
    fi
    
    # Run tests
    if cargo test --quiet; then
        log_success "Rust tests passed"
    else
        log_error "Rust tests failed"
        return 1
    fi
}

# Test frontend (fast)
test_frontend() {
    log_info "⚛️  Testing frontend..."
    
    # Type check
    if npm run build --workspace=src/polychain_l2_frontend --silent; then
        log_success "Frontend build passed"
    else
        log_error "Frontend build failed"
        return 1
    fi
    
    # Run tests if they exist
    if [ -f "src/polychain_l2_frontend/package.json" ] && grep -q "test" "src/polychain_l2_frontend/package.json"; then
        if npm test --workspace=src/polychain_l2_frontend --silent; then
            log_success "Frontend tests passed"
        else
            log_error "Frontend tests failed"
            return 1
        fi
    else
        log_warning "No frontend tests found"
    fi
}

# Test DFX deployment (quick check)
test_dfx() {
    log_info "🔧 Testing DFX deployment..."
    
    # Check if DFX is running
    if ! dfx ping > /dev/null 2>&1; then
        log_warning "DFX not running. Starting..."
        dfx start --background --clean
        sleep 5
    fi
    
    # Quick deployment check
    if dfx deploy --check > /dev/null 2>&1; then
        log_success "DFX deployment check passed"
    else
        log_error "DFX deployment check failed"
        return 1
    fi
}

# Parse command line arguments
RUST_ONLY=false
FRONTEND_ONLY=false
DFX_ONLY=false
SKIP_DFX=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --rust-only)
            RUST_ONLY=true
            shift
            ;;
        --frontend-only)
            FRONTEND_ONLY=true
            shift
            ;;
        --dfx-only)
            DFX_ONLY=true
            shift
            ;;
        --skip-dfx)
            SKIP_DFX=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --rust-only     Run only Rust tests"
            echo "  --frontend-only Run only frontend tests"
            echo "  --dfx-only      Run only DFX tests"
            echo "  --skip-dfx      Skip DFX tests"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Main execution
main() {
    echo "🚀 PolyChain Layer 2 - Quick Tests"
    echo "================================="
    echo ""
    
    FAILED=false
    
    # Run tests based on options
    if [ "$RUST_ONLY" = true ]; then
        test_rust || FAILED=true
    elif [ "$FRONTEND_ONLY" = true ]; then
        test_frontend || FAILED=true
    elif [ "$DFX_ONLY" = true ]; then
        test_dfx || FAILED=true
    else
        # Run all tests
        test_rust || FAILED=true
        test_frontend || FAILED=true
        
        if [ "$SKIP_DFX" = false ]; then
            test_dfx || FAILED=true
        fi
    fi
    
    echo ""
    show_elapsed
    
    if [ "$FAILED" = true ]; then
        log_error "❌ Some tests failed"
        exit 1
    else
        log_success "✅ All tests passed!"
    fi
}

# Trap to show elapsed time on exit
trap show_elapsed EXIT

# Run main function
main "$@"