function animateConfetti(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight || 450;

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const particles = Array.from({ length: 90 }, () => ({
        x: Math.random() * canvas.width,
        y: canvas.height + Math.random() * 30,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 12 - 7,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 4,
        tilt: Math.random() * 10 - 5,
        tiltAngle: 0,
        tiltAngleIncremental: Math.random() * 0.08 + 0.02
    }));

    let isRunning = true;
    function run() {
        if (!isRunning) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        particles.forEach(p => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += p.vy;
            p.x += p.vx;
            p.vy += 0.22; // gravity
            p.vx *= 0.985; // drag
            p.tilt = Math.sin(p.tiltAngle) * 14;

            if (p.y < canvas.height + 20) {
                alive = true;
            }

            ctx.beginPath();
            ctx.lineWidth = p.size;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.size / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.size / 2);
            ctx.stroke();
        });
        if (alive) {
            requestAnimationFrame(run);
        }
    }
    run();
    return () => { isRunning = false; };
}

// Make globally available
window.animateConfetti = animateConfetti;
