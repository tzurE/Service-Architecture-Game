import { GameBoard } from './GameBoard';
import { ComponentPalette } from './ComponentPalette';

export class LevelPanel {
    private container: HTMLDivElement;
    private gameBoard: GameBoard;
    private componentPalette: ComponentPalette;
    private currentLevel: number = 1;

    constructor(gameBoard: GameBoard, componentPalette: ComponentPalette) {
        this.gameBoard = gameBoard;
        this.componentPalette = componentPalette;
        this.container = document.createElement('div');
        this.container.className = 'level-panel';
        this.setupStyles();
        this.createPanel();
    }

    private setupStyles(): void {
        const style = document.createElement('style');
        style.textContent = `
            .game-board-container {
                position: relative;
                display: inline-block;
                margin-top: 60px; /* Add space for the level panel */
            }
            .level-panel {
                position: absolute;
                top: -50px; /* Move up slightly more */
                right: 20px; /* Add some right margin */
                background: #fff;
                padding: 8px 15px;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
            }
            .level-button {
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                background: #4CAF50;
                color: white;
                cursor: pointer;
                transition: background 0.3s;
                font-size: 14px;
            }
            .level-button:hover {
                background: #45a049;
            }
            .level-button.active {
                background: #2196F3;
            }
            .level-description {
                font-size: 14px;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }

    private createPanel(): void {
        // Create level buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.gap = '5px';

        // Create level buttons
        const levels = [1, 2, 3, 4]; // Add more levels as they are created
        levels.forEach(level => {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.textContent = `Level ${level}`;
            button.onclick = () => this.switchLevel(level);
            buttonsContainer.appendChild(button);
        });

        // Add buttons to container
        this.container.appendChild(buttonsContainer);

        // Add panel to the game board container
        const gameBoardContainer = document.querySelector('.game-board-container');
        if (gameBoardContainer) {
            gameBoardContainer.appendChild(this.container);
        } else {
            // If container doesn't exist, create it
            const canvas = document.getElementById('gameBoard');
            if (canvas) {
                const container = document.createElement('div');
                container.className = 'game-board-container';
                canvas.parentNode?.insertBefore(container, canvas);
                container.appendChild(canvas);
                container.appendChild(this.container);
            }
        }

        // Set initial active button
        this.updateActiveButton();
    }

    private switchLevel(level: number): void {
        if (level === this.currentLevel) return;
        
        // Use the new setLevel method
        this.gameBoard.setLevel(level);
        this.currentLevel = level;
        this.updateActiveButton();
        
        // Update the component palette for the new level
        this.componentPalette.setLevel(level);
    }

    private updateActiveButton(): void {
        const buttons = this.container.querySelectorAll('.level-button');
        buttons.forEach((button, index) => {
            if (index + 1 === this.currentLevel) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
} 