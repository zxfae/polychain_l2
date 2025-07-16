#!/bin/bash

# PolyChain Layer 2 - Code Quality Check Script
# Runs linting, formatting, and quality checks

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

# Check Rust code quality
check_rust() {
    log_info "🦀 Checking Rust code quality..."
    
    # Check formatting
    log_info "Checking Rust formatting..."
    if cargo fmt --all -- --check; then
        log_success "Rust formatting is correct"
    else
        log_error "Rust formatting issues found. Run: cargo fmt"
        return 1
    fi
    
    # Run clippy
    log_info "Running Rust clippy..."
    if cargo clippy --all-targets --all-features -- -D warnings; then
        log_success "Clippy checks passed"
    else
        log_error "Clippy found issues"
        return 1
    fi
    
    # Check for unused dependencies
    log_info "Checking for unused dependencies..."
    if command -v cargo-machete > /dev/null 2>&1; then
        if cargo machete; then
            log_success "No unused dependencies found"
        else
            log_warning "Unused dependencies found"
        fi
    else
        log_warning "cargo-machete not installed. Install with: cargo install cargo-machete"
    fi
}

# Check frontend code quality
check_frontend() {
    log_info "⚛️  Checking frontend code quality..."
    
    # Check TypeScript
    log_info "Type checking TypeScript..."
    if npm run build --workspace=src/polychain_l2_frontend --silent; then
        log_success "TypeScript check passed"
    else
        log_error "TypeScript errors found"
        return 1
    fi
    
    # Check formatting (if prettier is configured)
    if [ -f "src/polychain_l2_frontend/package.json" ] && grep -q "format" "src/polychain_l2_frontend/package.json"; then
        log_info "Checking frontend formatting..."
        if npm run format --workspace=src/polychain_l2_frontend --silent; then
            log_success "Frontend formatting is correct"
        else
            log_error "Frontend formatting issues found"
            return 1
        fi
    fi
    
    # Check for ESLint (if configured)
    if [ -f "src/polychain_l2_frontend/.eslintrc.js" ] || [ -f "src/polychain_l2_frontend/.eslintrc.json" ]; then
        log_info "Running ESLint..."
        if npm run lint --workspace=src/polychain_l2_frontend --silent; then
            log_success "ESLint checks passed"
        else
            log_error "ESLint found issues"
            return 1
        fi
    fi
}

# Check DFX configuration
check_dfx() {
    log_info "🔧 Checking DFX configuration..."
    
    # Validate dfx.json
    if python3 -m json.tool dfx.json > /dev/null 2>&1; then
        log_success "dfx.json is valid JSON"
    else
        log_error "dfx.json is invalid JSON"
        return 1
    fi
    
    # Check Candid files
    for did_file in $(find src -name "*.did" 2>/dev/null); do
        log_info "Checking Candid file: $did_file"
        if [ -f "$did_file" ]; then
            # Basic syntax check (if didc is available)
            if command -v didc > /dev/null 2>&1; then
                if didc check "$did_file"; then
                    log_success "Candid file $did_file is valid"
                else
                    log_error "Candid file $did_file has errors"
                    return 1
                fi
            else
                log_warning "didc not available for Candid validation"
            fi
        fi
    done
}

# Check security issues
check_security() {
    log_info "🔒 Checking for security issues..."
    
    # Check for secrets in code
    log_info "Scanning for potential secrets..."
    if grep -r -i "password\|secret\|key\|token" --include="*.rs" --include="*.js" --include="*.ts" --include="*.jsx" --include="*.tsx" src/; then
        log_warning "Potential secrets found in code. Please review."
    else
        log_success "No obvious secrets found"
    fi
    
    # Check Rust dependencies for known vulnerabilities
    if command -v cargo-audit > /dev/null 2>&1; then
        log_info "Running cargo audit..."
        if cargo audit; then
            log_success "No known vulnerabilities in Rust dependencies"
        else
            log_error "Vulnerabilities found in Rust dependencies"
            return 1
        fi
    else
        log_warning "cargo-audit not installed. Install with: cargo install cargo-audit"
    fi
    
    # Check npm dependencies for known vulnerabilities
    log_info "Running npm audit..."
    if npm audit --audit-level=moderate; then
        log_success "No moderate+ vulnerabilities in npm dependencies"
    else
        log_error "Vulnerabilities found in npm dependencies"
        return 1
    fi
}

# Check file permissions and structure
check_structure() {
    log_info "📁 Checking project structure..."
    
    # Check required files
    REQUIRED_FILES=("dfx.json" "Cargo.toml" "package.json")
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$file" ]; then
            log_success "Required file $file exists"
        else
            log_error "Required file $file missing"
            return 1
        fi
    done
    
    # Check script permissions
    for script in scripts/*.sh; do
        if [ -f "$script" ]; then
            if [ -x "$script" ]; then
                log_success "Script $script is executable"
            else
                log_warning "Script $script is not executable. Run: chmod +x $script"
            fi
        fi
    done
}

# Parse command line arguments
RUST_ONLY=false
FRONTEND_ONLY=false
DFX_ONLY=false
SECURITY_ONLY=false
SKIP_SECURITY=false
FIX=false

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
        --security-only)
            SECURITY_ONLY=true
            shift
            ;;
        --skip-security)
            SKIP_SECURITY=true
            shift
            ;;
        --fix)
            FIX=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --rust-only     Check only Rust code"
            echo "  --frontend-only Check only frontend code"
            echo "  --dfx-only      Check only DFX configuration"
            echo "  --security-only Check only security issues"
            echo "  --skip-security Skip security checks"
            echo "  --fix           Auto-fix issues where possible"
            echo "  --help          Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Auto-fix function
auto_fix() {
    if [ "$FIX" = true ]; then
        log_info "🔧 Auto-fixing issues..."
        
        # Fix Rust formatting
        cargo fmt --all
        
        # Fix frontend formatting
        if [ -f "src/polychain_l2_frontend/package.json" ] && grep -q "format" "src/polychain_l2_frontend/package.json"; then
            npm run format --workspace=src/polychain_l2_frontend
        fi
        
        # Make scripts executable
        chmod +x scripts/*.sh
        
        log_success "Auto-fix completed"
    fi
}

# Main execution
main() {
    echo "🔍 PolyChain Layer 2 - Code Quality Check"
    echo "========================================"
    echo ""
    
    FAILED=false
    
    # Auto-fix first if requested
    auto_fix
    
    # Run checks based on options
    if [ "$RUST_ONLY" = true ]; then
        check_rust || FAILED=true
    elif [ "$FRONTEND_ONLY" = true ]; then
        check_frontend || FAILED=true
    elif [ "$DFX_ONLY" = true ]; then
        check_dfx || FAILED=true
    elif [ "$SECURITY_ONLY" = true ]; then
        check_security || FAILED=true
    else
        # Run all checks
        check_structure || FAILED=true
        check_rust || FAILED=true
        check_frontend || FAILED=true
        check_dfx || FAILED=true
        
        if [ "$SKIP_SECURITY" = false ]; then
            check_security || FAILED=true
        fi
    fi
    
    echo ""
    show_elapsed
    
    if [ "$FAILED" = true ]; then
        log_error "❌ Quality checks failed"
        exit 1
    else
        log_success "✅ All quality checks passed!"
    fi
}

# Trap to show elapsed time on exit
trap show_elapsed EXIT

# Run main function
main "$@"