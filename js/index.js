// index.js

import Wizard from "./wizardModule.js";
import Skeleton from "./skeleton.js";
import { initAnimations, initExplosions } from "./animation.js";
import { initMovement } from "./movement.js";
import { initDrawing } from "./draw.js";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("wizardCanvas");
  if (!canvas) {
    console.error("Canvas element with id 'wizardCanvas' not found.");
    return;
  }
  const ctx = canvas.getContext("2d");

  const wizard = new Wizard(canvas, ctx, "assets/wizardSprite.png");
  const skeleton = new Skeleton(canvas, ctx, "assets/skeleton-sprite.png");

  // Initialize animations, explosions, movement, and drawing for the wizard
  initAnimations(wizard);
  initExplosions(wizard);
  initMovement(wizard);

  // Combine the entities in a list
  const entities = [wizard, skeleton];

  // // Update the main drawing function to handle all entities
  function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    entities.forEach((entity) => {
      entity.update();
      entity.draw();
    });

    requestAnimationFrame(drawAll);
  }

  // // Start the drawing loop
  drawAll();
  const carousels = document.querySelectorAll('.carousel-container');

  carousels.forEach(carouselContainer => {
    const carousel = carouselContainer.querySelector('.carousel');
    const prevButton = carouselContainer.querySelector('.carousel-button.prev');
    const nextButton = carouselContainer.querySelector('.carousel-button.next');
    const images = carousel.querySelectorAll('img');
    let currentIndex = 0;

    function updateCarousel() {
      const offset = -currentIndex * 100;
      carousel.style.transform = `translateX(${offset}%)`;
    }

    prevButton.addEventListener('click', () => {
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
      updateCarousel();
    });

    nextButton.addEventListener('click', () => {
      currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
      updateCarousel();
    });
  });
});
