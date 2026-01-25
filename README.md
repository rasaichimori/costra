# Costra

**A simple tool to understand your costs and protect your margins.**

Costra is a free, privacy-first cost calculator built for restaurants, bakeries, cafes, and food manufacturers. Track ingredient costs, build recipes, and see exactly where your money goes—all without creating an account or paying a subscription.

## Features

- **Layer by Layer** — Break down complex recipes into individual components. See exactly where your money goes.
- **Instant Updates** — Change an ingredient price and watch it ripple through every recipe automatically.
- **Margin Clarity** — Set your target margins and instantly see which products are hitting the mark.
- **Compound Recipes** — Build recipes from other recipes. Perfect for bakeries, restaurants, and manufacturers.

## Why Free?

Your data stays in your browser. No backend, no servers, no costs to pass on. Built as a passion project by someone who needed it for their own restaurant.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) with Svelte 5
- TypeScript
- Vite
- Chart.js for visualizations

## Getting Started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/costra.git
cd costra

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev

# Start and open in browser
npm run dev -- --open
```

### Building

```bash
# Create a production build
npm run build

# Preview the production build
npm run preview
```

## Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run end-to-end tests
npm run test:e2e
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Run Svelte type checking |
| `npm run lint` | Run Prettier and ESLint |
| `npm run format` | Format code with Prettier |
| `npm run test` | Run all tests |
| `npm run test:unit` | Run unit tests with Vitest |
| `npm run test:e2e` | Run E2E tests with Playwright |

## License

MIT
