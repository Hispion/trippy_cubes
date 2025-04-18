import { config } from './config.js';
import { getRandomColorFromPalette } from './colors.js';

export const SHAPE_TYPES = ['cube', 'sphere', 'pyramid', 'torus', 'octahedron', 'icosahedron'];
export let currentShapeGrid = [];
export let shapesGroup = new THREE.Group();

export function initShapeGrid() {
    for (let layer = 0; layer < config.depthLayers; layer++) {
        currentShapeGrid[layer] = [];
        for (let i = 0; i < config.gridSize; i++) {
            currentShapeGrid[layer][i] = [];
            for (let j = 0; j < config.gridSize; j++) {
                currentShapeGrid[layer][i][j] = {
                    type: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
                    active: Math.random() > 0.5,
                    color: getRandomColorFromPalette(),
                    energy: 0.7 + Math.random() * 0.3,
                    nextState: false
                };
            }
        }
    }
    return currentShapeGrid;
}