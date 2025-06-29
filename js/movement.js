
export function initMovement(wizard) {
    // Key state tracking
    const keys = {
        w: false,
        a: false,
        s: false,
        d: false,
        space: false
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === 'w') keys.w = true;
        if (e.key === 'a') keys.a = true;
        if (e.key === 's') keys.s = true;
        if (e.key === 'd') keys.d = true;
        if(e.key === ' ') keys.space = true;
    });

    window.addEventListener('keyup', (e) => {
        if (e.key === 'w') keys.w = false;
        if (e.key === 'a') keys.a = false;
        if (e.key === 's') keys.s = false;
        if (e.key === 'd') keys.d = false;
        if(e.key === ' ') keys.space = false;
    });

    function updateMovement() {
        if ((keys.space || keys.w) && wizard.grounded) {
            wizard.vy = wizard.jumpStrength;
            wizard.grounded = false;
        }
        if (keys.a) {
            wizard.vx = -4;
            wizard.direction = 'left';
        } else if (keys.d) {
            wizard.vx = 4;
            wizard.direction = 'right';
        } else {
            wizard.vx = 0;
        }

        requestAnimationFrame(updateMovement);
    }

    updateMovement();
}