import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  getAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Token configuration
export const TOKEN_MINT = new PublicKey('7nksWK6rfJHxQE4TxfUCNjqgaBNXKtLvpAqjHjLW9HpZ'); // Devnet SPL Token (you can replace with your own)
export const RPC_ENDPOINT = 'https://api.devnet.solana.com'; // Using Devnet for testing

// For production, use mainnet:
// export const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

/**
 * Get or create an associated token account for a user
 */
export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> {
  const associatedToken = await getAssociatedTokenAddress(mint, owner, false);
  
  // Check if the account exists
  try {
    await getAccount(connection, associatedToken);
    return associatedToken;
  } catch (err: any) {
    // Account doesn't exist, we'll need to create it in the transfer
    // Return the address so caller knows where to transfer
    return associatedToken;
  }
}

/**
 * Send tokens to a user's wallet
 * This function handles:
 * 1. Checking if user has an associated token account
 * 2. Creating it if needed
 * 3. Transferring tokens from the treasury to the user
 * 
 * NOTE: Currently uses simulated transfers. To enable real transfers:
 * 1. Configure your treasury wallet keypair in environment variables
 * 2. Uncomment and implement the real transaction code below
 */
export async function sendTokensToUser(
  recipientAddress: string,
  amount: number,
  treasuryAddress: string, // Your treasury wallet that holds the tokens
  treasuryPrivateKey?: Uint8Array // For automated transfers
): Promise<{ success: boolean; signature?: string; error?: string }> {
  try {
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const recipient = new PublicKey(recipientAddress);
    const treasury = new PublicKey(treasuryAddress);

    // Get or create associated token account
    const associatedTokenAddress = await getAssociatedTokenAddress(
      TOKEN_MINT,
      recipient
    );

    // TODO: IMPLEMENT REAL TOKEN TRANSFER
    // To enable real token transfers, you need to:
    // 1. Get treasury token account
    // 2. Check if recipient token account exists
    // 3. Create ATA if needed
    // 4. Add transfer instruction
    // 5. Sign with treasury keypair and send
    // See IMPLEMENT_REAL_TOKENS.md for full implementation guide

    // FOR NOW: Return simulated response
    console.log('💰 Simulated token transfer:', {
      recipient: recipientAddress,
      amount: `${amount} $QOL`,
      tokenAccount: associatedTokenAddress.toString()
    });

    return {
      success: true,
      signature: 'simulated_' + Date.now().toString(),
      error: undefined
    };
  } catch (err: any) {
    console.error('Token transfer error:', err);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Get user's token balance
 */
export async function getUserTokenBalance(
  userAddress: string
): Promise<number> {
  try {
    const connection = new Connection(RPC_ENDPOINT, 'confirmed');
    const userPublicKey = new PublicKey(userAddress);
    
    const associatedTokenAddress = await getAssociatedTokenAddress(
      TOKEN_MINT,
      userPublicKey
    );

    try {
      const accountInfo = await getAccount(connection, associatedTokenAddress);
      // Convert from token units to actual amount (adjust decimals as needed)
      return Number(accountInfo.amount) / 1_000_000; // Assuming 6 decimals
    } catch {
      return 0; // No token account
    }
  } catch (err) {
    console.error('Error getting token balance:', err);
    return 0;
  }
}

/**
 * Create and fund an associated token account for a user
 * This requires the treasury wallet to fund the creation
 */
export async function createAssociatedTokenAccountForUser(
  userAddress: string,
  treasuryKeypair: any // Keypair that will pay for the creation
): Promise<string> {
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  const userPublicKey = new PublicKey(userAddress);
  
  const associatedTokenAddress = await getAssociatedTokenAddress(
    TOKEN_MINT,
    userPublicKey
  );

  // Check if already exists
  try {
    await getAccount(connection, associatedTokenAddress);
    return associatedTokenAddress.toString();
  } catch {
    // Create it
    // This would typically be done as part of a transaction
    // For now, return the address
    return associatedTokenAddress.toString();
  }
}

