import { config } from './config.js';
import { getRandomColorFromPalette, ensureColorful, generateGodforceColor, blendColors, activePalette, colorPalettes } from './colors.js';
import { getLayerOffset } from './layerAnimation.js';
import { gridToWorldPosition, getEffectiveGridSize, getNeighborCoordinates } from './gridHelpers.js';
import { initMouseInteraction, updateMouseProjection, applyMousePiercingEffect, mouseActive } from './mouseInteraction.js';
import { createVignette } from './vignette.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('cube-container').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const SHAPE_TYPES = ['cube', 'sphere', 'pyramid', 'torus', 'octahedron', 'icosahedron'];
let currentShapeGrid = [];
let time = 0;
let viewportCenter = new THREE.Vector3(0, 0, 0);

let godforceState = {
    dominantHue: Math.random(),
    colorMode: 'harmony',
    colorSpread: 0.2,
    energyFlow: 'outward',
    energyIntensity: 0.7,
    shapeBehavior: 'standard'
};

function initShapeGrid() {
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
}

function createGeometry(type) {
    switch(type) {
        case 'cube':
            return new THREE.BoxGeometry(0.5, 0.5, 0.5);
        case 'sphere':
            return new THREE.SphereGeometry(0.3, 8, 8);
        case 'pyramid':
            return new THREE.ConeGeometry(0.3, 0.6, 4);
        case 'torus':
            return new THREE.TorusGeometry(0.2, 0.1, 8, 12);
        case 'octahedron':
            return new THREE.OctahedronGeometry(0.3);
        case 'icosahedron':
            return new THREE.IcosahedronGeometry(0.3);
        default:
            return new THREE.BoxGeometry(0.5, 0.5, 0.5);
    }
}

function initGodforceColors() {
    for (let layer = 0; layer < config.depthLayers; layer++) {
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                if (Math.random() < 0.2) {
                    const cell = currentShapeGrid[layer][i][j];
                    cell.color = generateGodforceColor(godforceState.dominantHue, godforceState.colorMode, godforceState.colorSpread);
                    cell.energy = 0.8 + Math.random() * 0.2;
                    cell.active = true;
                }
            }
        }
    }
}

function createColorBurst() {
    const focalLayer = Math.floor(Math.random() * config.depthLayers);
    const focalI = Math.floor(Math.random() * config.gridSize);
    const focalJ = Math.floor(Math.random() * config.gridSize);
    
    const burstColor = generateGodforceColor(godforceState.dominantHue, godforceState.colorMode, godforceState.colorSpread);
    const burstRadius = Math.floor(3 + Math.random() * 5);
    
    for (let layer = 0; layer < config.depthLayers; layer++) {
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                const distSquared = 
                    Math.pow((i - focalI), 2) + 
                    Math.pow((j - focalJ), 2) + 
                    Math.pow((layer - focalLayer) * 3, 2);
                
                if (distSquared <= burstRadius * burstRadius) {
                    const cell = currentShapeGrid[layer][i][j];
                    const distFactor = 1 - Math.sqrt(distSquared) / burstRadius;
                    const intensity = distFactor * config.godforceColorBurstIntensity;
                    
                    cell.color.lerp(burstColor, intensity);
                    cell.color = ensureColorful(cell.color);
                    cell.energy = Math.min(1, cell.energy + intensity * 0.5);
                    cell.active = true;
                }
            }
        }
    }
}

