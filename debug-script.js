// Debug script to run in browser console
// First clear localStorage to start fresh
localStorage.clear()
console.log('🔄 Cleared localStorage')

// Reload the page to get fresh demo data
console.log('📄 Please reload the page (Cmd+R) to see debug logs')

// After reload, run this to check the state:
// Check localStorage
const stored = localStorage.getItem('keep_little_shard')
if (stored) {
  const data = JSON.parse(stored)
  console.log('📦 LocalStorage data:', {
    keyholders: data.keyholders?.length || 0,
    wallets: data.wallets?.length || 0,
    familyName: data.family_name
  })
  console.log('👥 Keyholders:', data.keyholders)
}

console.log('ℹ️ Navigate to the RISK tab to see the matrix')
console.log('ℹ️ Check console for [KEEPScorePage] and [SimpleRiskMatrix] logs')