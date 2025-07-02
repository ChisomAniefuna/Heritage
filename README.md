# Heritage Vault - Digital Inheritance Management

A comprehensive digital inheritance management platform with AI-powered voice and video messaging, secure asset tracking, and automated beneficiary notifications.

## Features

### 🏦 **Professional Asset Management**
- Comprehensive asset tracking (financial, property, digital, personal, legal)
- Voice-guided asset entry with natural language processing
- Secure document storage with conditional access controls
- Bank statement NFT creation and blockchain storage

### 🤖 **AI-Enhanced Personal Messaging**
- **Voice Messages**: Generate personalized audio messages using ElevenLabs AI
- **Avatar Videos**: Create lifelike video messages with Tavus AI avatars
- **Cultural Awareness**: Support for diverse cultural identities and representations
- **Multilingual Support**: Voice messages in multiple languages

### 🔒 **Advanced Security & Privacy**
- Bank-level encryption and security protocols
- Enhanced privacy preferences with professional contact options
- Conditional release mechanisms with time delays and verification
- Row-level security with Supabase

### 📧 **Smart Check-in System**
- 6-month automated check-ins to verify user status
- Enhanced privacy controls (professional contacts only, inheritance-only mode)
- Automated notifications with respect for user privacy preferences
- Push notifications and email alerts

### 🏗️ **Blockchain Integration**
- Bank statement NFT creation with IPFS storage
- Ethereum/Polygon blockchain support
- OpenSea marketplace compatibility
- Immutable financial record keeping

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for development and building

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Real-time subscriptions** for live updates

### AI & Media Services
- **ElevenLabs** for voice synthesis and recognition
- **Tavus** for AI avatar video generation
- **IPFS/Pinata** for decentralized file storage

### Blockchain
- **Ethers.js** for blockchain interactions
- **Smart contracts** for NFT creation
- **IPFS** for metadata and file storage

### Notifications
- **Web Push API** for browser notifications
- **SendGrid/Mailgun** for email notifications
- **Service Workers** for offline functionality

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- ElevenLabs API key (optional, for voice features)
- Tavus API key (optional, for avatar features)
- Pinata account (optional, for IPFS storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd heritage-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys and configuration:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key
   VITE_TAVUS_API_KEY=your_tavus_api_key
   # ... other keys
   ```

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration file in `supabase/migrations/001_initial_schema.sql`
   - Enable Row Level Security (RLS) policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Database Setup

The application uses Supabase with the following main tables:
- `users` - User profiles and account information
- `assets` - User assets and inheritance items
- `contacts` - Beneficiaries and emergency contacts
- `documents` - Important documents and files
- `checkin_records` - 6-month check-in tracking
- `bank_statements` - Bank statement NFT records

Run the migration file to set up the complete schema with RLS policies.

## Key Features Explained

### Enhanced Privacy System
Users can configure detailed privacy preferences:
- **Professional Contacts Only**: Alert only lawyers, doctors, etc.
- **Inheritance-Only Mode**: Skip wellness checks entirely
- **Separate Messaging**: Different messages for professionals vs. family
- **Custom Instructions**: Personalized guidance for different contact types

### AI Voice & Avatar Messages
- **Voice Synthesis**: Convert text to speech using your voice profile
- **Avatar Creation**: Generate lifelike video messages
- **Cultural Representation**: Diverse avatar options with cultural awareness
- **Multilingual Support**: Messages in multiple languages

### Bank Statement NFTs
- **Automated Scanning**: Monthly email scanning for bank statements
- **NFT Creation**: Convert statements to unique blockchain assets
- **IPFS Storage**: Decentralized file storage with metadata
- **OpenSea Integration**: View and trade statement NFTs

### Conditional Release System
- **Time Delays**: Release assets after specified periods
- **Multi-Party Approval**: Require multiple approvers
- **Legal Verification**: Require death certificates or legal documents
- **Age Requirements**: Beneficiaries must reach certain ages
- **Knowledge Tests**: Custom tests to verify understanding

## API Integrations

### Supabase
- Authentication and user management
- Real-time database with RLS
- File storage and CDN

### ElevenLabs
- Voice synthesis and cloning
- Speech-to-text recognition
- Multilingual voice generation

### Tavus
- AI avatar creation and training
- Video message generation
- Cultural representation options

### IPFS/Pinata
- Decentralized file storage
- NFT metadata hosting
- Permanent file preservation

## Security Features

- **End-to-end encryption** for sensitive data
- **Row Level Security (RLS)** for database access
- **Multi-factor authentication** support
- **Secure API key management**
- **Privacy-first design** with granular controls

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@heritagevault.com or join our Discord community.

---

**Heritage Vault** - Securing your family's digital heritage with professional-grade tools and AI-enhanced personal messaging.