# HARDHAT-MONAD

A Monad testnet swap DEX using Hardhat.

## Overview
This project demonstrates a decentralized exchange (DEX) swap on the Monad testnet using Hardhat, TypeScript, and Solidity. It includes scripts and contracts for interacting with Uniswap V2 and Universal Routers, and provides a test script for simulating token swaps between WMON and USDC.

## Features
- Swap tokens on Monad testnet using Uniswap V2 and Universal Routers
- Hardhat-based development and deployment
- TypeScript scripts for testing and automation
- Example contracts and deployment modules

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- Yarn or npm
- Hardhat

### Installation
```bash
npm install
# or
yarn install
```

### Configuration
- Copy `.env.example` to `.env` and set your private key and RPC URL for Monad testnet.

### Running Tests
```bash
npx hardhat test
```

### Running the Swap Test Script
```bash
npx ts-node scripts/test-monadswap.ts
```

## Project Structure
- `contracts/` - Solidity smart contracts
- `scripts/` - Deployment and test scripts
- `test/` - Test files
- `artifacts/`, `cache/` - Build artifacts (gitignored)

## License
MIT

