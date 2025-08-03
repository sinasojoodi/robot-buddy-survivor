# 🤖 Robot Buddy Survivor ⚔️

This is a 2D survival game built with React and Vite. The game features a player character and a robot companion, who must work together to survive against waves of enemies, mine resources, and craft powerful items.

## ✨ Features

*   **Player and Robot Companion**: Control your character and fight alongside a helpful robot.
*   **Dynamic Day/Night Cycle**: Face tougher enemies and a more dangerous world at night.
*   **Mining and Resource Gathering**: Break blocks to collect wood, stone, iron, diamond, and obsidian.
*   **Crafting System**: Use collected resources to craft a variety of swords and upgrades for both the player and the robot.
*   **Progressive Difficulty**: Advance through levels by defeating enemies, with each level bringing new challenges.
*   **Enemy Variety**: Fight against Zombies, Skeletons, Creepers, Endermen, and even a powerful Dragon.
*   **Player and Robot Stats**: Manage health, hunger, and energy to survive. Upgrade your stats with crafted items.
*   **Responsive UI**: A clean interface built with Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

*   Node.js and npm (or yarn/pnpm) installed on your machine.

### Installation

1.  Clone the repository to your local machine:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd robot-buddy-survivor
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Application

#### Development Mode
*   To start the development server, run:
    ```bash
    npm run dev
    ```
*   Open your browser and navigate to `http://localhost:5173` to see the game in action.

#### Docker
*   To run the application using Docker:
    ```bash
    # Build the Docker image
    docker build -t robot-buddy-survivor .
    
    # Run the container
    docker run -p 4173:4173 robot-buddy-survivor
    ```
*   Open your browser and navigate to `http://localhost:4173` to see the game in action.

## 📜 Available Scripts

*   `npm run dev`: Starts the Vite development server with Hot Module Replacement.
*   `npm run build`: Builds the application for production.
*   `npm run preview`: Serves the production build locally for preview.

## 🎮 Game Controls

*   **Arrow Keys**: Move the player character.
*   **Spacebar**: Hold to mine nearby blocks.
*   **'C' Key**: Toggle the crafting menu.
*   **'ESC' Key**: Close the crafting menu.

## 🛠️ Tech Stack

*   **Vite**: Frontend tooling for a fast development experience.
*   **React**: A JavaScript library for building user interfaces.
*   **Tailwind CSS**: A utility-first CSS framework for styling.
*   **JavaScript (ES6+)**: Core programming language.

## 🤖 AI Development Tools

This code was produced using AI Tools: Claude Desktop, Google Gemini, Cursor

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
