// animation.js

export function initAnimations(wizard) {
    wizard.animations = {
        'idle': { startFrame: 0, frames: 6, row: 0 },
        'run': { startFrame: 0, frames: 6, row: 1 }, // Assuming run animation starts from frame 0 on the second row
        'attack': { startFrame: 0, frames: 6, row: 3 } // Adjusted to start from the correct frame
    };
}


export function initExplosions(wizard) {
    wizard.explosionSprite = new Image();
    wizard.explosionSprite.src = "assets/explosion-sprite.avif";

    wizard.explosionFrameWidth = 133;
    wizard.explosionFrameHeight = 155;
    wizard.explosionFrames = 6; // Total number of frames in the explosion animation
    wizard.explosionFrameSpeed = 50; // milliseconds per frame for the explosion
    wizard.explosions = []; // Array to track explosions
}
