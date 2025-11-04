/**
 * Risk Simulator - Demo Data
 * Hardcoded Chen Family 3-of-5 multisig setup for Phase 1 demo
 */

import { MultisigSetup } from './types'

/**
 * Chen Family 3-of-5 Multisig Setup
 * Standard estate planning configuration used for demo
 */
export const CHEN_FAMILY_SETUP: MultisigSetup = {
  threshold: 3,
  totalKeys: 5,
  family: 'Chen Family',
  createdAt: new Date('2024-11-01'),
  keys: [
    {
      id: 'key-1',
      holder: 'Dad',
      type: 'full',
      storage: 'hardware-wallet',
      location: 'Home safe'
    },
    {
      id: 'key-2',
      holder: 'Mom',
      type: 'full',
      storage: 'hardware-wallet',
      location: 'Home safe'
    },
    {
      id: 'key-3',
      holder: 'Child A',
      type: 'full',
      storage: 'paper',
      location: "Child's possession"
    },
    {
      id: 'key-4',
      holder: 'Bank Vault',
      type: 'full',
      storage: 'paper',
      location: 'Bank safety deposit box'
    },
    {
      id: 'key-5',
      holder: 'Lawyer',
      type: 'full',
      storage: 'paper',
      location: 'Law office vault'
    }
  ]
}
