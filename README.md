# 📈 TradeOS

TradeOS is a modern, high-performance web application designed for stock market traders and investors. It provides a comprehensive suite of tools including portfolio management, market scanning, risk analysis, trade journaling, and an AI-powered trading coach—all built on a bleeding-edge technology stack.

## 🚀 Features

- **Dashboard**: Get a bird's-eye view of the market, your portfolio performance, and recent activity.
- **Stock Scanner**: Filter and discover trading opportunities using advanced criteria.
- **Portfolio Management**: Track your assets, monitor allocations, and measure performance over time.
- **Risk Management**: Calculate position sizing and manage trade risk effectively.
- **Trade Journal**: Log your trades, record your thoughts, and review past performance to improve your edge.
- **Market Brief**: Stay updated with the latest market news and financial data.
- **AI Coach**: Leverage Google Gemini AI for intelligent trading insights, portfolio feedback, and personalized learning.
- **Academy**: Educational resources and tutorials for traders of all skill levels.
- **Real-time Alerts**: Setup and manage custom alerts for price movements and market events.

## 🛠️ Technology Stack

TradeOS is built using modern, type-safe, and highly scalable technologies:

- **Framework**: [TanStack Start](https://tanstack.com/start) with [React 19](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) (Radix Primitives)
- **Database**: [Neon Serverless Postgres](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Financial Data**: [Yahoo Finance 2](https://github.com/gadicc/node-yahoo-finance2)
- **AI Integration**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📦 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [Bun](https://bun.sh/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TanishqBhosle/TradeOs.git
   cd TradeOs
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add your keys (e.g., Database URL, Better Auth secret, Gemini API key, etc.).
   *Note: Never commit your `.env` file to version control.*

4. **Run Database Migrations (Drizzle):**
   ```bash
   npx drizzle-kit push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

   The app will be available at `http://localhost:3000` (or the port specified by Vite).

## 🏗️ Project Structure

- `src/routes/`: Contains all the application pages utilizing TanStack file-based routing.
- `src/components/`: Reusable UI components (including shadcn/ui).
- `src/server/`: Backend logic, database schema, and server functions.
- `src/functions/`: Domain-specific business logic for features like portfolio, risk, and academy.
- `src/lib/`: Utility functions, API helpers, and configuration files.

## 📜 Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Run ESLint.
- `npm run format`: Format code using Prettier.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
