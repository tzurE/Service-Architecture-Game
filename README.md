# Service Architecture Game

An interactive game that teaches network architecture concepts through a visual, component-based interface.

## Overview

This game allows players to build and connect various service components (servers, databases, caches, etc.) to create functional network architectures. Players must solve challenges across multiple levels, each focusing on different aspects of service-oriented architecture.

## Features

- Isometric grid-based interface
- Drag-and-drop component placement
- Visual connection system
- Multiple levels with increasing complexity
- Real-time feedback on system performance

## Components

The game includes various components that can be connected:

- **Users**: Represent clients accessing the system
- **Servers**: Process requests from users
- **Databases**: Store and retrieve data
- **Caches**: Improve performance by storing frequently accessed data
- **Load Balancers**: Distribute traffic across multiple servers
- **API Gateways**: Manage and secure API access

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/service-game.git
   cd service-game
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## How to Play

1. Select components from the palette on the left
2. Place them on the grid by clicking
3. Connect components by clicking on one component and then another
4. Complete the level objectives to progress

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by real-world service architecture challenges
- Developed as an educational tool for learning network concepts 