# Matching NFT Game with WETH

This contract is a matching game that acquires NFTs and then facilitates NFT trading using the WETH9 contract deployed on the Ethereum mainnet.

## Setup

### Get Packages

```bash
npm install
```

### Install WETH9 code

```
add WETH_CONTRACT_URL in environment variable
run node scripts/downloadWethContract.js
```

### Test on local network

```
copy the content of test.txt to the end of the contract file."
add "NETWORK" as "localhost" in environment variable
run npx hardhat run scripts/deploy.js --network localhost
add WETH_CONTRACT_ADDRESS and GAME_CONTRACT_ADDRESS in environment variable
run npx hardhat test --grep "Test1" --network localhost
run npx hardhat run scripts/deploy.js --network localhost
add WETH_CONTRACT_ADDRESS and GAME_CONTRACT_ADDRESS in environment variable
npx hardhat test --grep "Test2" --network localhost
```

### Test on hardhat network

```
copy the content of test.txt to the end of the contract file."
add "NETWORK" as "hardhat" in environment variable
run npx hardhat test
run npx hardhat coverage
```

### To run hepler tx

```
npx hardhat test scripts/frontend_helper.js --network localhost
```
