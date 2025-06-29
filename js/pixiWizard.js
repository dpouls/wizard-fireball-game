// pixiWizard.js - PixiJS version of the Wizard class

export class Wizard {
  constructor(app) {
    this.app = app;
    this.container = new PIXI.Container();
    
    // Physics properties
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.4;
    this.jumpStrength = -10;
    this.grounded = false;
    this.direction = 'right';
    
    // Animation properties
    this.currentAnimation = 'idle';
    this.currentFrame = 0;
    this.frameSpeed = 100; // milliseconds per frame
    this.lastFrameTime = 0;
    
    // Sprite properties
    this.frameWidth = 192;
    this.frameHeight = 192;
    
    // Fireballs
    this.fireballs = [];
    
    // Initialize sprites and animations
    this.initSprites();
  }

  initSprites() {
    console.log('Loading wizard sprites...');
    
    // Create base sprite first
    this.sprite = new PIXI.Sprite();
    // Adjust anchor to account for transparent space at bottom of wizard sprite
    // This makes the wizard appear to stand on the same ground as the skeleton
    this.sprite.anchor.set(0.5, 0.55); // Move anchor up to account for transparent space
    this.container.addChild(this.sprite);
    
    // Try to load the texture with proper error handling
    try {
      // Load wizard sprite sheet
      this.wizardTexture = PIXI.Texture.from('assets/wizardSprite.png');
      
      // Set up texture loading events
      this.wizardTexture.baseTexture.on('loaded', () => {
        console.log('Wizard texture loaded successfully');
        this.initAnimations();
      });
      
      this.wizardTexture.baseTexture.on('error', (error) => {
        console.error('Error loading wizard texture:', error);
        this.createFallbackSprite();
      });
      
      // Check if texture is already loaded
      if (this.wizardTexture.baseTexture.valid) {
        console.log('Wizard texture already loaded');
        this.initAnimations();
      }
      
      // Load explosion sprite
      this.explosionTexture = PIXI.Texture.from('assets/explosion-sprite.avif');
      
    } catch (error) {
      console.error('Error setting up wizard sprites:', error);
      this.createFallbackSprite();
    }
  }

  createFallbackSprite() {
    console.log('Creating fallback wizard sprite...');
    
    // Create a simple colored rectangle as fallback
    this.sprite = new PIXI.Graphics();
    this.sprite.beginFill(0x0000FF); // Blue color
    this.sprite.drawRect(-50, -50, 100, 100);
    this.sprite.endFill();
    
    // Add a hat
    this.sprite.beginFill(0x8B4513); // Brown hat
    this.sprite.drawRect(-30, -70, 60, 20);
    this.sprite.endFill();
    
    // Use same anchor as main sprite for consistency
    this.sprite.anchor.set(0.5, 0.3);
    this.container.addChild(this.sprite);
    
    console.log('Fallback wizard sprite created');
  }

  initAnimations() {
    console.log('Initializing wizard animations...');
    
    // Define animation frames
    this.animations = {
      idle: { startFrame: 0, frames: 4, row: 0 },
      run: { startFrame: 0, frames: 6, row: 1 },
      attack: { startFrame: 0, frames: 4, row: 3 }
    };
    
    // Only create texture rectangles if we have the actual texture
    if (this.wizardTexture && this.wizardTexture.baseTexture) {
      this.frames = {};
      Object.keys(this.animations).forEach(animName => {
        const anim = this.animations[animName];
        this.frames[animName] = [];
        
        for (let i = 0; i < anim.frames; i++) {
          const frameX = (anim.startFrame + i) * this.frameWidth;
          const frameY = anim.row * this.frameHeight;
          const texture = new PIXI.Texture(
            this.wizardTexture.baseTexture,
            new PIXI.Rectangle(frameX, frameY, this.frameWidth, this.frameHeight)
          );
          this.frames[animName].push(texture);
        }
      });
      
      // Set initial frame
      this.updateSpriteFrame();
    } else {
      console.log('Using fallback sprite - no texture animations');
    }
    
    console.log('Wizard animations initialized');
  }

