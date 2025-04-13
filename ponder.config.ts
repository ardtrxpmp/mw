import { createConfig } from "ponder";
import { http } from "viem";

import { ComptrollerAbi } from "./abis/Comptroller";
import { MTokenAbi } from "./abis/MToken";
import { TOKENS } from "./src/config/tokens";

// Comptroller configuration
const COMPTROLLER_ADDRESS = "0xfBb21d0380beE3312B33c4353c8936a0F13EF26C";
const START_BLOCK = 2300000; // Adjust as needed

// Define the type for contract configuration
type ContractConfig = {
  abi: typeof MTokenAbi;
  network: string;
  address: `0x${string}`;
  startBlock: number | string;
};

// Create contract configurations for each token
const tokenContracts: Record<string, ContractConfig> = {};

// Ensure TOKENS is defined and has at least one entry
if (Array.isArray(TOKENS) && TOKENS.length > 0) {
  // Add configurations for each token
  TOKENS.forEach(token => {
    // Ensure the token has a symbol and address
    if (token && token.symbol && token.address) {
      // Create a contract name using the token symbol
      const contractName = token.symbol === TOKENS[0]?.symbol ? "MToken" : `MToken_${token.symbol}`;
      
      tokenContracts[contractName] = {
        abi: MTokenAbi,
        network: "base",
        address: token.address,
        startBlock: START_BLOCK,
      };
    }
  });
}

// If no tokens were processed, add a fallback
if (Object.keys(tokenContracts).length === 0) {
  tokenContracts["MToken"] = {
    abi: MTokenAbi,
    network: "base",
    address: "0x6Ff9c8FF8F9F7C3551f1A753A6A8BD54B6445DD7" as `0x${string}`, // Fallback address
    startBlock: START_BLOCK,
  };
}

export default createConfig({
  networks: {
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    Comptroller: {
      abi: ComptrollerAbi,
      network: "base",
      address: COMPTROLLER_ADDRESS,
      startBlock: START_BLOCK,
    },
    // Spread the token contracts into the configuration
    ...tokenContracts,
  },
  database: {
    // Use PostgreSQL with the provided Supabase URL
    kind: "postgres",
    connectionString: process.env.DATABASE_URL,
  },
});
