export class MenuParticles {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number | null = null;
  private isRunning: boolean = false;

  private particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    alpha: number;
    pulseSpeed: number;
  }> = [];

  private mouseX: number = -1000;
  private mouseY: number = -1000;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    this.resize();
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    this.initParticles();
  }

  private resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  private initParticles() {
    this.particles = [];
    const count = Math.min(85, Math.floor((window.innerWidth * window.innerHeight) / 14000));
    const colors = ['#38bdf8', '#f59e0b', '#0284c7', '#fbbf24', '#00f0ff'];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * 0.6 - 0.2, // gentle upward drift
        radius: Math.random() * 2.5 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 0.03 + 0.015,
      });
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.resize();
    this.loop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    // Clear canvas when stopped
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private loop = () => {
    if (!this.isRunning) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const w = this.canvas.width;
    const h = this.canvas.height;
    const count = this.particles.length;

    // Draw connecting constellation lines between nearby particles
    for (let i = 0; i < count; i++) {
      const p1 = this.particles[i];
      for (let j = i + 1; j < count; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * 0.22 * p1.alpha;
          this.ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
          this.ctx.lineWidth = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    // Update and draw particles
    for (let i = 0; i < count; i++) {
      const p = this.particles[i];

      // Interactive mouse repulsion
      const mdx = p.x - this.mouseX;
      const mdy = p.y - this.mouseY;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 140 && mdist > 0) {
        const force = (140 - mdist) / 140;
        p.x += (mdx / mdist) * force * 3.0;
        p.y += (mdy / mdist) * force * 3.0;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;

      // Pulse alpha
      p.alpha += Math.sin(performance.now() * p.pulseSpeed * 0.1) * 0.005;
      const drawAlpha = Math.max(0.15, Math.min(0.8, p.alpha));

      // Draw particle glowing dot
      this.ctx.save();
      this.ctx.globalAlpha = drawAlpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    this.animId = requestAnimationFrame(this.loop);
  };
}
