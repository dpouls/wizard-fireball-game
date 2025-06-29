
export function initDrawing(entity) {
  entity.draw = function () {
    const anim = this.animations[this.currentAnimation];
    const frameX = (anim.startFrame + this.currentFrame) * this.frameWidth;
    const frameY = anim.row * this.frameHeight;

    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Save the current context state
    this.ctx.save();

    // Draw the entity
    // Assuming this code is within a draw method of the skeleton
    console.log('Drawing entity', this.direction);
if (this.direction === 'left') {
    this.ctx.save(); // Save the current state of the context
    // Translate the context to the correct position, considering the sprite's width
    this.ctx.translate(this.x + this.frameWidth, this.y);
    this.ctx.scale(-1, 1); // Flip the sprite horizontally
  
    // Draw the sprite at its width to the left of the new origin
    // Since the context is flipped, drawing at -this.frameWidth places it correctly
    this.ctx.drawImage(
      this.spriteSheet,
      frameX,
      frameY,
      this.frameWidth,
      this.frameHeight,
      -this.frameWidth, // Adjust drawing position for flipped context
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
    // Restore the context to its original state
    this.ctx.restore();

    // Draw explosions if the entity has them
    if (this.explosions) {
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
  };
}
