export class WinDialog {
    private dialog: HTMLDivElement;
    private onPlayAgain: () => void;
    private onNextLevel: () => void;

    constructor(onPlayAgain: () => void, onNextLevel: () => void) {
        this.onPlayAgain = onPlayAgain;
        this.onNextLevel = onNextLevel;
        
        // Create dialog element
        this.dialog = document.createElement('div');
        this.dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            z-index: 1000;
            display: none;
        `;

        // Create content
        this.dialog.innerHTML = `
            <h2 style="margin: 0 0 1rem 0; color: #2c3e50;">Level Complete! 🎉</h2>
            <p style="margin: 0 0 1.5rem 0; color: #34495e;">Congratulations! You've successfully completed this level.</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="playAgainBtn" style="
                    padding: 0.5rem 1rem;
                    background: #3498db;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                ">Play Again</button>
                <button id="nextLevelBtn" style="
                    padding: 0.5rem 1rem;
                    background: #2ecc71;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 1rem;
                ">Next Level</button>
            </div>
        `;

        // Add event listeners
        this.dialog.querySelector('#playAgainBtn')?.addEventListener('click', () => {
            this.hide();
            this.onPlayAgain();
        });

        this.dialog.querySelector('#nextLevelBtn')?.addEventListener('click', () => {
            this.hide();
            this.onNextLevel();
        });

        // Add to document
        document.body.appendChild(this.dialog);
    }

    public show(): void {
        this.dialog.style.display = 'block';
    }

    public hide(): void {
        this.dialog.style.display = 'none';
    }
} 