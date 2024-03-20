import { GAME_CONFIG } from '@/config';
import { Scaler } from '@/utils/Scaler';

const trajectoryScaler = new Scaler({
  rawMin: -1000,
  rawMax: 1000,
  scaleMin: -200,
  scaleMax: 200
});

export class Ball extends Phaser.Physics.Arcade.Sprite {
  animation: Phaser.Animations.Animation;
  start?: Phaser.Math.Vector2;
  end?: Phaser.Math.Vector2;
  isDown: boolean = false;
  isLaunched: boolean = false;
  hasReachedApex: boolean = false;
  justScored: boolean = false;
  startTrackTimeEvent: Phaser.Time.TimerEvent;
  idlePosition: Phaser.Math.Vector2;
  idleScale: number = 1.5;
  launchScale: number = 0.9;
  launchParticles: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ball', 0);
    this.idlePosition = new Phaser.Math.Vector2(x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.init();

    // this.setPosition(x + 50, 150);
    // this.setScale(this.launchScale);
    // this.setGravityY(1800);
  }

  private init() {
    this.setDepth(4);
    this.setScale(this.idleScale);
    this.body.setCircle(this.width / 2);
    this.setBounceY(0.8);
    this.setBounceX(0.8);
    this.setInteractive({
      cursor: 'grab'
    } as Phaser.Types.Input.InputConfiguration);

    this.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.scene.game.canvas.style.cursor = 'grabbing';
      this.isDown = true;
      this.startTrackTimeEvent = this.scene.time.addEvent({
        delay: 200,
        callback: () => {
          this.start = new Phaser.Math.Vector2(pointer.x, pointer.y);
        },
        callbackScope: this,
        loop: true
      });
      this.tween({ scale: this.idleScale * 1.1, duration: 100 });
      this.start = new Phaser.Math.Vector2(pointer.x, pointer.y);
    });

    this.scene.input.on(
      'pointerup',
      (pointer: Phaser.Input.Pointer) => {
        if (this.startTrackTimeEvent) {
          this.startTrackTimeEvent.destroy();
        }
        if (this.isDown) {
          this.isDown = false;
          this.end = new Phaser.Math.Vector2(pointer.x, pointer.y);

          if (this.end.y < this.start.y) {
            const slope = new Phaser.Math.Vector2(
              this.end.x - this.start.x,
              this.end.y - this.start.y
            );
            var xTrajectory = (-2300 * slope.x) / slope.y;
            this.launch(xTrajectory);
          } else {
            this.tween({ scale: this.idleScale, duration: 100 });
            this.scene.game.canvas.style.cursor = 'grab';
          }
        } else {
          this.tween({ scale: this.idleScale, duration: 100 });
        }
      },
      this
    );

    this.launchParticles = this.scene.add.particles(
      null,
      null,
      'shoot-particle',
      {
        quantity: 10,
        speedY: { min: 20, max: 50 },
        lifespan: { min: 100, max: 300 },
        alpha: { start: 0.5, end: 0, ease: 'Sine.easeIn' },
        scale: { start: 0.3, end: 0.1 },
        blendMode: 'ADD',
        frequency: 30,
        follow: this,
        followOffset: { y: this.height / 2, x: 0 },
        delay: 0
      }
    );
    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  update(_, delta: number): void {
    if (this.isLaunched && !this.hasReachedApex && this.body.velocity.y > 0) {
      this.hasReachedApex = true;
      this.launchParticles.stop();
      this.scene.events.emit(GAME_CONFIG.events.ballAtApex);
    }
  }

  launch(xTrajectory: number) {
    this.isLaunched = true;
    this.hasReachedApex = false;
    this.launchParticles.start();
    this.scene.sound.play('shoot');
    xTrajectory = trajectoryScaler.scale(xTrajectory);

    //right rim passthrough miss
    // xTrajectory = 164.07142857142927;

    //right rim passthrough and bounce
    // xTrajectory = 40;

    this.setGravityY(1800);
    this.setVelocityY(-1750);
    this.setVelocityX(xTrajectory);
    this.setRotation(xTrajectory / 3);
    this.tween({
      scale: this.launchScale,
      rotation: xTrajectory > 0 ? Math.PI / 4 : -Math.PI / 4, // Rotate 45 degrees clockwise or counterclockwise
      duration: 800
    });
  }

  reset() {
    this.isLaunched = false;
    this.isDown = false;
    this.hasReachedApex = false;
    this.justScored = false;
    this.setDepth(4);
    this.setGravityY(0);
    this.setVelocity(0, 0);
    this.setRotation(0);
    this.setScale(this.idleScale);
    this.setPosition(this.idlePosition.x, this.idlePosition.y - 150);
    this.tween({ y: this.idlePosition.y, duration: 250 });
  }

  private tween(options: {
    y?: number;
    scale?: number;
    rotation?: number;
    duration: number;
  }) {
    this.scene.tweens.add({
      targets: this,
      ease: Phaser.Math.Easing.Linear,
      ...options
    });
  }
}
