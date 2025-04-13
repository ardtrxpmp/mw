export const ComptrollerAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "type": "function",
    "name": "oracle",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ]
  },
  {
    "type": "function",
    "name": "markets",
    "stateMutability": "view",
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "outputs": [
      { "internalType": "bool", "name": "isListed", "type": "bool" },
      { "internalType": "uint256", "name": "collateralFactorMantissa", "type": "uint256" }
    ]
  },
  {
    "type": "function",
    "name": "borrowCaps",
    "stateMutability": "view",
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ]
  },
  {
    "type": "function",
    "name": "supplyCaps",
    "stateMutability": "view",
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ]
  },
  {
    "type": "function",
    "name": "liquidationIncentiveMantissa",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ]
  },
  {
    "type": "event",
    "name": "NewCollateralFactor",
    "inputs": [
      {
        "indexed": true,
        "internalType": "contract MToken",
        "name": "mToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldCollateralFactorMantissa",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newCollateralFactorMantissa",
        "type": "uint256"
      }
    ],
    "anonymous": false
  }
] as const;