  setAnimation(animation) {
    if (this.animations && this.animations[animation] && this.currentAnimation !== animation) {
      this.currentAnimation = animation;
      this.currentFrame = 0;
      this.updateSpriteFrame();
    }
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

  moveLeft() {
    this.vx = -4;
    this.direction = 'left';
    this.sprite.scale.x = -1; // Flip sprite
  }

  moveRight() {
    this.vx = 4;
    this.direction = 'right';
    this.sprite.scale.x = 1; // Normal sprite
  }

  stopMoving() {
    this.vx = 0;
  }

  jump() {
    this.vy = this.jumpStrength;
    this.grounded = false;
  }

  castFireball(targetX, targetY) {
    console.log('=== FIREBALL DEBUG ===');
    console.log('castFireball called with targetX:', targetX, 'targetY:', targetY);
    console.log('Wizard position:', this.x, this.y);
    console.log('Canvas dimensions:', this.app.renderer.width, 'x', this.app.renderer.height);
    
    // Determine if wizard should face the target direction
    const targetDirection = targetX > this.x ? 'right' : 'left';
    
    // Flip sprite if facing opposite direction
    if (targetDirection !== this.direction) {
      this.direction = targetDirection;
      this.sprite.scale.x = targetDirection === 'right' ? 1 : -1;
      console.log('Wizard flipped to face', targetDirection);
    }
    
    this.setAnimation('attack');
    
    // Create fireball after attack animation starts
    setTimeout(() => {
      // Calculate the wizard's visual center position
      // The wizard sprite has anchor at (0.5, 0.55) 
      // This means the visual center is at the container position
      const wizardCenterX = this.x;
      const wizardCenterY = this.y;
      
      // Calculate fireball origin offset based on wizard's facing direction
      // The wizard sprite is 192x192 pixels, so half width is 96
      const spriteHalfWidth = 96;
      const spriteHalfHeight = 96;
      
      // Offset from center to top corner on the facing side
      let fireballOffsetX = 0;
      let fireballOffsetY = -spriteHalfHeight * 0.6; // Move up to top area
      
      if (this.direction === 'right') {
        fireballOffsetX = spriteHalfWidth * 0.2; // Right side
      } else {
        fireballOffsetX = -spriteHalfWidth * 0.2; // Left side
      }
      
      const fireballStartX = wizardCenterX + fireballOffsetX;
      const fireballStartY = wizardCenterY + fireballOffsetY;
      
      console.log('Wizard center:', wizardCenterX, wizardCenterY);
      console.log('Fireball start position:', fireballStartX, fireballStartY);
      console.log('Target position:', targetX, targetY);
      
      const fireball = new Fireball(this.app, fireballStartX, fireballStartY, targetX, targetY);
      this.app.stage.addChild(fireball.container);
      this.fireballs.push(fireball);
    }, 300);
  }

  update() {
    // Only update animation if animations are initialized
    if (this.animations && this.animations[this.currentAnimation]) {
      // Update animation
      if (Date.now() - this.lastFrameTime > this.frameSpeed) {
        this.lastFrameTime = Date.now();
        this.currentFrame = (this.currentFrame + 1) % this.animations[this.currentAnimation].frames;
        this.updateSpriteFrame();
        
        // If attack animation is done, revert to idle or run
        if (this.currentAnimation === 'attack' && this.currentFrame === 0) {
          if (this.vx !== 0) {
            this.setAnimation('run');
          } else {
            this.setAnimation('idle');
          }
        }
      }
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
    
    // Update container position
    this.container.position.set(this.x, this.y);
    
    // Update animation based on movement (if not attacking and animations are ready)
    if (this.animations && this.currentAnimation !== 'attack') {
      if (this.vx !== 0) {
        this.setAnimation('run');
      } else {
        this.setAnimation('idle');
      }
    }
    
    // Update fireballs
    this.fireballs = this.fireballs.filter(fireball => {
      fireball.update();
      return fireball.active;
    });
  }
}

// Fireball class for projectile attacks
class Fireball {
  constructor(app, startX, startY, targetX, targetY) {
    this.app = app;
    this.container = new PIXI.Container();
    this.active = true;
    
    // Store target for detection
    this.targetX = targetX;
    this.targetY = targetY;
    
    // Calculate direction
    const dx = targetX - startX;
    const dy = targetY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Set a consistent speed for the fireball (pixels per second)
    const speed = 300; // pixels per second
    
    // Prevent division by zero
    if (distance === 0) {
      this.vx = 0;
      this.vy = -speed; // Default upward direction
    } else {
      // Normalize the direction vector and multiply by speed
      this.vx = (dx / distance) * speed;
      this.vy = (dy / distance) * speed;
    }
    
    // Position
    this.x = startX;
    this.y = startY;
    
    // Time tracking for frame-rate independent movement
    this.lastUpdateTime = Date.now();
    
    // Animation properties for explosion sprite
    this.currentFrame = 0;
    this.frameSpeed = 100; // milliseconds per frame
    this.lastFrameTime = Date.now();
    this.frameWidth = 133;
    this.frameHeight = 155;
    this.totalFrames = 6;
    
    console.log('Fireball created:', {
      startX, startY, targetX, targetY,
      dx, dy, distance, vx: this.vx, vy: this.vy, speed
    });
    
    // Create fireball sprite using explosion sprite sheet
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.5); // Center the sprite
    
    // Load explosion texture if not already loaded
    if (!this.app.explosionTexture) {
      this.app.explosionTexture = PIXI.Texture.from('assets/explosion-sprite.avif');
    }
    
    // Create texture regions for each frame
    this.frames = [];
    for (let i = 0; i < this.totalFrames; i++) {
      const frameX = (i % 3) * this.frameWidth;
      const frameY = Math.floor(i / 3) * this.frameHeight;
      const texture = new PIXI.Texture(
        this.app.explosionTexture.baseTexture,
        new PIXI.Rectangle(frameX, frameY, this.frameWidth, this.frameHeight)
      );
      this.frames.push(texture);
    }
    
    // Set initial frame
    this.sprite.texture = this.frames[0];
    
    // Scale down the sprite to make it more appropriate for a fireball
    this.sprite.scale.set(0.4, 0.4);
    
    this.container.addChild(this.sprite);
    this.container.position.set(this.x, this.y);
  }

  update() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // Convert to seconds
    this.lastUpdateTime = currentTime;
    
    // Update animation
    if (currentTime - this.lastFrameTime > this.frameSpeed) {
      this.lastFrameTime = currentTime;
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.sprite.texture = this.frames[this.currentFrame];
    }
    
    // Update position using delta time for frame-rate independent movement
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.container.position.set(this.x, this.y);
    
    // Check for collision with skeleton
    if (this.checkSkeletonCollision()) {
      this.explode();
      return;
    }
    
    // Check for ground collision (using the same ground level as the game)
    const groundLevel = this.app.game ? this.app.game.getGroundLevel() : this.app.renderer.height - 90;
    if (this.y >= groundLevel) {
      console.log('Fireball hit ground at y:', this.y, 'ground level:', groundLevel);
      this.explode();
      return;
    }
    
    // Remove if off screen (canvas edges)
    if (this.x < 0 || this.x > this.app.renderer.width || 
        this.y < 0 || this.y > this.app.renderer.height) {
      console.log('Fireball left canvas at position:', this.x, this.y);
      this.active = false;
      this.app.stage.removeChild(this.container);
    }
  }
  
