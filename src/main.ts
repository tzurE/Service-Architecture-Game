import { GameBoard } from './components/GameBoard';
import { ComponentPalette } from './components/ComponentPalette';
import { WinDialog } from './components/WinDialog';
import { LevelPanel } from './components/LevelPanel';
import { IComponent } from './types/components';

// Initialize game board and palette
const gameBoard = new GameBoard('gameBoard');
const componentPalette = new ComponentPalette('componentPalette');

// Initialize level panel
new LevelPanel(gameBoard, componentPalette);

// Initialize win dialog
const winDialog = new WinDialog(
    () => {
        // Play Again - Reset the current level
        gameBoard.resetLevel();
    },
    () => {
        // Next Level - Move to the next level
        gameBoard.nextLevel();
        // Update palette with new level
        componentPalette.setLevel(gameBoard.getCurrentLevel());
    }
);

// Listen for new components from the palette
document.getElementById('componentPalette')?.addEventListener('componentCreated', ((e: CustomEvent) => {
    const { component } = e.detail;
    
    // Fixed spawn position (7,7)
    const spawnPosition = { x: 7, y: 7 };
    
    // Check if position is taken
    let finalPosition = { ...spawnPosition };
    while (gameBoard.isPositionTaken(finalPosition)) {
        finalPosition.x -= 1; // Move one step to the left
    }
    
    component.position = finalPosition;
    gameBoard.addComponent(component);
}) as EventListener);

const components: IComponent[] = [

];

// Add components to the game board
components.forEach(comp => gameBoard.addComponent(comp));

// Check for win condition after each update
const checkWinCondition = () => {
    if (gameBoard.isLevelComplete()) {
        winDialog.show();
    }
};

// Add win condition check to the game board's update cycle
gameBoard.onUpdate(checkWinCondition); 