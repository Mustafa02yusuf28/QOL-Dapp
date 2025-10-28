/**
 * Script to create $QOL token on Solana
 * Run this to create your token mint and get started
 */

import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { 
  createMint,
  getMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// Use Devnet for testing
const RPC_ENDPOINT = 'https://api.devnet.solana.com';
const connection = new Connection(RPC_ENDPOINT, 'confirmed');

// Configuration
const TOKEN_DECIMALS = 6; // Standard for most tokens
const INITIAL_SUPPLY = 10_000_000; // 10 million tokens

async function createQOLToken() {
  try {
    console.log('🚀 Starting $QOL Token Creation...\n');

    // You need to create/fund a keypair for the mint authority
    // Option 1: Use your wallet's keypair
    // Option 2: Generate a new keypair (for this demo)
    
    console.log('⚠️  NOTE: You need to provide a keypair with SOL to create the token.');
    console.log('Option 1: Use your Phantom wallet');
    console.log('Option 2: Generate a new keypair and fund it from solana.com/airdrop\n');

    // Generate new keypair for this demo
    const mintKeypair = Keypair.generate();
    console.log('Generated Mint Keypair:', mintKeypair.publicKey.toString());
    console.log('⚠️  Save this private key securely for production!\n');

    // For demo purposes, we'll just show what needs to be done
    console.log('To create the token, you need to:');
    console.log('1. Fund the mintKeypair with SOL (for rent and fees)');
    console.log('2. Call createMint() function');
    console.log('3. Transfer the mint authority to your treasury wallet\n');

    console.log('Example code to create mint:');
    console.log(`
const mint = await createMint(
  connection,
  feePayer,      // Your funded wallet
  mintAuthority,  // Public key that can mint more tokens
  null,          // Optional freeze authority
  TOKEN_DECIMALS // 6 decimals
);

console.log('Token Mint Address:', mint.toString());
    `);

    console.log('\n📝 Steps to create your token:');
    console.log('1. Get your treasury wallet private key (Phantom export or new keypair)');
    console.log('2. Fund it with SOL from https://faucet.solana.com');
    console.log('3. Update create-token.ts with your keypair');
    console.log('4. Run: npx ts-node scripts/create-token.ts\n');

    return null;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Uncomment and configure to actually create the token
// To use this script, you need to:
// 1. Get a funded wallet
// 2. Update the keypair below
// 3. Run: npx ts-node scripts/create-token.ts

/*
const YOUR_TREASURY_KEYPAIR = Keypair.fromSecretKey(Uint8Array.from([your secret key]));

async function createQOLToken() {
  const connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  // Your treasury wallet (needs to be funded with SOL)
  const feePayer = YOUR_TREASURY_KEYPAIR;
  
  // Create the mint
  const mint = await createMint(
    connection,
    feePayer,           // Payer for the transaction
    feePayer.publicKey, // Mint authority (can create more tokens)
    null,               // Freeze authority (null = no freeze)
    TOKEN_DECIMALS
  );
  
  console.log('✅ Token created!');
  console.log('Mint Address:', mint.toString());
  console.log('\nSave this mint address in your .env file:');
  console.log(`REACT_APP_TOKEN_MINT=${mint.toString()}\n`);
  
  // Optional: Mint initial supply to treasury
  const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    feePayer,
    mint,
    feePayer.publicKey
  );
  
  await mintTo(
    connection,
    feePayer,
    mint,
    treasuryTokenAccount.address,
    feePayer,
    INITIAL_SUPPLY * 10 ** TOKEN_DECIMALS
  );
  
  console.log('✅ Initial supply minted to treasury');
  
  return mint;
}

createQOLToken();
*/

export { createQOLToken };

