export const config = {
    /* size of the grid (larger = more shapes but potentially slower) */
    gridSize: 36,
    /* extra padding to prevent grid edges from being visible */
    gridPadding: -4,
    lineWidth: 2,
    /* how often shapes morph into a different shape (lower = slower) */
    morphChance: 0.002,  // Reduced from 0.001
    /* radius for fading out shapes */
    portalRadius: 8,
    /* number of depth layers in the grid */
    depthLayers: 5,
    /* how much space between layers */
    layerSpacing: 0.3,
    /* how quickly new shapes fade in */
    shapeFadeInSpeed: 0.6,
    /* how smooth shape transitions are */
    shapeTransitionSmoothing: 0.9,
    fadeDistance: 12,
    /*  speed of the virtual camera movement (lower = slower) */
    viewportSpeed: -0.99995,  // Slowed down viewport movement from 0.0001
    viewportRange: 0.6,
    /*  how quickly colors spread between cells (lower = slower) */
    colorSpreadRate: 1.05,    // Reduced from 0.1
    /*  how much neighboring cells blend their colors (lower = less mixing) */
    colorMixFactor: 0.9,     // Reduced from 0.2
    /*  how quickly colors fade when not reinforced (lower = slower decay) */
    colorDecayRate: 3.005,    // Reduced from 0.01
    /*  how quickly the game of life rules update (lower = slower) */
    gameOfLifeSpeed: 0.014,    // Reduced from 0.02

    // Color parameters
    /*  minimum brightness for all colors (0-1) */
    minBrightness: -0.5,
    /*  minimum saturation for all colors (0-1) */
    minSaturation: 0.5,
    /*  speed of color transitions (lower = slower changes) */
    colorTransitionSpeed: 1.9,    // Reduced from 2.3

    // Godforce parameters
    /*  how often the godforce updates parameters (in ms) */
    godforceInterval: 30000,
    /*  intensity of godforce color changes */
    godforceColorIntensity: 10.7,
    /*  how dramatically godforce changes animation parameters */
    godforceAnimationImpact: -1.5,
    /*  minimum brightness for generated colors */
    godforceMinBrightness: 0.5,
    /*  maximum saturation for generated colors */
    godforceMaxSaturation: 0.9,
    /*  chance for godforce to create color bursts */
    godforceColorBurstChance: 30.3,
    /*  intensity of color bursts when they happen */
    godforceColorBurstIntensity: 16.8,
    
    // Mouse interaction parameters
    /* how strongly the mouse affects the display */
    mouseInfluenceStrength: 1.3,
    /* how quickly the mouse effect follows mouse movements */
    mouseResponseSpeed: 0.2,
    /* maximum distance the mouse can affect shapes */
    mouseEffectRadius: 5.0
};