# KeepNexus - The 9-minute Bitcoin Governance OS

Turn any Bitcoin stack into a self-driving trust that texts your heirs, your lawyer, and your CPA—automatically.

## Overview

KeepNexus is a revolutionary Bitcoin inheritance and governance platform that automates estate planning, legal documentation, multi-signature security, and beneficiary management through a simple, futuristic web interface.

### Key Features

- **9-minute setup** - Complete inheritance planning in minutes, not weeks
- **KEEP Engine** - Four-pillar governance system:
  - **K**eep it Secure (multisig, Shamir shards)
  - **E**stablish Legal Protection (revocable trusts, beneficiaries)
  - **E**nsure Access (heir education, inheritance drills)
  - **P**lan for the Future (CPA reporting, regulatory monitoring)
- **The Governator™** - Visual matrix for defining all governance rules
- **Threat Score** - Real-time dashboard showing security status
- **Automated Notifications** - SMS/email alerts to heirs, lawyers, and CPAs

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React 18 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion (futuristic glass morphism theme)
- **Backend**: Supabase
- **Bitcoin**: Keep Framework + Multisig wallets
- **Storage**: Lit Protocol + IPFS
- **Notifications**: Twilio + Zapier
- **Documents**: React PDF + DocuSign

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account
- Twilio account (for SMS)
- DocuSign account (for e-signatures)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/keepnexus.git
cd keepnexus
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
keepnexus/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # Base UI components
│   ├── animations/     # Framer Motion animations
│   ├── dashboard/      # Dashboard components
│   ├── governator/     # Governator matrix
│   └── bitcoin/        # Bitcoin-specific components
├── lib/                 # Core libraries
│   ├── bitcoin/        # Bitcoin operations
│   ├── keep/           # Keep Framework integration
│   ├── supabase/       # Database client
│   └── utils/          # Utilities
├── hooks/               # Custom React hooks
├── styles/              # Styling system
└── types/               # TypeScript types
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler check
- `npm run format` - Format code with Prettier

### Code Style

- TypeScript with strict mode enabled
- ESLint + Prettier for code formatting
- Tailwind CSS for styling
- Conventional commits for git messages

## Design System

Our futuristic design system features:

- **Dark theme first** with glass morphism effects
- **Electric color palette** (cyan/purple gradients)
- **Smooth micro-animations** using Framer Motion
- **Monospace typography** for technical feel
- **Subtle glow effects** on interactive elements

## Security

- All Bitcoin operations use multisig wallets
- Shamir secret sharing for key recovery
- End-to-end encryption for sensitive data
- Regular security audits
- No single points of failure

## License

Copyright © 2025 KeepNexus Team. All rights reserved.

## Support

For support, email support@keep.co or create an issue in this repository.

## Roadmap

### Version 1.0 (Ship Day)
- [x] Core KEEP engine
- [x] Basic dashboard
- [x] 9-minute setup flow
- [ ] Beta testing with 100 users

### Version 1.1 (Pro Playbook)
- [ ] Service tiers (Nexus/Captain/Family Office)
- [ ] 48-hour professional workflow
- [ ] White-glove service option

### Version 1.2 (The Governator)
- [ ] 4-column governance matrix
- [ ] Drag-and-drop rule builder
- [ ] On-chain rule deployment

---

**Built with passion for the Bitcoin community**