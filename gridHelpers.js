import { config } from './config.js';

/**
 * Calculates the effective grid size including padding
 * @returns {number} total grid size
 */
export function getEffectiveGridSize() {
    return config.gridSize + (config.gridPadding * 2);
}

/**
 * Converts grid coordinates to world space coordinates
 * @param {number} i - Grid row 
 * @param {number} j - Grid column
 * @param {number} layer - Grid depth layer
 * @param {Object} layerOffset - Offset for this layer
 * @returns {Object} Position in world space
 */
export function gridToWorldPosition(i, j, layer, layerOffset) {
    // Apply padding to grid coordinates
    const gridSize = getEffectiveGridSize();
    const i_padded = i + config.gridPadding;
    const j_padded = j + config.gridPadding;
    
    const shapePosX = (i_padded - gridSize/2) * 0.8 + (layerOffset ? layerOffset.x : 0);
    const shapePosY = (j_padded - gridSize/2) * 0.8 + (layerOffset ? layerOffset.y : 0);
    const shapePosZ = -layer * config.layerSpacing;
    
    return { x: shapePosX, y: shapePosY, z: shapePosZ };
}

/**
 * Gets the neighbor coordinates with proper wrapping
 * @param {number} i - Grid row
 * @param {number} j - Grid column
 * @param {number} layer - Grid depth layer
 * @param {number} di - Row offset
 * @param {number} dj - Column offset
 * @param {number} dl - Layer offset
 * @returns {Object|null} Neighbor coordinates or null if invalid
 */
export function getNeighborCoordinates(i, j, layer, di, dj, dl) {
    const checkLayer = layer + dl;
    if (checkLayer < 0 || checkLayer >= config.depthLayers) return null;
    
    const gridSize = getEffectiveGridSize();
    // Only wrap the visible grid portion, not the padding
    const ni = (i + di + config.gridSize) % config.gridSize;
    const nj = (j + dj + config.gridSize) % config.gridSize;
    
    return { layer: checkLayer, i: ni, j: nj };
}