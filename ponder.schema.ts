/**
 * Schema definition for the Moonwell Protocol indexer
 * This file defines the database structure for tracking user interactions
 * and positions across the protocol.
 */

import { onchainTable, primaryKey } from "ponder";
import { TOKENS } from "./src/config/tokens";


// Function to create token columns
const createTokenColumns = (t: any) => {
  const columns: Record<string, any> = {};
  TOKENS.forEach(token => {
    columns[token.symbol] = t.jsonb().default([]);
  });
  return columns;
};

/**
 * Table for tracking unique user addresses and their token interactions
 * This table stores all addresses that have interacted with the protocol
 */
export const userAddresses = onchainTable(
  "user_addresses",
  (t) => ({
    userAddress: t.hex().notNull(),
    tokenSymbol: t.text().notNull(), // The symbol of the token the user interacted with
    tokenAddress: t.hex().notNull(), // The address of the token contract
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.userAddress, table.tokenSymbol] }),
  })
);

/**
 * Table for tracking user positions in the protocol
 * Stores current supply, collateral and borrow balances for each user
 */
export const userMetrics = onchainTable(
  "user_metrics",
  (t) => ({
    userAddress: t.hex().notNull(),
    // Token-specific columns with arrays of [amountSupplied, amountBorrowed, adjustedCollateralFactor]
    ...createTokenColumns(t),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.userAddress] }),
  })
);

/**
 * Table for tracking all user transactions
 * Records every supply, borrow, repay, redeem, and liquidation event
 */
export const userTransactions = onchainTable(
  "user_transactions",
  (t) => ({
    // Unique identifier combining transaction hash and log index
    id: t.text().notNull(),
    userAddress: t.hex().notNull(), // The address of the user
    mTokenAddress: t.hex().notNull(), // The market address
    tokenSymbol: t.text().notNull(), // The symbol of the token

    // Transaction details
    transactionType: t.text().notNull(), // Type of transaction (BORROW, REPAY, SUPPLY, etc.)
    amount: t.bigint().notNull(), // Amount involved in the transaction
    tokenAmount: t.bigint(), // Token amount (for mint/redeem/liquidation)
    relatedAddress: t.hex(), // Related address (for repayBorrowBehalf, liquidations)

    // Block information
    blockNumber: t.bigint().notNull(), // Block number of the transaction
    blockTimestamp: t.bigint().notNull(), // Unix timestamp of the block
    transactionHash: t.hex().notNull(), // Hash of the transaction
  }),
  (table) => ({
    // Primary key is the composite ID
    pk: primaryKey({ columns: [table.id] }),
    // Indexes for efficient querying
    userIndex: {
      columns: [table.userAddress]
    },
    marketIndex: {
      columns: [table.mTokenAddress]
    },
    typeIndex: {
      columns: [table.transactionType]
    },
    blockIndex: {
      columns: [table.blockNumber]
    }
  })
);