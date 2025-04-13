/**
 * Comprehensive type definitions for protocol events
 * 
 * Each event type represents a specific user action in the protocol:
 * - BorrowEvent: When a user borrows assets from the protocol
 * - RepayBorrowEvent: When a user repays borrowed assets
 * - MintEvent: When a user supplies assets to the protocol
 * - RedeemEvent: When a user withdraws supplied assets
 * - LiquidateBorrowEvent: When a position is liquidated due to health factor issues
 * 
 * Each event type includes relevant parameters such as:
 * - User addresses (borrower, payer, minter, redeemer, liquidator)
 * - Amount information (borrow amount, repay amount, mint amount, etc.)
 * - Protocol state updates (account borrows, total borrows, etc.)
 */
export type BorrowEvent = {
    borrower: `0x${string}`;
    borrowAmount: bigint;
    accountBorrows: bigint;
    totalBorrows: bigint;
};

export type RepayBorrowEvent = {
    payer: `0x${string}`;
    borrower: `0x${string}`;
    repayAmount: bigint;
    accountBorrows: bigint;
    totalBorrows: bigint;
};

export type MintEvent = {
    minter: `0x${string}`;
    mintAmount: bigint;
    mintTokens: bigint;
};

export type RedeemEvent = {
    redeemer: `0x${string}`;
    redeemAmount: bigint;
    redeemTokens: bigint;
};

export type LiquidateBorrowEvent = {
    liquidator: `0x${string}`;
    borrower: `0x${string}`;
    repayAmount: bigint;
    mTokenCollateral: `0x${string}`;
    seizeTokens: bigint;
};

export type TransferEvent = {
    from: `0x${string}`;
    to: `0x${string}`;
    amount: bigint;
};

export type NewCollateralFactorEvent = {
    mToken: `0x${string}`;
    oldCollateralFactorMantissa: bigint;
    newCollateralFactorMantissa: bigint;
};

/**
 * Supported event types in the protocol
 */
export type EventType = 'Mint' | 'Redeem' | 'Borrow' | 'RepayBorrow' | 'LiquidateBorrow' | 'Transfer' | 'NewCollateralFactor';

/**
 * Standardized structure for all indexed events
 * Used for consistent event processing and database storage
 */
export interface IndexedEvent {
    type: EventType;
    user: `0x${string}`;
    token: string;
    tokenAddress: `0x${string}`;
    amount: bigint;
    tokenAmount?: bigint;
    relatedAddress?: `0x${string}`;
    blockNumber: bigint;
    blockTimestamp: bigint;
    transactionHash: `0x${string}`;
    logIndex: number;
}

/**
 * Token data structure
 * Represents the data for a specific token in the user's position
 * Contains the following fields:
 * - amountSupplied: The amount of the token supplied by the user
 * - amountBorrowed: The amount of the token borrowed by the user
 * - collateralFactor: The collateral factor of the token
 * - borrowLimit: The borrow limit of the token
 */
export type TokenData = [string, string]; // [amountSupplied, amountBorrowed]

export type UserPosition = {
    userAddress: `0x${string}`;
    totalAmountSupplied: bigint | null;
    totalAmountBorrowed: bigint | null;
    effectiveBorrowLimit: bigint | null;
    healthFactor: number | null;
} & {
    [key: string]: TokenData | bigint | number | null | `0x${string}` | undefined;
};