  checkSkeletonCollision() {
    // Get the skeleton instance from the app
    const skeleton = this.app.skeleton;
    if (!skeleton) {
      console.log('No skeleton found in app.skeleton');
      return false;
    }
    
    // Don't check collision if skeleton is already dead
    if (skeleton.isDead) {
      return false;
    }
    
    // Get skeleton bounds
    const skeletonBounds = this.getSkeletonBounds(skeleton);
    
    // Get fireball bounds (using sprite scale for size)
    const fireballRadius = (this.sprite.width * this.sprite.scale.x) / 2;
    const fireballBounds = {
      left: this.x - fireballRadius,
      right: this.x + fireballRadius,
      top: this.y - fireballRadius,
      bottom: this.y + fireballRadius
    };
    
    // Debug logging every few frames
    if (Math.random() < 0.01) { // Log 1% of the time to avoid spam
      console.log('=== COLLISION DEBUG ===');
      console.log('Fireball position:', this.x, this.y);
      console.log('Fireball radius:', fireballRadius);
      console.log('Fireball bounds:', fireballBounds);
      console.log('Skeleton position:', skeleton.x, skeleton.y);
      console.log('Skeleton bounds:', skeletonBounds);
      console.log('Skeleton frameWidth/Height:', skeleton.frameWidth, skeleton.frameHeight);
    }
    
    // Check for collision using bounding box intersection
    const collision = !(
      fireballBounds.left > skeletonBounds.right ||
      fireballBounds.right < skeletonBounds.left ||
      fireballBounds.top > skeletonBounds.bottom ||
      fireballBounds.bottom < skeletonBounds.top
    );
    
    // Also try simple distance-based collision as a fallback
    const distance = Math.sqrt(
      (this.x - skeleton.x) * (this.x - skeleton.x) + 
      (this.y - skeleton.y) * (this.y - skeleton.y)
    );
    const distanceCollision = distance < 50; // 50 pixel radius
    
    if (distanceCollision) {
      console.log('=== DISTANCE COLLISION DETECTED! ===');
      console.log('Distance to skeleton:', distance);
      console.log('Fireball position:', this.x, this.y);
      console.log('Skeleton position:', skeleton.x, skeleton.y);
    }
    
    if (collision) {
      console.log('=== BOUNDING BOX COLLISION DETECTED! ===');
      console.log('Fireball hit skeleton!');
      console.log('Fireball bounds:', fireballBounds);
      console.log('Skeleton bounds:', skeletonBounds);
      
      // Visual debugging - show collision bounds
      this.showCollisionBounds(fireballBounds, skeletonBounds);
    }
    
    // If collision detected, make skeleton die
    if (collision || distanceCollision) {
      skeleton.die();
    }
    
    // Return true if either collision method detects a hit
    return collision || distanceCollision;
  }
  
