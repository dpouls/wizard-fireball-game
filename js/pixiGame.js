// pixiGame.js - PixiJS version of the wizard game

import { Wizard } from './pixiWizard.js';
import { Skeleton } from './pixiSkeleton.js';

class PixiGame {
  constructor() {
    this.app = null;
    this.wizard = null;
    this.skeleton = null;
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      space: false
    };
    
    // Game state
    this.gameStarted = false;
    this.playButton = null;
    this.playButtonContainer = null;
    this.isPlayButtonClick = false; // Flag to prevent fireball during play button click
    this.canvasClickHandler = null; // Store reference to canvas click handler
    
    // Skeleton respawning
    this.skeletonRespawnDelay = 200; // 2 seconds delay before spawning new skeleton
    this.skeletonRespawnTimer = null;
    
    // Skeleton death tracking
    this.skeletonsKilled = 0;
    this.skeletonKillCounter = null; // PIXI Text element to display the counter
    
    // Background and ground
    this.backgroundContainer = null;
    this.groundLevel = 0; // Will be calculated based on canvas height
    
    this.init();
  }

  init() {
    console.log('Initializing PixiJS game...');
    
    try {
      // Check if PIXI is available
      if (typeof PIXI === 'undefined') {
        throw new Error('PIXI is not loaded');
      }
      
      console.log('PIXI version:', PIXI.VERSION);
      
      // Create PIXI Application with minimal settings
      this.app = new PIXI.Application({
        width: 800,
        height: 600,
        backgroundColor: 0x1a0b2e, // Dark purple background for night sky
        antialias: false
      });

      console.log('PIXI Application created');

      // Add the canvas to the DOM
      const gameContainer = document.getElementById('gameContainer');
      if (!gameContainer) {
        throw new Error('Game container not found');
      }
      gameContainer.appendChild(this.app.view);
      console.log('Canvas added to DOM');

      // Create background and ground
      this.createBackground();

      // Create mouse coordinate display
      // this.createMouseTracker();

      // Create kill counter display
      this.createKillCounter();

      // Initialize game objects (but don't start game loop yet)
      this.initGameObjects();

      // Set up input handlers (but they won't work until game starts)
      this.setupInput();

      // Create play button overlay
      this.createPlayButton();
      
      console.log('Game initialization complete - waiting for play button click');
      
    } catch (error) {
      console.error('Error initializing PixiJS game:', error);
      this.createFallbackGame();
    }
  }

  createBackground() {
    console.log('Creating starry night background and ground...');
    
    // Create background container
    this.backgroundContainer = new PIXI.Container();
    this.app.stage.addChild(this.backgroundContainer);
    
    // Calculate ground level (same as skeleton positioning)
    this.groundLevel = this.app.renderer.height - 90;
    
    // Create night sky gradient background
    const nightSky = new PIXI.Graphics();
    nightSky.beginFill(0x1a0b2e); // Dark purple base
    nightSky.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
    nightSky.endFill();
    
    // Add purple gradient overlay for depth
    const gradientOverlay = new PIXI.Graphics();
    gradientOverlay.beginFill(0x4a1d96, 0.3); // Purple overlay with transparency
    gradientOverlay.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height / 2);
    gradientOverlay.endFill();
    
    // Add stars to the night sky
    const stars = new PIXI.Graphics();
    stars.beginFill(0xFFFFFF); // White stars
    
    // Create multiple stars of different sizes
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.app.renderer.width;
      const y = Math.random() * (this.groundLevel - 50); // Don't place stars too close to ground
      const size = 1 + Math.random() * 2; // Random star sizes
      
      // Create star shape (simple cross)
      stars.drawRect(x - size/2, y - size/2, size, size);
      
      // Add some twinkling stars (smaller dots)
      if (Math.random() > 0.7) {
        const twinkleSize = 0.5 + Math.random() * 1;
        stars.drawCircle(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10, twinkleSize);
      }
    }
    stars.endFill();
    
    // Add a few bright stars
    const brightStars = new PIXI.Graphics();
    brightStars.beginFill(0x87CEEB, 0.8); // Light blue bright stars
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * this.app.renderer.width;
      const y = Math.random() * (this.groundLevel - 100);
      const size = 2 + Math.random() * 3;
      brightStars.drawCircle(x, y, size);
    }
    brightStars.endFill();
    
    // Add some purple clouds for atmosphere
    const nightClouds = new PIXI.Graphics();
    nightClouds.beginFill(0x6a4c93, 0.4); // Purple clouds with transparency
    
    // Cloud 1
    nightClouds.drawEllipse(150, 80, 40, 25);
    nightClouds.drawEllipse(180, 80, 35, 20);
    nightClouds.drawEllipse(210, 80, 30, 25);
    
    // Cloud 2
    nightClouds.drawEllipse(500, 120, 35, 20);
    nightClouds.drawEllipse(530, 120, 30, 15);
    nightClouds.drawEllipse(560, 120, 25, 20);
    
    // Cloud 3
    nightClouds.drawEllipse(650, 60, 30, 20);
    nightClouds.drawEllipse(680, 60, 25, 15);
    
    nightClouds.endFill();
    
    // Create brownish-green ground
    const ground = new PIXI.Graphics();
    
    // Main ground surface - brownish green
    ground.beginFill(0x556b2f); // Dark olive green (brownish)
    ground.drawRect(0, this.groundLevel, this.app.renderer.width, this.app.renderer.height - this.groundLevel);
    ground.endFill();
    
    // Add grass texture on top - lighter brownish green
    ground.beginFill(0x6b8e23); // Olive drab (lighter brownish green)
    ground.drawRect(0, this.groundLevel, this.app.renderer.width, 25);
    ground.endFill();
    
    // Add some darker grass details for texture
    ground.beginFill(0x4a5d23); // Darker olive
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * this.app.renderer.width;
      const height = 5 + Math.random() * 15;
      ground.drawRect(x, this.groundLevel - height, 2, height);
    }
    ground.endFill();
    
    // Add some lighter grass highlights
    ground.beginFill(0x8fbc8f, 0.6); // Light sea green with transparency
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.app.renderer.width;
      const height = 3 + Math.random() * 8;
      ground.drawRect(x, this.groundLevel - height, 1, height);
    }
    ground.endFill();
    
    // Add some decorative elements
    this.addNightDecorations();
    
    // Add all background elements to container in proper order
    this.backgroundContainer.addChild(nightSky);
    this.backgroundContainer.addChild(gradientOverlay);
    this.backgroundContainer.addChild(stars);
    this.backgroundContainer.addChild(brightStars);
    this.backgroundContainer.addChild(nightClouds);
    this.backgroundContainer.addChild(ground);
    
    console.log(`Starry night background created with ground level at y=${this.groundLevel}`);
  }

  addNightDecorations() {
    // Add some dark trees and rocks for the night scene
    const decorations = new PIXI.Graphics();
    
    // Tree 1 - darker for night
    decorations.beginFill(0x3d2b1f); // Dark brown trunk
    decorations.drawRect(50, this.groundLevel - 80, 15, 80);
    decorations.endFill();
    decorations.beginFill(0x2d5016); // Dark green leaves for night
    decorations.drawEllipse(57, this.groundLevel - 100, 30, 40);
    decorations.endFill();
    
    // Tree 2 - darker for night
    decorations.beginFill(0x3d2b1f); // Dark brown trunk
    decorations.drawRect(700, this.groundLevel - 60, 12, 60);
    decorations.endFill();
    decorations.beginFill(0x2d5016); // Dark green leaves for night
    decorations.drawEllipse(706, this.groundLevel - 80, 25, 35);
    decorations.endFill();
    
    // Add some dark rocks
    decorations.beginFill(0x4a4a4a); // Dark gray rocks
    decorations.drawEllipse(200, this.groundLevel - 5, 15, 10);
    decorations.drawEllipse(400, this.groundLevel - 8, 12, 8);
    decorations.drawEllipse(600, this.groundLevel - 6, 18, 12);
    decorations.endFill();
    
    // Add some darker rocks
    decorations.beginFill(0x2d2d2d); // Very dark gray
    decorations.drawEllipse(300, this.groundLevel - 3, 10, 6);
    decorations.drawEllipse(550, this.groundLevel - 4, 8, 5);
    decorations.endFill();
    
    this.backgroundContainer.addChild(decorations);
  }

  createFallbackGame() {
    console.log('Creating fallback game with basic HTML5 Canvas...');
    
    const gameContainer = document.getElementById('gameContainer');
    if (!gameContainer) return;
    
    // Create a basic canvas fallback
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    canvas.style.backgroundColor = '#808080';
    gameContainer.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    // Draw some text
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Fallback Canvas Game', 200, 300);
    
    console.log('Fallback game created');
  }

  initGameObjects() {
    console.log('Initializing game objects...');
    
    try {
      // Create wizard but don't add to stage yet
      this.wizard = new Wizard(this.app);
      console.log('Wizard created (not added to stage yet)');
      
      // Create skeleton but don't add to stage yet
      this.createNewSkeleton();
      
      // Make game instance accessible to game objects
      this.app.game = this;
      
      // Position wizard at center bottom on the ground
      this.wizard.setPosition(400, this.groundLevel);
      console.log('Wizard positioned on ground level');
      
    } catch (error) {
      console.error('Error initializing game objects:', error);
    }
  }

  createNewSkeleton() {
    console.log('Creating new skeleton...');
    
    // Create skeleton but don't add to stage yet
    this.skeleton = new Skeleton(this.app);
    console.log('Skeleton created (not added to stage yet)');
    
    // Make skeleton accessible to other game objects (like fireballs)
    this.app.skeleton = this.skeleton;
    
    // Position skeleton on the left side on the ground
    this.skeleton.setPosition(100, this.groundLevel);
    console.log('Skeleton positioned on ground level');
    
    // Override the skeleton's removeFromGame method to trigger respawning
    const originalRemoveFromGame = this.skeleton.removeFromGame.bind(this.skeleton);
    this.skeleton.removeFromGame = () => {
      console.log('Skeleton removed, scheduling respawn...');
      originalRemoveFromGame();
      this.incrementKillCounter(); // Increment the kill counter
      this.scheduleSkeletonRespawn();
    };
  }

  scheduleSkeletonRespawn() {
    console.log(`Scheduling skeleton respawn in ${this.skeletonRespawnDelay}ms...`);
    
    // Clear any existing timer
    if (this.skeletonRespawnTimer) {
      clearTimeout(this.skeletonRespawnTimer);
    }
    
    // Set timer to create new skeleton
    this.skeletonRespawnTimer = setTimeout(() => {
      if (this.gameStarted) {
        this.spawnNewSkeleton();
      }
    }, this.skeletonRespawnDelay);
  }

  spawnNewSkeleton() {
    console.log('Spawning new skeleton...');
    
    // Only spawn if game is started and no skeleton exists
    if (!this.gameStarted || this.skeleton) {
      console.log('Cannot spawn skeleton - game not started or skeleton already exists');
      return;
    }
    
    // Create new skeleton
    this.createNewSkeleton();
    
    // Add to stage if game is running
    if (this.skeleton) {
      this.app.stage.addChild(this.skeleton.container);
      console.log('New skeleton added to stage');
    }
  }

  setupInput() {
    // Keyboard input
    window.addEventListener('keydown', (e) => {
      if (e.key === 'w') this.keys.w = true;
      if (e.key === 'a') this.keys.a = true;
      if (e.key === 's') this.keys.s = true;
      if (e.key === 'd') this.keys.d = true;
      if (e.key === ' ') this.keys.space = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'w') this.keys.w = false;
      if (e.key === 'a') this.keys.a = false;
      if (e.key === 's') this.keys.s = false;
      if (e.key === 'd') this.keys.d = false;
      if (e.key === ' ') this.keys.space = false;
    });

    // Mouse coordinate tracker
    if (this.app && this.app.view) {
      this.app.view.addEventListener('mousemove', (e) => {
        const rect = this.app.view.getBoundingClientRect();
        
        // Calculate coordinates relative to the actual canvas size (not the scaled display size)
        const canvasWidth = this.app.view.width;  // 800
        const canvasHeight = this.app.view.height; // 600
        const displayWidth = rect.width;  // 1886.666748046875
        const displayHeight = rect.height; // 1050
        
        // Scale the coordinates from display size to canvas size
        const x = (e.clientX - rect.left) * (canvasWidth / displayWidth);
        const y = (e.clientY - rect.top) * (canvasHeight / displayHeight);
        
        // Update visual display with scaled coordinates
        if (this.mouseText) {
          this.mouseText.text = `Mouse: (${Math.round(x)}, ${Math.round(y)})`;
        }
      });
    }

    // Note: Canvas click handler will be set up in startGame() method
    console.log('Input setup complete - canvas click handler will be set up when game starts');
  }

  createMouseTracker() {
    // Create text display for mouse coordinates
    this.mouseText = new PIXI.Text('Mouse: (0, 0)', {
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 2
    });
    this.mouseText.position.set(10, 10);
    this.app.stage.addChild(this.mouseText);
  }

  createKillCounter() {
    // Create text display for skeleton kill counter
    this.skeletonKillCounter = new PIXI.Text('Skeletons Killed: 0', {
      fontFamily: 'Arial',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0x00FF00, // Green color to make it stand out
      stroke: 0x000000,
      strokeThickness: 3
    });
    this.skeletonKillCounter.position.set(10, 35);
    this.app.stage.addChild(this.skeletonKillCounter);
  }

  updateKillCounter() {
    if (this.skeletonKillCounter) {
      this.skeletonKillCounter.text = `Skeletons Killed: ${this.skeletonsKilled}`;
      
      // Change color based on kill count for visual feedback
      if (this.skeletonsKilled >= 10) {
        this.skeletonKillCounter.style.fill = 0xFFD700; // Gold for 10+ kills
      } else if (this.skeletonsKilled >= 5) {
        this.skeletonKillCounter.style.fill = 0xFFA500; // Orange for 5+ kills
      } else {
        this.skeletonKillCounter.style.fill = 0x00FF00; // Green for <5 kills
      }
    }
  }

  incrementKillCounter() {
    this.skeletonsKilled++;
    this.updateKillCounter();
    console.log(`Skeleton killed! Total: ${this.skeletonsKilled}`);
  }

  resetKillCounter() {
    this.skeletonsKilled = 0;
    this.updateKillCounter();
    console.log('Kill counter reset to 0');
  }

  createPlayButton() {
    console.log('Creating play button overlay...');
    
    // Create container for the play button overlay
    this.playButtonContainer = new PIXI.Container();
    this.app.stage.addChild(this.playButtonContainer);
    
    // Create semi-transparent background overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(0x000000, 0.8);
    overlay.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
    overlay.endFill();
    this.playButtonContainer.addChild(overlay);
    
    // Add title text
    const titleText = new PIXI.Text('WIZARD GAME', {
      fontFamily: 'Arial',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4
    });
    titleText.anchor.set(0.5, 0.5);
    titleText.position.set(
      this.app.renderer.width / 2,
      this.app.renderer.height / 2 - 120
    );
    this.playButtonContainer.addChild(titleText);
    
    // Add subtitle/instructions
    const subtitleText = new PIXI.Text('Click to start your magical adventure!', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xCCCCCC,
      stroke: 0x000000,
      strokeThickness: 2
    });
    subtitleText.anchor.set(0.5, 0.5);
    subtitleText.position.set(
      this.app.renderer.width / 2,
      this.app.renderer.height / 2 - 80
    );
    this.playButtonContainer.addChild(subtitleText);
    
    // Create play button background
    const buttonBg = new PIXI.Graphics();
    buttonBg.beginFill(0x4CAF50);
    buttonBg.lineStyle(3, 0x2E7D32);
    buttonBg.drawRoundedRect(0, 0, 200, 80, 10);
    buttonBg.endFill();
    
    // Create play button text
    const buttonText = new PIXI.Text('PLAY GAME', {
      fontFamily: 'Arial',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 2
    });
    buttonText.anchor.set(0.5, 0.5);
    buttonText.position.set(100, 40);
    
    // Create button container
    this.playButton = new PIXI.Container();
    this.playButton.addChild(buttonBg);
    this.playButton.addChild(buttonText);
    this.playButton.position.set(
      (this.app.renderer.width - 200) / 2,
      (this.app.renderer.height - 80) / 2
    );
    
    // Make button interactive
    this.playButton.eventMode = 'static';
    this.playButton.cursor = 'pointer';
    
    // Add hover effects
    this.playButton.on('pointerover', () => {
      buttonBg.tint = 0x66BB6A;
    });
    
    this.playButton.on('pointerout', () => {
      buttonBg.tint = 0xFFFFFF;
    });
    
    // Add click handler
    this.playButton.on('pointerdown', (event) => {
      console.log('Play button clicked!');
      // Set flag to prevent fireball casting
      this.isPlayButtonClick = true;
      
      // Prevent the click from bubbling up to the canvas
      event.stopPropagation();
      event.preventDefault();
      
      // Start the game after a short delay to ensure the flag is set
      setTimeout(() => {
        this.startGame();
        this.isPlayButtonClick = false; // Reset flag
      }, 10);
    });
    
    this.playButtonContainer.addChild(this.playButton);
    
    // Add controls info
    const controlsText = new PIXI.Text('Controls: WASD to move, SPACE to jump, CLICK to cast fireballs', {
      fontFamily: 'Arial',
      fontSize: 14,
      fill: 0xAAAAAA,
      stroke: 0x000000,
      strokeThickness: 1
    });
    controlsText.anchor.set(0.5, 0.5);
    controlsText.position.set(
      this.app.renderer.width / 2,
      this.app.renderer.height / 2 + 80
    );
    this.playButtonContainer.addChild(controlsText);
    
    console.log('Play button overlay created');
  }

  startGame() {
    console.log('Starting game...');
    
    // Remove play button overlay
    if (this.playButtonContainer) {
      this.app.stage.removeChild(this.playButtonContainer);
      this.playButtonContainer = null;
      this.playButton = null;
    }
    
    // Add game objects to the stage now that the game is starting
    if (this.wizard) {
      this.app.stage.addChild(this.wizard.container);
      console.log('Wizard added to stage');
    }
    
    if (this.skeleton) {
      this.app.stage.addChild(this.skeleton.container);
      console.log('Skeleton added to stage');
    }
    
    // Start the game loop
    this.gameStarted = true;
    
    // Set up canvas click handler for fireballs with a delay to ensure play button click is processed
    setTimeout(() => {
      if (this.app && this.app.view) {
        console.log('Setting up canvas click handler for fireballs');
        this.canvasClickHandler = (e) => {
          // Only allow fireball casting if game has actually started
          if (!this.gameStarted) {
            console.log('Game not started yet, ignoring click');
            return;
          }
          
          console.log('=== MOUSE CLICK DEBUG ===');
          console.log('Raw click coordinates:', e.clientX, e.clientY);
          console.log('Canvas element:', this.app.view);
          
          const rect = this.app.view.getBoundingClientRect();
          console.log('Canvas bounding rect:', rect);
          
          // Try using PIXI's coordinate conversion
          const globalPos = new PIXI.Point(e.clientX, e.clientY);
          const localPos = this.app.stage.toLocal(globalPos);
          
          console.log('PIXI global position:', globalPos);
          console.log('PIXI local position:', localPos);
          
          // Calculate coordinates relative to the actual canvas size (not the scaled display size)
          const canvasWidth = this.app.view.width;  // 800
          const canvasHeight = this.app.view.height; // 600
          const displayWidth = rect.width;  // 1886.666748046875
          const displayHeight = rect.height; // 1050
          
          // Scale the coordinates from display size to canvas size
          const x = (e.clientX - rect.left) * (canvasWidth / displayWidth);
          const y = (e.clientY - rect.top) * (canvasHeight / displayHeight);
          
          console.log('Canvas actual size:', canvasWidth, 'x', canvasHeight);
          console.log('Canvas display size:', displayWidth, 'x', displayHeight);
          console.log('Scaled coordinates:', x, y);
          console.log('Calculated relative position:', x, y);
          console.log('Canvas size:', this.app.view.width, 'x', this.app.view.height);
          console.log('Canvas style size:', this.app.view.style.width, 'x', this.app.view.style.height);
          console.log('Canvas transform:', this.app.view.style.transform);
          console.log('Canvas CSS:', window.getComputedStyle(this.app.view));
          
          if (this.wizard) {
            console.log('Calling wizard.castFireball with scaled coords:', x, y);
            this.wizard.castFireball(x, y);
          }
        };
        
        this.app.view.addEventListener('click', this.canvasClickHandler);
      }
    }, 150); // Delay to ensure play button click is fully processed
    
    this.gameLoop();
    
    console.log('Game started successfully');
  }

  update() {
    // Only update if game has started
    if (!this.gameStarted) {
      return;
    }
    
    // Update wizard movement
    if (this.wizard) {
      if ((this.keys.space || this.keys.w) && this.wizard.grounded) {
        this.wizard.jump();
      }
      
      if (this.keys.a) {
        this.wizard.moveLeft();
      } else if (this.keys.d) {
        this.wizard.moveRight();
      } else {
        this.wizard.stopMoving();
      }

      this.wizard.update();
    }
    
    // Update skeleton
    if (this.skeleton) {
      this.skeleton.update();
    }
  }

  gameLoop() {
    // Only run game loop if game has started
    if (this.gameStarted) {
      this.update();
    }
    requestAnimationFrame(() => this.gameLoop());
  }

  // Getter method for ground level
  getGroundLevel() {
    return this.groundLevel;
  }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, starting game...');
  new PixiGame();
}); 