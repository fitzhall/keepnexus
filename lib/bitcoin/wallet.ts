// Simple Bitcoin wallet interface - keeping it minimal
// For MVP, we'll mock the connection and show the UI flow

export interface WalletStatus {
  connected: boolean
  address?: string
  balance?: number // in sats
  type?: 'ledger' | 'trezor' | 'software' | 'multisig'
}

export class WalletService {
  private status: WalletStatus = {
    connected: false
  }

  // Mock connection for now - will integrate real wallets in next iteration
  async connect(): Promise<WalletStatus> {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simulate random connection failure (10% chance) for testing
    if (Math.random() < 0.1) {
      throw new Error('Failed to connect wallet. Please ensure your device is connected and unlocked.')
    }

    // Simulate timeout (5% chance)
    if (Math.random() < 0.05) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      throw new Error('Connection timeout. Please try again.')
    }

    this.status = {
      connected: true,
      address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      balance: 21000000, // 0.21 BTC in sats
      type: 'ledger'
    }

    return this.status
  }

  async disconnect(): Promise<void> {
    this.status = {
      connected: false
    }
  }

  getStatus(): WalletStatus {
    return this.status
  }

  // Format sats to BTC for display
  formatBTC(sats: number): string {
    return (sats / 100000000).toFixed(8).replace(/\.?0+$/, '')
  }

  // Check if this is a multisig setup
  isMultisig(): boolean {
    return this.status.type === 'multisig'
  }
}

export const walletService = new WalletService()