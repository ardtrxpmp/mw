/**
 * Moonwell Protocol Event Indexer and Metrics Calculator
 * 
 * This module serves as the core event processing and metrics calculation engine for the Moonwell Protocol on Base network.
 * It handles the following key responsibilities:
 * 
 * 1. Event Processing:
 *    - Indexes and processes various protocol events
 *      (Borrow, RepayBorrow, Mint, Redeem, LiquidateBorrow, Transfer, NewCollateralFactor)
 *    - Stores event data in PostgreSQL database with detailed transaction information
 *    - Maintains user address mappings and relationships
 * 
 * 2. Position Tracking:
 *    - Calculates real-time user positions across all supported tokens
 *    - Tracks supplied amounts, borrowed amounts, and collateral factors
 *    - Computes health factors and borrowing limits
 * 
 * 3. Price and Value Calculations:
 *    - Fetches token prices from the protocol's oracle
 *    - Converts token amounts to USD values
 *    - Handles different decimal places across various tokens
 * 
 * 4. Database Management:
 *    - Maintains transaction history
 *    - Stores user metrics and positions
 *    - Handles address relationships and token associations
 * 
 * The module uses Ponder for event indexing and Drizzle ORM for database operations.
 * It implements comprehensive error handling and logging for production reliability.
 */

import { Context, ponder } from "ponder:registry";
import { TOKENS } from "./config/tokens";
import * as fs from 'fs';
import { BorrowEvent, IndexedEvent, LiquidateBorrowEvent, MintEvent, RedeemEvent, RepayBorrowEvent, TokenData, TransferEvent } from "./types/types";
import { userAddresses, userMetrics, userTransactions } from "ponder:schema";

/**
 * Logs errors to a file with timestamp and context
 * @param error - The error object to log
 * @param context - Additional context about where the error occurred
 */
