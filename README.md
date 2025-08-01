# Connection Sorter 🎭

A playful, interactive web application that helps you "organize" your social connections with style. Because even your social network needs organization!

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC)

## Overview

Connection Sorter is a fun, animated demo application that displays a list of fictional people (represented by emojis) and allows users to shuffle or sort them alphabetically. Built with the latest web technologies, it features smooth animations and an interactive mouse-following background effect.

## Features

- 🔀 **Shuffle Connections**: Randomize your connection list with a single click
- 🔤 **Sort A-Z**: Organize connections alphabetically
- ✨ **Interactive Background**: Animated gradient that follows your mouse movements
- 🎨 **Smooth Animations**: Polished UI transitions and hover effects
- 📱 **Fully Responsive**: Works beautifully on all device sizes

## Tech Stack

- **Framework**: [Next.js 15.4.5](https://nextjs.org/) with App Router
- **UI Library**: [React 19.1.0](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with PostCSS
- **Font**: [Geist](https://vercel.com/font) by Vercel
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation

1. Clone the repository (if not already in the project):
   ```bash
   git clone [repository-url]
   cd connection-sorter
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
connection-sorter/
├── src/
│   └── app/
│       ├── page.tsx        # Main application component
│       ├── layout.tsx      # Root layout with metadata
│       └── globals.css     # Global styles (Tailwind imports)
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # You are here!
```

## Key Implementation Details

### Main Component (`src/app/page.tsx`)

The entire application is contained in a single component that:
- Manages the connection list state using React hooks
- Implements shuffle and sort algorithms
- Creates animated background effects with mouse tracking
- Uses CSS-in-JS for complex animations

### Styling Approach

- **Tailwind CSS v4**: For utility-first styling
- **Styled JSX**: For keyframe animations and dynamic styles
- **Glass Morphism**: Modern UI design with backdrop blur effects
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

### Performance Optimizations

- Minimal dependencies for fast load times
- No external API calls or database connections
- Efficient state management with React hooks
- Optimized animations using CSS transforms

## Deployment

This app is designed for easy deployment on Vercel:

1. Push your changes to the repository
2. Connect the repository to Vercel
3. Deploy with zero configuration needed

No environment variables or special configuration required!

## Future Enhancements

As promised in the app, coming soon:
- 🎭 Sort by vibes
- ⚡ Sort by energy levels
- ☕ Sort by coffee preferences
- 🔗 Real connection integration
- 📊 Connection analytics

## Contributing

Feel free to submit issues and enhancement requests!

## License

Part of the Purpose Coach project. See the main project repository for license information.

---

Made with ❤️ and a sense of humor