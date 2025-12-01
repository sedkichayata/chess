# Chess

A modern chess application with mobile and web platforms built with React Native (Expo) and React Router.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

Chess is a full-stack chess application providing a seamless experience across mobile and web platforms. Built with modern technologies and best practices, it offers a robust foundation for chess gameplay and community features.

## Features

- **Cross-Platform**: Native mobile app (iOS & Android) and responsive web application
- **Modern UI**: Beautiful, intuitive interface with smooth animations
- **Real-time Gameplay**: Play chess with real-time move synchronization
- **User Authentication**: Secure authentication system
- **Cloud Integration**: Cloud-based storage and synchronization
- **Performance Optimized**: Fast load times and smooth interactions

## Tech Stack

### Mobile App (Expo/React Native)
- **Framework**: React Native 0.79.3 with Expo SDK 53
- **Navigation**: Expo Router 5.1.0
- **UI Components**: Custom components with react-native-reanimated
- **State Management**: Zustand
- **API Client**: TanStack React Query
- **Graphics**: Three.js with expo-three for 3D rendering
- **Maps**: React Native Maps
- **TypeScript**: Full type safety

### Web App (React Router)
- **Framework**: React Router 7.6.0
- **UI Library**: Chakra UI 2.8.2
- **Styling**: Tailwind CSS 3.x
- **State Management**: Zustand
- **API Client**: TanStack React Query
- **Backend**: Hono with Auth.js
- **Database**: Neon (PostgreSQL)
- **Payment**: Stripe integration
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- For mobile development: Expo CLI
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sedkichayata/chess.git
   cd chess
   ```

2. **Install dependencies for mobile app**
   ```bash
   cd apps/mobile
   npm install
   ```

3. **Install dependencies for web app**
   ```bash
   cd apps/web
   npm install
   ```

### Running the Applications

#### Mobile App

```bash
cd apps/mobile
npm start
```

This will start the Expo development server. You can then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your device

#### Web App

```bash
cd apps/web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
chess/
├── apps/
│   ├── mobile/              # React Native mobile app
│   │   ├── src/
│   │   │   ├── app/        # Expo Router pages
│   │   │   └── components/ # React components
│   │   ├── package.json
│   │   └── app.json
│   └── web/                # React Router web app
│       ├── src/
│       │   ├── app/        # React Router pages
│       │   │   └── api/    # API routes
│       │   └── components/ # React components
│       └── package.json
├── .github/                # GitHub configuration
│   ├── ISSUE_TEMPLATE/    # Issue templates
│   └── workflows/         # CI/CD workflows
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── SECURITY.md
└── README.md
```

## Development

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Follow the conventions in [CONTRIBUTING.md](CONTRIBUTING.md)

### Testing

```bash
# Mobile app
cd apps/mobile
npm test

# Web app
cd apps/web
npm test
```

### Type Checking

```bash
# Mobile app
cd apps/mobile
npx tsc --noEmit

# Web app
cd apps/web
npm run typecheck
```

### Building for Production

#### Mobile App

```bash
cd apps/mobile
# iOS
eas build --platform ios
# Android
eas build --platform android
```

#### Web App

```bash
cd apps/web
npm run build
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and type checks
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Code of Conduct

This project adheres to our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Security

Please review our [Security Policy](SECURITY.md) for information on reporting security vulnerabilities.

## Roadmap

- [ ] Tournament system
- [ ] AI opponent integration
- [ ] Advanced analytics
- [ ] Social features
- [ ] Puzzle mode
- [ ] Training modules

## Support

- **Issues**: [GitHub Issues](https://github.com/sedkichayata/chess/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sedkichayata/chess/discussions)

## Acknowledgments

- Built with [Expo](https://expo.dev)
- Built with [React Router](https://reactrouter.com)
- UI components from [Chakra UI](https://chakra-ui.com)
- Icons from [Lucide](https://lucide.dev)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ♟️ by the Chess Team
