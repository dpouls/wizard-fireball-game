export default class Wizard {
  
  constructor(canvas, ctx, spriteSheetSrc) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.spriteSheet = new Image();
    this.spriteSheet.src = spriteSheetSrc;

    this.animations = {};
    this.currentAnimation = "idle";
    this.currentFrame = 0;
    this.frameWidth = 192; // Updated frame width
    this.frameHeight = 192; // Updated frame height
    this.frameSpeed = 100; // milliseconds per frame
    this.lastFrameTime = 0;

    // Explosion properties
    this.explosionSprite = new Image();
    this.explosionSprite.src = "assets/explosion-sprite.avif";
    this.explosionFrameWidth = 133;
    this.explosionFrameHeight = 155;
    this.explosionFrames = 6; // Total number of frames in the explosion animation
    this.explosionFrameSpeed = 150; // milliseconds per frame for the explosion
    this.explosions = []; // Array to track explosions

    // Position and velocity
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 0.4;
    this.jumpStrength = -10;
    this.grounded = false;

    // Direction
    this.direction = "right";

    this.spriteSheet.onload = () => {
      this.start();
    };

    // Resize canvas to fit window
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Add event listener for mouse clicks
    window.addEventListener("click", (e) => this.handleClick(e));
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  setAnimation(animation) {
    if (this.animations[animation] && this.currentAnimation !== animation) {
      this.currentAnimation = animation;
      this.currentFrame = 0;
    }
  }

  handleClick(event) {
    this.setAnimation("attack");
    setTimeout(() => {
      this.addExplosion(event.clientX, event.clientY);
    }, 500);
    // this.addExplosion(event.clientX, event.clientY);
  }

  addExplosion(x, y) {
    this.explosions.push({
      x: x,
      y: y,
      currentExplosionFrame: 0,
      lastFrameTime: Date.now(),
    });
  }

  update() {
    if (
      this.animations[this.currentAnimation] &&
      Date.now() - this.lastFrameTime > this.frameSpeed
    ) {
      this.lastFrameTime = Date.now();
      this.currentFrame =
        (this.currentFrame + 1) % this.animations[this.currentAnimation].frames;

      // If attack animation is done, revert to idle or run based on movement
      if (this.currentAnimation === "attack" && this.currentFrame === 0) {
        if (this.vx !== 0) {
          this.setAnimation("run");
        } else {
          this.setAnimation("idle");
        }
      }
    }

    // Update position based on velocity
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    const groundOffset = 90;
    // Simple ground collision
    if (this.y + this.frameHeight > this.canvas.height - groundOffset) {
      this.y = this.canvas.height - this.frameHeight - groundOffset; // Raise the ground
      this.vy = 0;
      this.grounded = true;
    } else {
      this.grounded = false;
    }

    // Update animation based on movement if not attacking
    if (this.currentAnimation !== "attack") {
      if (this.vx !== 0) {
        this.setAnimation("run");
      } else {
        this.setAnimation("idle");
      }
    }

    // Update explosions
    const now = Date.now();
    this.explosions = this.explosions.filter((explosion) => {
      if (now - explosion.lastFrameTime > this.explosionFrameSpeed) {
        explosion.lastFrameTime = now;
        explosion.currentExplosionFrame++;
      }
      return explosion.currentExplosionFrame < this.explosionFrames;
    });
  }

  draw() {
    const anim = this.animations[this.currentAnimation];
    const frameX = (anim.startFrame + this.currentFrame) * this.frameWidth;
    const frameY = anim.row * this.frameHeight;

    // Save the current context state
    this.ctx.save();

    // Draw the wizard
    if (this.direction === "left") {
      // Flip the context horizontally
      this.ctx.scale(-1, 1);
      // Adjust the position to flip the sprite
      this.ctx.drawImage(
        this.spriteSheet,
        frameX,
        frameY,
        this.frameWidth,
        this.frameHeight,
        -this.x - this.frameWidth,
        this.y,
        this.frameWidth,
        this.frameHeight
      );
    } else {
      this.ctx.drawImage(
        this.spriteSheet,
        frameX,
        frameY,
        this.frameWidth,
        this.frameHeight,
        this.x,
        this.y,
        this.frameWidth,
        this.frameHeight
      );
    }

    // Restore the context to its original state
    this.ctx.restore();

    // Draw explosions
    this.explosions.forEach((explosion) => {
      const explosionFrameX =
        (explosion.currentExplosionFrame % 3) * this.explosionFrameWidth;
      const explosionFrameY =
        Math.floor(explosion.currentExplosionFrame / 3) *
        this.explosionFrameHeight;
      this.ctx.drawImage(
        this.explosionSprite,
        explosionFrameX,
        explosionFrameY,
        this.explosionFrameWidth,
        this.explosionFrameHeight,
        explosion.x - this.explosionFrameWidth / 2,
        explosion.y - this.explosionFrameHeight / 2,
        this.explosionFrameWidth,
        this.explosionFrameHeight
      );
    });
  }

  start() {
    const loop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
console.log("wizardModule.js loaded");
