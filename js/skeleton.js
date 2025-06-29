// skeleton.js

export default class Skeleton {
  constructor(canvas, ctx, spriteSheetSrc) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = 100; // Initial x position
    this.y = 100; // Initial y position
    this.vx = 7; // Horizontal velocity
    this.vy = 0;
    this.gravity = 0.5;
    this.grounded = false;
    this.direction = "right";

    this.animations = {
      walk: { startFrame: 0, frames: 6, row: 1 },
    };
    this.currentAnimation = "walk";
    this.currentFrame = 0;
    this.frameWidth = 300;
    this.frameHeight = 195;
    this.frameSpeed = 100;
    this.lastFrameTime = 0;

    this.spriteSheet = new Image();
    this.spriteSheet.src = spriteSheetSrc;

    this.spriteSheet.onload = () => {
      this.ready = true;
    };
  }

  update() {
    if (this.ready && Date.now() - this.lastFrameTime > this.frameSpeed) {
      this.lastFrameTime = Date.now();
      this.currentFrame =
        (this.currentFrame + 1) % this.animations[this.currentAnimation].frames;
    }

    // Update position based on velocity
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;

    // Simple ground collision
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
    // if (this.currentAnimation !== "attack") {
    //   if (this.vx !== 0) {
    //     this.setAnimation("run");
    //   } else {
    //     this.setAnimation("idle");
    //   }
    // }
    if (
      this.x + this.frameWidth / 2 >= this.canvas.width &&
      this.direction === "right"
    ) {
      this.direction = "left";
      this.vx = -this.vx; // Reverse velocity
    } else if (this.x <= 0 && this.direction === "left") {
      this.direction = "right";
      this.vx = Math.abs(this.vx); // Ensure velocity is positive for moving right
    }
  }

  draw() {
    if (!this.ready) return;
    const anim = this.animations[this.currentAnimation];
    const frameX = (anim.startFrame + this.currentFrame) * this.frameWidth;
    const frameY = anim.row * this.frameHeight;
    const flipOffset = 50; // Adjust this value as needed

    if (this.direction === "left") {
      this.ctx.save(); // Save the current state of the context
      // Translate the context to the correct position, considering the sprite's width
      this.ctx.translate(this.x + this.frameWidth + flipOffset, this.y);
      this.ctx.scale(-1, 1); // Flip the sprite horizontally

      // Draw the sprite at its width to the left of the new origin
      // Since the context is flipped, drawing at -this.frameWidth places it correctly
      this.ctx.drawImage(
        this.spriteSheet,
        frameX,
        frameY,
        this.frameWidth,
        this.frameHeight,
        this.frameWidth, // Adjust drawing position for flipped context
        0, // Y position adjusted by translate
        this.frameWidth,
        this.frameHeight
      );
      this.ctx.restore(); // Restore the context to its original state
    } else {
      // Draw the sprite normally if not flipping
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
  }
}
