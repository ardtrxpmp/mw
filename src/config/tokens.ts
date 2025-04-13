/**
 * Token Configuration Interface
 * 
 * Defines the structure for token configuration in the Moonwell Protocol.
 * Each token in the protocol must have these properties defined:
 * 
 * @property address - The Ethereum address of the token contract on Base network
 * @property decimals - Number of decimal places for token amounts (e.g., 18 for ETH, 6 for USDC)
 * @property symbol - The trading symbol of the token (e.g., "WETH", "USDC")
 */
export interface TokenConfig {
    address: `0x${string}`;
    decimals: number;
    symbol: string;
  }
  
  /**
   * Comprehensive list of supported tokens in the Moonwell Protocol on Base network
   * 
   * This array contains all tokens that can be:
   * - Supplied as collateral
   * - Borrowed by users
   * - Used for liquidations
   * 
   * Token categories include:
   * 1. Stablecoins:
   *    - DAI, USDC, USDbC, USDS, EURC
   * 2. Wrapped ETH variants:
   *    - WETH, cbETH, wstETH, rETH, weETH, wrsETH
   * 3. Bitcoin variants:
   *    - cbBTC, tBTC, LBTC
   * 4. Protocol tokens:
   *    - WELL (Moonwell's governance token)
   *    - AERO (Aerodrome's governance token)
   * 5. Special tokens:
   *    - VIRTUAL
   * 
   * Each token entry includes:
   * - Contract address on Base network
   * - Decimal places for amount calculations
   * - Standard trading symbol
   */
  export const TOKENS: TokenConfig[] = [
    {
      address: "0x73b06D8d18De422E269645eaCe15400DE7462417",
      decimals: 18,
      symbol: "DAI"
    },
    {
      address: "0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22",
      decimals: 6,
      symbol: "USDC"
    },
    {
      address: "0x703843C3379b52F9FF486c9f5892218d2a065cC8",
      decimals: 6,
      symbol: "USDbC"
    },
    {
      address: "0x628ff693426583D9a7FB391E54366292F509D457",
      decimals: 18,
      symbol: "WETH"
    },
    {
      address: "0x3bf93770f2d4a794c3d9EBEfBAeBAE2a8f09A5E5",
      decimals: 18,
      symbol: "cbETH"
    },
    {
      address: "0x627Fe393Bc6EdDA28e99AE648fD6fF362514304b",
      decimals: 18,
      symbol: "wstETH"
    },
    {
      address: "0xcb1dacd30638ae38f2b94ea64f066045b7d45f44",
      decimals: 18,
      symbol: "rETH"
    },
    {
      address: "0xb8051464C8c92209C92F3a4CD9C73746C4c3CFb3",
      decimals: 18,
      symbol: "weETH"
    },
    {
      address: "0x73902f619CEB9B31FD8EFecf435CbDf89E369Ba6",
      decimals: 18,
      symbol: "AERO"
    },
    {
      address: "0xF877ACaFA28c19b96727966690b2f44d35aD5976",
      decimals: 8,
      symbol: "cbBTC"
    },
    {
      address: "0xb682c840B5F4FC58B20769E691A6fa1305A501a2",
      decimals: 6,
      symbol: "EURC"
    },
    {
      address: "0xfC41B49d064Ac646015b459C522820DB9472F4B5",
      decimals: 18,
      symbol: "wrsETH"
    },
    {
      address: "0xdC7810B47eAAb250De623F0eE07764afa5F71ED1",
      decimals: 18,
      symbol: "WELL"
    },
    {
      address: "0xb6419c6C2e60c4025D6D06eE4F913ce89425a357",
      decimals: 6,
      symbol: "USDS"
    },
    {
      address: "0x9A858ebfF1bEb0D3495BB0e2897c1528eD84A218",
      decimals: 8,
      symbol: "tBTC"
    },
    {
      address: "0x10fF57877b79e9bd949B3815220eC87B9fc5D2ee",
      decimals: 8,
      symbol: "LBTC"
    },
    {
      address: "0xdE8Df9d942D78edE3Ca06e60712582F79CFfFC64",
      decimals: 18,
      symbol: "VIRTUAL"
    }
  ]; 