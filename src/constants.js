export const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

export const abi = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_wethAddress",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "seller",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "acceptedNFTs",
          "type": "uint256[]"
        }
      ],
      "name": "DemandAccepted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "randomArr",
          "type": "uint256[]"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "result",
          "type": "bool"
        }
      ],
      "name": "GetImages",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "minter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenUri",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "entryFee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "remaining",
          "type": "uint256"
        }
      ],
      "name": "NewMinting",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "demandId",
          "type": "uint256"
        }
      ],
      "name": "acceptDemand",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "claimPrice",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        },
        {
          "internalType": "uint256[]",
          "name": "NFTs",
          "type": "uint256[]"
        }
      ],
      "name": "createDemand",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "demandId",
          "type": "uint256"
        }
      ],
      "name": "deleteDemand",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getEntryFee",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getInboundDemands",
      "outputs": [
        {
          "components": [
            {
              "internalType": "enum Game.DemandState",
              "name": "validity",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "applicant",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256[]",
              "name": "NFTs",
              "type": "uint256[]"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "internalType": "struct Game.Demand[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getNFTList",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "basePrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tokenUri",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "minter",
              "type": "address"
            }
          ],
          "internalType": "struct Common.NFT[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getNFTs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "basePrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tokenUri",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "minter",
              "type": "address"
            }
          ],
          "internalType": "struct Common.NFT[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getOutboundDemands",
      "outputs": [
        {
          "components": [
            {
              "internalType": "enum Game.DemandState",
              "name": "validity",
              "type": "uint8"
            },
            {
              "internalType": "address",
              "name": "applicant",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "uint256[]",
              "name": "NFTs",
              "type": "uint256[]"
            },
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "internalType": "struct Game.Demand[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getRemainNFT",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "f_id",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "s_id",
          "type": "uint256"
        }
      ],
      "name": "playGame",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "demandId",
          "type": "uint256"
        }
      ],
      "name": "rejectDemand",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "testGetTotalNFTSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenUri",
          "type": "uint256"
        }
      ],
      "name": "testMint",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "newFee",
          "type": "uint256"
        }
      ],
      "name": "testSetEntryFee",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "demandId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "price",
          "type": "uint256"
        }
      ],
      "name": "updateDemand",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]