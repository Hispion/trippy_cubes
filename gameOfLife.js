import { config } from './config.js';
import { currentShapeGrid, SHAPE_TYPES } from './shapes.js';
import { blendColors, ensureColorful, generateGodforceColor } from './colors.js';

export function updateGameOfLife(godforceState) {
    const cellUpdates = [];

    for (let layer = 0; layer < config.depthLayers; layer++) {
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                let activeNeighbors = 0;
                let avgNeighborColor = new THREE.Color(0, 0, 0);
                let neighborCount = 0;
                
                for (let dl = -1; dl <= 1; dl++) {
                    const checkLayer = layer + dl;
                    if (checkLayer < 0 || checkLayer >= config.depthLayers) continue;
                    
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (dl === 0 && di === 0 && dj === 0) continue;
                            
                            const ni = (i + di + config.gridSize) % config.gridSize;
                            const nj = (j + dj + config.gridSize) % config.gridSize;
                            
                            const neighbor = currentShapeGrid[checkLayer][ni][nj];
                            if (neighbor.active) {
                                activeNeighbors++;
                                avgNeighborColor.add(neighbor.color);
                                neighborCount++;
                            }
                        }
                    }
                }

                const cell = currentShapeGrid[layer][i][j];
                let newEnergy = cell.energy;
                let newColor = cell.color.clone();
                
                if (neighborCount > 0) {
                    avgNeighborColor.multiplyScalar(1 / neighborCount);
                    // Use our new blendColors function with color enforcement
                    newColor = blendColors(newColor, avgNeighborColor, config.colorMixFactor);
                    newColor = ensureColorful(newColor);
                    newEnergy = Math.min(1, newEnergy + config.colorSpreadRate * neighborCount / 26);
                } else {
                    newEnergy = Math.max(0, newEnergy - config.colorDecayRate);
                }

                const willBeActive = cell.active
                    ? (activeNeighbors >= 4 && activeNeighbors <= 6) || newEnergy > 0.7
                    : activeNeighbors === 6 || newEnergy > 0.9;

                cellUpdates.push({
                    layer, i, j,
                    active: willBeActive,
                    color: newColor,
                    energy: newEnergy,
                    type: willBeActive && Math.random() < 0.1 ? 
                        SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)] : 
                        cell.type
                });
            }
        }
    }

    for (const update of cellUpdates) {
        if (godforceState.energyFlow === 'outward') {
            const distFromCenter = Math.sqrt(
                Math.pow((update.i - config.gridSize/2), 2) + 
                Math.pow((update.j - config.gridSize/2), 2) + 
                Math.pow((update.layer - config.depthLayers/2) * 3, 2)
            );
            const centerFactor = 1 - (distFromCenter / (config.gridSize/2));
            update.energy = Math.min(1, update.energy + centerFactor * 0.1 * godforceState.energyIntensity * config.godforceAnimationImpact);
        } else if (godforceState.energyFlow === 'inward') {
            const distFromCenter = Math.sqrt(
                Math.pow((update.i - config.gridSize/2), 2) + 
                Math.pow((update.j - config.gridSize/2), 2) + 
                Math.pow((update.layer - config.depthLayers/2) * 3, 2)
            );
            const edgeFactor = distFromCenter / (config.gridSize/2);
            update.energy = Math.min(1, update.energy + edgeFactor * 0.1 * godforceState.energyIntensity * config.godforceAnimationImpact);
        } else if (godforceState.energyFlow === 'pulsing') {
            update.energy = Math.min(1, update.energy + Math.sin(Date.now() * 0.001) * 0.05 * godforceState.energyIntensity * config.godforceAnimationImpact);
        } else if (godforceState.energyFlow === 'chaotic') {
            update.energy = Math.min(1, update.energy + (Math.random() - 0.5) * 0.1 * godforceState.energyIntensity * config.godforceAnimationImpact);
        }
        
        if (Math.random() < 0.01 * config.godforceColorIntensity) {
            update.color = generateGodforceColor(godforceState.dominantHue, godforceState.colorMode, godforceState.colorSpread);
            update.energy = Math.min(1, update.energy + 0.2);
        }
        
        // Always ensure the color is vibrant
        update.color = ensureColorful(update.color);
    }

    for (const update of cellUpdates) {
        const cell = currentShapeGrid[update.layer][update.i][update.j];
        cell.active = update.active;
        cell.color = update.color;
        cell.energy = update.energy;
    }

    return cellUpdates;
}