  showCollisionBounds(fireballBounds, skeletonBounds) {
    // Create visual indicators for collision bounds (for debugging)
    const graphics = new PIXI.Graphics();
    
    // Draw fireball bounds in red
    graphics.lineStyle(2, 0xFF0000);
    graphics.drawRect(
      fireballBounds.left, 
      fireballBounds.top, 
      fireballBounds.right - fireballBounds.left, 
      fireballBounds.bottom - fireballBounds.top
    );
    
    // Draw skeleton bounds in blue
    graphics.lineStyle(2, 0x0000FF);
    graphics.drawRect(
      skeletonBounds.left, 
      skeletonBounds.top, 
      skeletonBounds.right - skeletonBounds.left, 
      skeletonBounds.bottom - skeletonBounds.top
    );
    
    // Draw distance collision radius in green
    graphics.lineStyle(2, 0x00FF00);
    graphics.drawCircle(this.app.skeleton.x, this.app.skeleton.y, 50);
    
    this.app.stage.addChild(graphics);
    
    // Remove the debug graphics after a short delay
    setTimeout(() => {
      if (this.app.stage.children.includes(graphics)) {
        this.app.stage.removeChild(graphics);
      }
    }, 1000);
  }
  
  getSkeletonBounds(skeleton) {
    // Try to get bounds from the skeleton's sprite first
    if (skeleton.sprite && skeleton.sprite.getBounds) {
      const bounds = skeleton.sprite.getBounds();
      
      return {
        left: skeleton.x + bounds.left,
        right: skeleton.x + bounds.right,
        top: skeleton.y + bounds.top,
        bottom: skeleton.y + bounds.bottom
      };
    }
    
    // Fallback to calculated bounds
    const skeletonWidth = skeleton.frameWidth || 150; // Use frameWidth or fallback
    const skeletonHeight = skeleton.frameHeight || 100; // Use frameHeight or fallback
    
    console.log('Using calculated skeleton bounds - width:', skeletonWidth, 'height:', skeletonHeight);
    
    // Account for sprite anchor (0.5, 0.5) - sprite is centered on position
    const halfWidth = skeletonWidth / 2;
    const halfHeight = skeletonHeight / 2;
    
    return {
      left: skeleton.x - halfWidth,
      right: skeleton.x + halfWidth,
      top: skeleton.y - halfHeight,
      bottom: skeleton.y + halfHeight
    };
  }
  
  explode() {
    console.log('Fireball exploded!');
    this.active = false;
    this.app.stage.removeChild(this.container);
    
    // Create explosion effect using the explosion sprite
    const explosion = new ExplosionEffect(this.app, this.x, this.y);
    this.app.stage.addChild(explosion.container);
  }
}

// Explosion effect class for when fireball hits target
class ExplosionEffect {
  constructor(app, x, y) {
    this.app = app;
    this.container = new PIXI.Container();
    this.active = true;
    
    // Animation properties
    this.currentFrame = 0;
    this.frameSpeed = 80; // milliseconds per frame
    this.lastFrameTime = Date.now();
    this.frameWidth = 133;
    this.frameHeight = 155;
    this.totalFrames = 6;
    
    // Create explosion sprite
    this.sprite = new PIXI.Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    
    // Load explosion texture if not already loaded
    if (!this.app.explosionTexture) {
      this.app.explosionTexture = PIXI.Texture.from('assets/explosion-sprite.avif');
    }
    
    // Create texture regions for each frame
    this.frames = [];
    for (let i = 0; i < this.totalFrames; i++) {
      const frameX = (i % 3) * this.frameWidth;
      const frameY = Math.floor(i / 3) * this.frameHeight;
      const texture = new PIXI.Texture(
        this.app.explosionTexture.baseTexture,
        new PIXI.Rectangle(frameX, frameY, this.frameWidth, this.frameHeight)
      );
      this.frames.push(texture);
    }
    
    // Set initial frame
    this.sprite.texture = this.frames[0];
    
    // Scale up the explosion for better visibility
    this.sprite.scale.set(0.8, 0.8);
    
    this.container.addChild(this.sprite);
    this.container.position.set(x, y);
    
    // Start the explosion animation
    this.animate();
  }
  
  animate() {
    const currentTime = Date.now();
    
    if (currentTime - this.lastFrameTime > this.frameSpeed) {
      this.lastFrameTime = currentTime;
      this.currentFrame++;
      
      if (this.currentFrame >= this.totalFrames) {
        // Animation complete, remove explosion
        this.active = false;
        this.app.stage.removeChild(this.container);
        return;
      }
      
      this.sprite.texture = this.frames[this.currentFrame];
    }
    
    // Continue animation if still active
    if (this.active) {
      requestAnimationFrame(() => this.animate());
    }
  }
} 