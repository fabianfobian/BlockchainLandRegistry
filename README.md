# BlockchainLandRegistry
A modern solution for land registration, verification, and ownership transfer, powered by blockchain technology with government approval.

## Features

- **Immutable Records**: Once verified, land ownership records cannot be altered, providing unquestionable proof of ownership
- **Government Verification**: All land registrations and transfers are verified by authorized government officials
- **Secure Transactions**: Smart contracts with escrow functionality protect buying and selling
- **Complete Transparency**: Track registration and transfer status with blockchain verification

## User Roles

- **Land Owner**: Register land and list properties for sale
- **Buyer**: Browse and purchase verified properties
- **Verifier**: Government officials who verify land registrations and transfers
- **Admin**: System administrators managing users and monitoring operations
- **General Visitor**: Browse public property listings

## Screenshots

### Authentication
![Registration part](https://github.com/user-attachments/assets/bfff443c-7ecb-490e-ad95-b276186be91d)
![Login interface](https://github.com/user-attachments/assets/a89bd89a-d3fa-4584-aa54-dae15bccbc1c)

*Login and registration interface for users*

### Dashboard Views

#### Land Owner Dashboard
![Land Owner Dashboard]
*Property management and listing interface for land owners*
![image](https://github.com/user-attachments/assets/2129d580-57a8-4ffa-a1a0-e68ad4b57463)
![image](https://github.com/user-attachments/assets/871ab292-3cd4-431f-a4b3-f4a7b10d8f8d)
![image](https://github.com/user-attachments/assets/d2d2c451-d5fa-4e40-8c84-1d4fb4d03df3)
![image](https://github.com/user-attachments/assets/1ae08bbd-e385-4f8b-83d5-55a69012d61f)
![image](https://github.com/user-attachments/assets/dcc1204c-3966-42a6-a22a-5f9b80ed714e)
![image](https://github.com/user-attachments/assets/38ba826c-ccc4-4fb5-8207-259fbe4e04c2)
![image](https://github.com/user-attachments/assets/4eb21f2e-f663-4817-864d-3ccc08fe3e8f)

#### Buyer Dashboard
![Buyer Dashboard](https://github.com/user-attachments/assets/5dee901f-15ae-4e95-9f0b-6e9d824970cb)

*Property browsing and purchase management for buyers*
...
![image](https://github.com/user-attachments/assets/f5b7f0e1-9718-4ec4-99f6-8ce1b579a761)

...
![image](https://github.com/user-attachments/assets/a5202e94-adfe-45c4-b50f-37619f71ea56)

...
#### Verifier Dashboard
![Verifier Dashboard](https://github.com/user-attachments/assets/e755aa91-ee88-460d-8c85-b1f9b68c99d7)

*Verification queue and history for government officials*

#### Admin Dashboard
![Admin Dashboard](https://github.com/user-attachments/assets/96db4de6-97c2-4ab3-875a-45fa4afb7fc0)

*System analytics and user management for administrators*

### Key Workflows

#### Land Registration
![Land Registration](https://docimg.replit.com/images/land-registration.png)
*Step-by-step land registration process*

#### Property Transfer
![Property Transfer](https://docimg.replit.com/images/property-transfer.png)
*Secure property transfer workflow*

## Tech Stack

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Smart contracts for land ownership NFTs
- **Storage**: IPFS for property documents

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- Other required environment variables (see `.env.example`)

3. Run database migrations:
```bash
npm run migrate
```

4. Start the development server:
```bash
npm run dev
```

## Workflow

1. **Land Registration**
   - Owner submits land details and documents
   - Government verifier reviews and approves/rejects
   - Upon approval, NFT is minted

2. **Property Transfer**
   - Owner lists property for sale
   - Buyer initiates purchase
   - Payment held in escrow
   - Government verifier approves transfer
   - NFT ownership transferred to buyer

## Development

The project uses:
- Drizzle ORM for database operations
- React Query for data fetching
- Shadcn UI components
- TypeScript for type safety

## Security

- Authentication required for sensitive operations
- Role-based access control
- Secure session management
- Environment variables for sensitive data
- Smart contract security measures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved.
