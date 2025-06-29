// pixiSkeleton.js - PixiJS version of the Skeleton class

export class Skeleton {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    
    // Physics properties
    this.x = 100; // Left side of screen
    this.y = 100; // Will be set by the game
    this.vx = 2;
    this.vy = 0;
    this.gravity = 0.5;
    this.grounded = false;
    this.direction = 'right';
    
    // Death state
    this.isDead = false;
    this.deathAnimationComplete = false;
    this.deathStartY = 0; // Store initial Y position when death starts
    this.deathFallDistance = 0; // How far the skeleton should fall during death animation
    
    // Animation properties
    this.currentAnimation = 'walk';
    this.currentFrame = 0;
    this.frameSpeed = 100; // milliseconds per frame
    this.lastFrameTime = 0;
    
    // Sprite properties
    this.spriteSheetFrameWidth = 300; // Original sprite sheet frame width
    this.spriteSheetFrameHeight = 195; // Original sprite sheet frame height
    this.frameWidth = 200; // Trimmed frame width (will be calculated)
    this.frameHeight = 195; // Trimmed frame height
    this.flipOffset = 0;
    
    // Initialize sprites and animations
    this.initSprites();
  }

  initSprites() {
    console.log('Loading skeleton sprites...');
    
    // Create base sprite first
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.container.addChild(this.sprite);
    
    try {
      // Load skeleton sprite sheet
      this.skeletonTexture = PIXI.Texture.from('assets/skeleton-sprite.png');
      
      // Set up texture loading events
      this.skeletonTexture.baseTexture.on('loaded', () => {
        console.log('Skeleton texture loaded successfully');
        this.initAnimations();
      });
      
      this.skeletonTexture.baseTexture.on('error', (error) => {
        console.error('Error loading skeleton texture:', error);
        this.createFallbackSprite();
      });
      
      // Check if texture is already loaded
      if (this.skeletonTexture.baseTexture.valid) {
        console.log('Skeleton texture already loaded');
        this.initAnimations();
      }
      
      console.log('Skeleton sprites loaded successfully');
    } catch (error) {
      console.error('Error setting up skeleton sprites:', error);
      this.createFallbackSprite();
    }
  }

  createFallbackSprite() {
    console.log('Creating fallback skeleton sprite...');
    
    // Create a simple colored rectangle as fallback
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x808080); // Grey color
    this.sprite.drawRect(-75, -50, 150, 100);
    this.sprite.endFill();
    
    // Add skull
    this.sprite.beginFill(0xFFFFFF); // White skull
    this.sprite.drawCircle(0, -30, 25);
    this.sprite.endFill();
    
    // Add eye sockets
    this.sprite.beginFill(0x000000); // Black eyes
    this.sprite.drawCircle(-10, -35, 5);
    this.sprite.drawCircle(10, -35, 5);
    this.sprite.endFill();
    
    this.sprite.anchor.set(0.5, 0.5);
    this.container.addChild(this.sprite);
    
    console.log('Fallback skeleton sprite created');
  }

  initAnimations() {
    console.log('Initializing skeleton animations...');
    
    // Define animation frames
    this.animations = {
      walk: { startFrame: 0, frames: 6, row: 1 },
      death: { startFrame: 0, frames: 6, row: 4 } // 5th row (row 4) for death animation
    };
    
    // Only create texture rectangles if we have the actual texture
    if (this.skeletonTexture && this.skeletonTexture.baseTexture) {
      this.frames = {};
      Object.keys(this.animations).forEach(animName => {
        const anim = this.animations[animName];
        this.frames[animName] = [];
        
        for (let i = 0; i < anim.frames; i++) {
          const frameX = (anim.startFrame + i) * this.spriteSheetFrameWidth;
          const frameY = anim.row * this.spriteSheetFrameHeight;
          
          // Extract the full frame from sprite sheet
          const fullFrameTexture = new PIXI.Texture(
            this.skeletonTexture.baseTexture,
            new PIXI.Rectangle(frameX, frameY, this.spriteSheetFrameWidth, this.spriteSheetFrameHeight)
          );
          
          // Trim the frame to remove transparent areas
          const trimmedTexture = this.trimTexture(fullFrameTexture);
          this.frames[animName].push(trimmedTexture);
        }
      });
      
      // Set initial frame
      this.updateSpriteFrame();
    } else {
      console.log('Using fallback sprite - no texture animations');
    }
    
    console.log('Skeleton animations initialized');
  }

  trimTexture(texture) {
    // Create a temporary canvas to analyze the texture
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match texture
    canvas.width = texture.width;
    canvas.height = texture.height;
    
    // Draw the texture to canvas
    const image = texture.baseTexture.resource.source;
    ctx.drawImage(image, texture.frame.x, texture.frame.y, texture.frame.width, texture.frame.height, 0, 0, texture.frame.width, texture.frame.height);
    
    // Get image data to analyze transparency
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Find the bounds of non-transparent pixels
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const alpha = data[index + 3]; // Alpha channel
        
        if (alpha > 0) { // Non-transparent pixel
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
    
    // Calculate trimmed dimensions
    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;
    
    // Update frame dimensions if this is the first frame
    if (this.frames && Object.keys(this.frames).length > 0) {
      const firstAnimKey = Object.keys(this.frames)[0];
      if (this.frames[firstAnimKey].length === 0) {
        this.frameWidth = trimmedWidth;
        this.frameHeight = trimmedHeight;
      }
    }
    
    // Create trimmed texture
    const trimmedTexture = new PIXI.Texture(
      texture.baseTexture,
      new PIXI.Rectangle(
        texture.frame.x + minX,
        texture.frame.y + minY,
        trimmedWidth,
        trimmedHeight
      )
    );
    
    return trimmedTexture;
  }

  updateSpriteFrame() {
    if (this.frames && this.frames[this.currentAnimation] && this.frames[this.currentAnimation][this.currentFrame]) {
      this.sprite.texture = this.frames[this.currentAnimation][this.currentFrame];
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    this.container.position.set(x, y);
  }

  update() {
    // Only update animation if animations are initialized
    if (this.animations && this.animations[this.currentAnimation]) {
      // Update animation
      if (Date.now() - this.lastFrameTime > this.frameSpeed) {
        this.lastFrameTime = Date.now();
        this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].frames;
        this.updateSpriteFrame();
        
        // Handle death animation falling effect
        if (this.isDead && this.currentAnimation === 'death') {
          const totalFrames = this.animations[this.currentAnimation].frames;
          const progress = this.currentFrame / totalFrames; // 0 to 1
          
          // Calculate falling position - gradually fall as animation progresses
          const fallProgress = Math.min(progress, 1); // Ensure we don't exceed 1
          const currentFallDistance = this.deathFallDistance * fallProgress;
          this.y = this.deathStartY + currentFallDistance;
          
          // Update container position for the falling effect
          this.container.position.set(this.x, this.y);
        }
        
        // Check if death animation is complete
        if (this.isDead && this.currentAnimation === 'death' && this.currentFrame === 0) {
          this.deathAnimationComplete = true;
          console.log('Skeleton death animation complete');
          
          // Remove skeleton from game after death animation
          this.removeFromGame();
        }
      }
    }

    // Don't update physics if dead
    if (this.isDead) {
      return;
    }

    // Only update physics if game has started
    if (this.app && this.app.game && !this.app.game.gameStarted) {
      return;
    }

    // Update physics
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    
    // Ground collision
    let groundLevel = this.app.renderer.height - 90; // Default fallback
    if (this.app.game && this.app.game.getGroundLevel) {
      groundLevel = this.app.game.getGroundLevel();
    }
    
    if (this.y > groundLevel) {
      this.y = groundLevel;
      this.vy = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }
    
    // Screen boundary collision - reverse direction
    if (this.x + this.frameWidth / 2 >= this.app.renderer.width && this.direction === 'right') {
      this.direction = 'left';
      this.vx = -Math.abs(this.vx);
      this.sprite.scale.x = -1; // Flip sprite
    } else if (this.x <= 0 && this.direction === 'left') {
      this.direction = 'right';
      this.vx = Math.abs(this.vx);
      this.sprite.scale.x = 1; // Normal sprite
    }
    
    // Update container position
    this.container.position.set(this.x, this.y);
  }

  removeFromGame() {
    console.log('Removing skeleton from game');
    
    // Remove from PIXI stage
    if (this.app && this.app.stage) {
      this.app.stage.removeChild(this.container);
    }
    
    // Clear the skeleton reference from the app
    if (this.app) {
      this.app.skeleton = null;
    }
    
    // Also clear the reference in the main game class if it exists
    // We need to find the game instance that created this skeleton
    if (this.app && this.app.game) {
      this.app.game.skeleton = null;
    }
  }

  die() {
    console.log('Skeleton is dying!');
    this.isDead = true;
    this.vx = 0; // Stop horizontal movement
    this.vy = 0; // Stop vertical movement
    this.currentFrame = 0; // Reset to first frame of death animation
    this.frameSpeed = 150; // Slower frame speed for death animation
    this.deathStartY = this.y; // Store initial Y position when death starts
    this.deathFallDistance = this.frameHeight / 2; // Fall distance is half the skeleton's height
    this.setAnimation('death');
  }

  setAnimation(animation) {
    if (this.animations && this.animations[animation] && this.currentAnimation !== animation) {
      this.currentAnimation = animation;
      this.currentFrame = 0;
      this.updateSpriteFrame();
    }
  }
} 