async function updateGodforceParameters() {
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Generate creative parameters for a vibrant, colorful visual art experience. 
                    Respond directly with JSON, following this JSON schema, and no other text.
                    {
                      colorTheme: string; // A descriptive colorful theme like "neon jungle", "sunset blaze", "cosmic rainbow"
                      dominantHue: number; // A value between 0 and 1
                      colorMode: string; // One of: "harmony", "contrast", "triad", "rainbow"
                      colorSpread: number; // A value between 0.05 and 0.5
                      energyFlow: string; // One of: "outward", "inward", "pulsing", "chaotic"
                      energyIntensity: number; // A value between 0.3 and 1
                      shapeBehavior: string; // One of: "standard", "frenetic", "peaceful", "crystalline"
                    }`
                },
                {
                    role: "user",
                    content: "Create a beautiful, immersive, and vividly colorful scheme for a 3D game of life visualization. Focus on bright, saturated colors."
                }
            ],
            json: true,
        });

        const result = JSON.parse(completion.content);
        
        // Choose a color palette based on the theme
        if (result.colorTheme.includes("neon")) {
            activePalette = "neon";
        } else if (result.colorTheme.includes("sunset")) {
            activePalette = "sunset";
        } else if (result.colorTheme.includes("ocean")) {
            activePalette = "ocean";
        } else if (result.colorTheme.includes("forest")) {
            activePalette = "forest";
        } else {
            activePalette = "candy";
        }
        
        godforceState = {
            dominantHue: result.dominantHue,
            colorMode: result.colorMode,
            colorSpread: result.colorSpread,
            energyFlow: result.energyFlow,
            energyIntensity: result.energyIntensity,
            shapeBehavior: result.shapeBehavior
        };

        console.log(`Godforce updated: ${result.colorTheme} using ${activePalette} palette`);
        
        // Always create at least one color burst on godforce update
        const burstCount = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < burstCount; i++) {
            createColorBurst();
        }
        
        updateGameRules();
        
    } catch (error) {
        console.error("Error updating godforce parameters:", error);
        godforceState = {
            dominantHue: Math.random(),
            colorMode: ['harmony', 'contrast', 'triad', 'rainbow'][Math.floor(Math.random() * 4)],
            colorSpread: 0.05 + Math.random() * 0.45,
            energyFlow: ['outward', 'inward', 'pulsing', 'chaotic'][Math.floor(Math.random() * 4)],
            energyIntensity: 0.3 + Math.random() * 0.7,
            shapeBehavior: ['standard', 'frenetic', 'peaceful', 'crystalline'][Math.floor(Math.random() * 4)]
        };
    }
}

function updateGameRules() {
    switch(godforceState.shapeBehavior) {
        case 'frenetic':
            config.colorMixFactor = 0.4 * config.godforceAnimationImpact;
            config.colorSpreadRate = 0.2 * config.godforceAnimationImpact;
            config.morphChance = 0.003 * config.godforceAnimationImpact;
            break;
        case 'peaceful':
            config.colorMixFactor = 0.1 * config.godforceAnimationImpact;
            config.colorSpreadRate = 0.05 * config.godforceAnimationImpact;
            config.morphChance = 0.0005 * config.godforceAnimationImpact;
            break;
        case 'crystalline':
            config.colorMixFactor = 0.15 * config.godforceAnimationImpact;
            config.colorSpreadRate = 0.12 * config.godforceAnimationImpact;
            config.morphChance = 0.001 * config.godforceAnimationImpact;
            break;
        default: // standard
            config.colorMixFactor = 0.2 * config.godforceAnimationImpact;
            config.colorSpreadRate = 0.1 * config.godforceAnimationImpact;
            config.morphChance = 0.001 * config.godforceAnimationImpact;
    }
}

function updateGameOfLife() {
    const cellUpdates = [];

    for (let layer = 0; layer < config.depthLayers; layer++) {
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                let activeNeighbors = 0;
                let avgNeighborColor = new THREE.Color(0, 0, 0);
                let neighborCount = 0;
                
                for (let dl = -1; dl <= 1; dl++) {
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            if (dl === 0 && di === 0 && dj === 0) continue;
                            
                            const neighborCoords = getNeighborCoordinates(i, j, layer, di, dj, dl);
                            if (!neighborCoords) continue;
                            
                            const neighbor = currentShapeGrid[neighborCoords.layer][neighborCoords.i][neighborCoords.j];
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
            update.energy = Math.min(1, update.energy + Math.sin(time * 2) * 0.05 * godforceState.energyIntensity * config.godforceAnimationImpact);
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
        
        if (cell.type !== update.type) {
            cell.type = update.type;
            const index = update.layer * config.gridSize * config.gridSize + update.i * config.gridSize + update.j;
            if (index < shapesGroup.children.length) {
                const shape = shapesGroup.children[index];
                const newGeometry = createGeometry(update.type);
                const newEdges = new THREE.EdgesGeometry(newGeometry);
                shape.geometry.dispose();
                shape.geometry = newEdges;
            }
        }
    }
}

function updateViewportPosition() {
    const t = time * config.viewportSpeed;
    const gridSize = getEffectiveGridSize();
    
    viewportCenter.x = Math.sin(t) * Math.cos(t * 0.7) * (gridSize/2 * 0.8 * config.viewportRange);
    viewportCenter.y = Math.cos(t * 1.3) * Math.sin(t * 0.5) * (gridSize/2 * 0.8 * config.viewportRange);
    viewportCenter.z = (Math.sin(t * 0.3) * 0.5 + 0.5) * -config.layerSpacing * (config.depthLayers - 1);
    
    const cameraDistance = 15;
    camera.position.x = viewportCenter.x;
    camera.position.y = viewportCenter.y;
    camera.position.z = viewportCenter.z + cameraDistance;
    camera.lookAt(viewportCenter.x, viewportCenter.y, viewportCenter.z);
}

function morphShape(index) {
    const shape = shapesGroup.children[index];
    const { row, col, layer } = shape.userData;
    
    const newType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    currentShapeGrid[layer][row][col].type = newType;
    
    const newGeometry = createGeometry(newType);
    const newEdges = new THREE.EdgesGeometry(newGeometry);
    shape.geometry.dispose();
    shape.geometry = newEdges;
}

function initVisualGrid() {
    // Create the shapes group
    const shapesGroup = new THREE.Group();
    scene.add(shapesGroup);
    
    for (let layer = 0; layer < config.depthLayers; layer++) {
        for (let i = 0; i < config.gridSize; i++) {
            for (let j = 0; j < config.gridSize; j++) {
                const geometry = createGeometry(currentShapeGrid[layer][i][j].type);
                const edges = new THREE.EdgesGeometry(geometry);
                const line = new THREE.LineSegments(
                    edges,
                    new THREE.LineBasicMaterial({ 
                        color: new THREE.Color(),
                        linewidth: config.lineWidth,
                        transparent: true,
                        opacity: 1
                    })
                );
                
                const position = gridToWorldPosition(i, j, layer);
                line.position.set(position.x, position.y, position.z);
                
                line.userData = { row: i, col: j, layer: layer };
                shapesGroup.add(line);
            }
        }
    }
    
    return shapesGroup;
}

// Initialize grid and visuals
initShapeGrid();
initGodforceColors();
const shapesGroup = initVisualGrid();
const vignette = createVignette(scene);

function animate() {
    requestAnimationFrame(animate);
    time += 0.001;  // Reduced from 0.002 to slow down overall animation
    
    // Only update game of life based on speed setting
    if (Math.random() < config.gameOfLifeSpeed) {
        updateGameOfLife();
    }
    
    updateViewportPosition();
    vignette.update(camera, viewportCenter);
    
    // Update mouse projection in 3D space
    updateMouseProjection(camera, viewportCenter);
    
    if(Math.random() < config.morphChance) {
        morphShape(Math.floor(Math.random() * shapesGroup.children.length));
    }
    
    shapesGroup.children.forEach((shape) => {
        const { row, col, layer } = shape.userData;
        const cell = currentShapeGrid[layer][row][col];
        
        const layerOffset = getLayerOffset(layer, time);
        let position = gridToWorldPosition(row, col, layer, layerOffset);
        
        // Apply mouse piercing effect if mouse is active
        if (mouseActive) {
            position = applyMousePiercingEffect(shape, position);
        }
        
        // Update shape position
        shape.position.set(position.x, position.y, position.z);
        
        const distX = position.x - viewportCenter.x;
        const distY = position.y - viewportCenter.y;
        const distZ = position.z - viewportCenter.z;
        
        const distanceFromViewport = Math.sqrt(distX * distX + distY * distY + distZ * distZ);
        
        const fadeStart = config.portalRadius * 0.8;
        let opacity = 1.0 - (distanceFromViewport / config.fadeDistance);
        
        opacity *= cell.active ? cell.energy : 0.3;
        
        shape.material.opacity = Math.max(0, Math.min(1, opacity));
        
        const rotationSpeed = 1 - (distanceFromViewport / config.fadeDistance);
        const activityFactor = cell.active ? cell.energy : 0.3;
        shape.rotation.x = Math.sin(time + layer * 0.2) * 0.3 * rotationSpeed * activityFactor;
        shape.rotation.y = Math.cos(time + layer * 0.2) * 0.3 * rotationSpeed * activityFactor;
        
        // Always ensure the displayed color is vibrant
        cell.color = ensureColorful(cell.color);
        shape.material.color.copy(cell.color);
    });
    
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Initialize mouse interaction
initMouseInteraction();

updateGodforceParameters();
setInterval(updateGodforceParameters, config.godforceInterval);

animate();