async function logError(error: any, context: string) {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${context}\nError: ${error instanceof Error ? error.message : String(error)}\nStack: ${error instanceof Error ? error.stack : 'No stack trace'}\n\n`;

    try {
        await fs.promises.appendFile('./logs/errors.log', errorMessage);
    } catch (writeError) {
        console.error('Failed to write to error log:', writeError);
    }
}

/**
 * Sets up event handlers for all supported tokens in the protocol
 * 
 * This function:
 * 1. Registers event handlers for each token contract
 * 2. Processes different event types (Borrow, RepayBorrow, Mint, Redeem, LiquidateBorrow, Transfer, NewCollateralFactor)
 * 3. Standardizes event data and stores it in the database
 * 4. Includes error handling and logging for each event type
 */
export function setupEventHandlers() {
    console.log(`Setting up event handlers for ${TOKENS.length} tokens`);
    // Create logs directory if it doesn't exist
    const logDir = './logs';
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Setup event handlers for all tokens and events
    TOKENS.forEach(token => {
        const contractName = token.symbol === TOKENS[0]?.symbol ? "MToken" : `MToken_${token.symbol}`;

        // Handle Borrow events
        // @ts-ignore - Ignore type errors for dynamic event handler registration
        ponder.on(`${contractName}:Borrow`, async ({ event, context }: { event: any; context: Context<any> }) => {
            const { borrower } = event.args as BorrowEvent;
            const errorContext = `Borrow event error for token ${token.symbol} - User: ${borrower}`;

            try {
                const { borrowAmount, accountBorrows, totalBorrows } = event.args as BorrowEvent;

                console.log(`[EVENT RECEIVED] Borrow event from ${contractName}:`, {
                    borrower: borrower,
                    amount: borrowAmount.toString(),
                    blockNumber: event.block.number.toString()
                });

                const { db } = context;
                const blockNumber = event.block.number;
                const blockTimestamp = event.block.timestamp;
                const txHash = event.transaction.hash;
                const logIndex = event.log.logIndex;

                const indexedEvent: IndexedEvent = {
                    type: 'Borrow',
                    user: borrower,
                    token: token.symbol,
                    tokenAddress: token.address,
                    amount: borrowAmount,
                    blockNumber,
                    blockTimestamp,
                    transactionHash: txHash,
                    logIndex
                };

                let result: any = await db.find(userMetrics, { userAddress: borrower });

                let tokenData: TokenData = ["0", accountBorrows.toString()];

                if (result !== null && result !== undefined) {
                    let tokenArray = result[token.symbol] as TokenData;
                    if (tokenArray !== null && tokenArray !== undefined && tokenArray.length === 2) {
                        tokenData[0] = tokenArray[0];
                        tokenData[1] = accountBorrows.toString();
                    }
                }

                await storeEvent(db, indexedEvent);

                await db.insert(userMetrics).values({
                    userAddress: borrower,
                    [token.symbol]: tokenData,
                }).onConflictDoUpdate({
                    [token.symbol]: tokenData,
                });

            } catch (error) {
                console.error(`[EVENT ERROR] ${errorContext}:`, error);
                await logError(error, errorContext);
            }
        });

        // Handle RepayBorrow events
        // @ts-ignore - Ignore type errors for dynamic event handler registration
        ponder.on(`${contractName}:RepayBorrow`, async ({ event, context }: { event: any; context: Context<any> }) => {
            const { borrower, payer } = event.args as RepayBorrowEvent;
            const errorContext = `RepayBorrow event error for token ${token.symbol} - Borrower: ${borrower}, Payer: ${payer}`;

            try {
                const { repayAmount, accountBorrows, totalBorrows } = event.args as RepayBorrowEvent;
                const { db } = context;
                const blockNumber = event.block.number;
                const blockTimestamp = event.block.timestamp;
                const txHash = event.transaction.hash;
                const logIndex = event.log.logIndex;

                const indexedEvent: IndexedEvent = {
                    type: 'RepayBorrow',
                    user: borrower,
                    token: token.symbol,
                    tokenAddress: token.address,
                    amount: repayAmount,
                    relatedAddress: payer !== borrower ? payer : undefined,
                    blockNumber,
                    blockTimestamp,
                    transactionHash: txHash,
                    logIndex
                };

                let result: any = await db.find(userMetrics, { userAddress: borrower });

                let tokenData: TokenData = ["0", accountBorrows.toString()];

                if (result !== null && result !== undefined) {
                    let tokenArray = result[token.symbol] as TokenData;
                    if (tokenArray !== null && tokenArray !== undefined && tokenArray.length === 2) {
                        tokenData[0] = tokenArray[0];
                        tokenData[1] = accountBorrows.toString();
                    }
                }

                await storeEvent(db, indexedEvent);

                await db.insert(userMetrics).values({
                    userAddress: borrower,
                    [token.symbol]: tokenData,
                }).onConflictDoUpdate({
                    [token.symbol]: tokenData,
                });

            } catch (error) {
                console.error(`[EVENT ERROR] ${errorContext}:`, error);
                await logError(error, errorContext);
            }
        });

        // Handle Mint events
        // @ts-ignore - Ignore type errors for dynamic event handler registration
        ponder.on(`${contractName}:Mint`, async ({ event, context }: { event: any; context: Context<any> }) => {
            const { minter } = event.args as MintEvent;
            const errorContext = `Mint event error for token ${token.symbol} - User: ${minter}`;

            try {
                const { mintAmount, mintTokens } = event.args as MintEvent;
                const { db } = context;
                const blockNumber = event.block.number;
                const blockTimestamp = event.block.timestamp;
                const txHash = event.transaction.hash;
                const logIndex = event.log.logIndex;

                const indexedEvent: IndexedEvent = {
                    type: 'Mint',
                    user: minter,
                    token: token.symbol,
                    tokenAddress: token.address,
                    amount: mintAmount,
                    tokenAmount: mintTokens,
                    blockNumber,
                    blockTimestamp,
                    transactionHash: txHash,
                    logIndex
                };

                console.log(`[EVENT RECEIVED] Mint event from ${contractName}:`, {
                    minter: minter,
                    amount: mintAmount.toString(),
                    tokens: mintTokens.toString(),
                    blockNumber: event.block.number.toString()
                });

                // Only store the event, don't update balances
                // Balance updates will be handled by the Transfer event
                await storeEvent(db, indexedEvent);

            } catch (error) {
                console.error(`[EVENT ERROR] ${errorContext}:`, error);
                await logError(error, errorContext);
            }
        });

        // Handle Redeem events
        // @ts-ignore - Ignore type errors for dynamic event handler registration
        ponder.on(`${contractName}:Redeem`, async ({ event, context }: { event: any; context: Context<any> }) => {
            const { redeemer } = event.args as RedeemEvent;
            const errorContext = `Redeem event error for token ${token.symbol} - User: ${redeemer}`;

            try {
                const { redeemAmount, redeemTokens } = event.args as RedeemEvent;
                const { db } = context;
                const blockNumber = event.block.number;
                const blockTimestamp = event.block.timestamp;
                const txHash = event.transaction.hash;
                const logIndex = event.log.logIndex;

                const indexedEvent: IndexedEvent = {
                    type: 'Redeem',
                    user: redeemer,
                    token: token.symbol,
                    tokenAddress: token.address,
                    amount: redeemAmount,
                    tokenAmount: redeemTokens,
                    blockNumber,
                    blockTimestamp,
                    transactionHash: txHash,
                    logIndex
                };

                console.log(`[EVENT RECEIVED] Redeem event from ${contractName}:`, {
                    redeemer: redeemer,
                    amount: redeemAmount.toString(),
                    tokens: redeemTokens.toString(),
                    blockNumber: event.block.number.toString()
                });

                // Only store the event, don't update balances
                // Balance updates will be handled by the Transfer event
                await storeEvent(db, indexedEvent);

            } catch (error) {
                console.error(`[EVENT ERROR] ${errorContext}:`, error);
                await logError(error, errorContext);
            }
        });

        // Handle LiquidateBorrow events
        // @ts-ignore - Ignore type errors for dynamic event handler registration
        ponder.on(`${contractName}:LiquidateBorrow`, async ({ event, context }: { event: any; context: Context<any> }) => {
            const { liquidator, borrower } = event.args as LiquidateBorrowEvent;
            const errorContext = `LiquidateBorrow event error for token ${token.symbol} - Liquidator: ${liquidator}, Borrower: ${borrower}`;

            try {
                const { repayAmount, mTokenCollateral, seizeTokens } = event.args as LiquidateBorrowEvent;
                const { db } = context;
                const blockNumber = event.block.number;
                const blockTimestamp = event.block.timestamp;
                const txHash = event.transaction.hash;
                const logIndex = event.log.logIndex;

                const indexedEvent: IndexedEvent = {
                    type: 'LiquidateBorrow',
                    user: liquidator,
                    relatedAddress: borrower,
                    token: token.symbol,
                    tokenAddress: token.address,
                    amount: repayAmount,
                    tokenAmount: seizeTokens,
                    blockNumber,
                    blockTimestamp,
                    transactionHash: txHash,
                    logIndex
                };

                await storeEvent(db, indexedEvent);

                // Existing borrower's metrics
                let borrowerResult: any = await db.find(userMetrics, { userAddress: borrower });

                let borrowerTokenData: TokenData = ["0", "0"];

                if (borrowerResult !== null && borrowerResult !== undefined) {
                    let tokenArray = borrowerResult[token.symbol];
                    if (tokenArray !== null && tokenArray !== undefined && tokenArray.length === 2) {
                        borrowerTokenData = tokenArray as TokenData;
                        // For borrower, we need to subtract the repaid amount from their borrowed amount
                        const currentBorrow = BigInt(borrowerTokenData[1]);
                        const newBorrow = currentBorrow - repayAmount;
                        borrowerTokenData[1] = newBorrow.toString();
                    }
                }

                await db.insert(userMetrics).values({
                    userAddress: borrower,
                    [token.symbol]: borrowerTokenData,
                }).onConflictDoUpdate({
                    [token.symbol]: borrowerTokenData,
                });
            } catch (error) {
                console.error(`[EVENT ERROR] ${errorContext}:`, error);
                await logError(error, errorContext);
            }
        });

        // Handle Transfer events
        // @ts-ignore - Ignore type errors for dynamic event handler registration
        ponder.on(`${contractName}:Transfer`, async ({ event, context }: { event: any; context: Context<any> }) => {
            try {
                const { db } = context;
                const { from, to, amount } = event.args as TransferEvent;
                const blockNumber = event.block.number;
                const blockTimestamp = event.block.timestamp;
                const txHash = event.transaction.hash;
                const logIndex = event.log.logIndex;

                const indexedEvent: IndexedEvent = {
                    type: 'Transfer',
                    user: from,
                    relatedAddress: to !== from ? to : undefined,
                    token: token.symbol,
                    tokenAddress: token.address,
                    amount: amount,
                    blockNumber,
                    blockTimestamp,
                    transactionHash: txHash,
                    logIndex
                };

                console.log(`[EVENT PROCESSING] Updating metrics for ${from} and ${to} with token ${token.symbol}`);

                await storeEvent(db, indexedEvent);

                const zeroAddress = '0x0000000000000000000000000000000000000000';

                if (from === zeroAddress) {
                    // Mint: increase to's supplied
                    let toResult: any = await db.find(userMetrics, { userAddress: to });
                    let toTokenData: TokenData = ["0", "0"];
                    
                    if (toResult !== null && toResult !== undefined) {
                        let tokenArray = toResult[token.symbol];
                        if (tokenArray !== null && tokenArray !== undefined && tokenArray.length === 2) {
                            toTokenData = tokenArray as TokenData;
                        }
                    }
                    
                    toTokenData[0] = (BigInt(toTokenData[0]) + amount).toString();
                    
                    await db.insert(userMetrics).values({
                        userAddress: to,
                        [token.symbol]: toTokenData,
                    }).onConflictDoUpdate({
                        [token.symbol]: toTokenData,
                    });
                    
                    console.log(`[EVENT PROCESSING] Mint transfer: added ${amount} to ${to}, new balance: ${toTokenData[0]}`);
                } else if (to === zeroAddress) {
                    // Burn: decrease from's supplied
                    let fromResult: any = await db.find(userMetrics, { userAddress: from });
                    let fromTokenData: TokenData = ["0", "0"];
                    
                    if (fromResult !== null && fromResult !== undefined) {
                        let tokenArray = fromResult[token.symbol];
                        if (tokenArray !== null && tokenArray !== undefined && tokenArray.length === 2) {
                            fromTokenData = tokenArray as TokenData;
                        }
                    }
                    
                    const currentSupplied = BigInt(fromTokenData[0]);
                    if (currentSupplied >= amount) {
                        fromTokenData[0] = (currentSupplied - amount).toString();
                    } else {
                        console.error(`[BALANCE ERROR] Insufficient balance for burn: ${from} has ${currentSupplied}, trying to burn ${amount}`);
                        fromTokenData[0] = "0";
                    }
                    
                    await db.insert(userMetrics).values({
                        userAddress: from,
                        [token.symbol]: fromTokenData,
                    }).onConflictDoUpdate({
                        [token.symbol]: fromTokenData,
                    });
                    
                    console.log(`[EVENT PROCESSING] Burn transfer: removed ${amount} from ${from}, new balance: ${fromTokenData[0]}`);
                } else {
                    // Regular transfer: decrease from, increase to
                    let fromResult: any = await db.find(userMetrics, { userAddress: from });
                    let toResult: any = await db.find(userMetrics, { userAddress: to });
                    
                    let fromTokenData: TokenData = ["0", "0"];
                    let toTokenData: TokenData = ["0", "0"];
                    
                    if (fromResult !== null && fromResult !== undefined) {
                        let tokenArray = fromResult[token.symbol];
                        if (tokenArray !== null && tokenArray !== undefined && tokenArray.length === 2) {
                            fromTokenData = tokenArray as TokenData;
                        }
                    }
                    
                    if (toResult !== null && toResult !== undefined) {
                        let tokenArray = toResult[token.symbol];
                        if (tokenArray !== null && tokenArray !== undefined && tokenArray.length === 2) {
                            toTokenData = tokenArray as TokenData;
                        }
                    }
                    
                    const currentFromSupplied = BigInt(fromTokenData[0]);
                    if (currentFromSupplied >= amount) {
                        fromTokenData[0] = (currentFromSupplied - amount).toString();
                    } else {
                        console.error(`[BALANCE ERROR] Insufficient balance for transfer: ${from} has ${currentFromSupplied}, trying to transfer ${amount}`);
                        fromTokenData[0] = "0";
                    }
                    
                    toTokenData[0] = (BigInt(toTokenData[0]) + amount).toString();
                    
                    await db.insert(userMetrics).values({
                        userAddress: from,
                        [token.symbol]: fromTokenData,
                    }).onConflictDoUpdate({
                        [token.symbol]: fromTokenData,
                    });
                    
                    await db.insert(userMetrics).values({
                        userAddress: to,
                        [token.symbol]: toTokenData,
                    }).onConflictDoUpdate({
                        [token.symbol]: toTokenData,
                    });
                    
                    console.log(`[EVENT PROCESSING] Regular transfer: moved ${amount} from ${from} to ${to}, new balances: ${fromTokenData[0]} and ${toTokenData[0]}`);
                }
            } catch (error) {
                console.error(`[EVENT ERROR] Error processing Transfer event from ${contractName}:`, error);
                await logError(error, `Error processing Transfer event from ${contractName}`);
            }
        });
    });

    console.log("Event handlers successfully set up");
}

export async function storeEvent(db: any, event: IndexedEvent) {
    try {
        const id = `${event.transactionHash}-${event.logIndex}`;

        console.log(`[EVENT PROCESSING] Starting to process event:`, {
            type: event.type,
            user: event.user,
            token: event.token,
            amount: event.amount.toString(),
            blockNumber: event.blockNumber.toString()
        });

        // Store transaction details
        await db.insert(userTransactions).values({
            id,
            userAddress: event.user,
            mTokenAddress: event.tokenAddress,
            tokenSymbol: event.token,
            transactionType: event.type,
            amount: event.amount,
            tokenAmount: event.tokenAmount,
            relatedAddress: event.relatedAddress,
            blockNumber: event.blockNumber,
            blockTimestamp: event.blockTimestamp,
            transactionHash: event.transactionHash
        });

        console.log(`[DB] Successfully stored transaction for event ${id}`);

        // Update user address information
        await db.insert(userAddresses).values({
            userAddress: event.user,
            tokenSymbol: event.token,
            tokenAddress: event.tokenAddress
        }).onConflictDoNothing();

        console.log(`[DB] Successfully stored user address for ${event.user} with token ${event.token}`);

        // Handle related addresses (e.g., payer in RepayBorrow events)
        if (event.relatedAddress) {
            await db.insert(userAddresses).values({
                userAddress: event.relatedAddress,
                tokenSymbol: event.token,
                tokenAddress: event.tokenAddress
            }).onConflictDoNothing();

            console.log(`[DB] Successfully stored related address ${event.relatedAddress} with token ${event.token}`);
        }

        console.log(`[EVENT COMPLETE] Successfully processed ${event.type} event for user ${event.user} with token ${event.token}`);
    } catch (error) {
        const errorContext = `Failed to store event - Type: ${event.type}, User: ${event.user}, Token: ${event.token}`;
        console.error(`[DB ERROR] ${errorContext}:`, error);
        await logError(error, errorContext);
    }
}

setupEventHandlers();