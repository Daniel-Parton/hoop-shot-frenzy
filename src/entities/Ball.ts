import { Scaler } from '@/utils/Scaler';
import { GameColors } from 'config/GameColors';
import { EventController } from '@/config/EventController';
import { getSceneBounds } from '@/utils/SceneHelper';
import { GameDepths } from '@/config/GameDepths';

const trajectoryScaler = new Scaler({
  rawMin: -1000,
  rawMax: 1000,
  scaleMin: -300,
  scaleMax: 300
});

export class Ball extends Phaser.Physics.Arcade.Sprite {
  gameEvents: EventController;
  animation: Phaser.Animations.Animation;
  start?: Phaser.Math.Vector2;
  end?: Phaser.Math.Vector2;
  isDown: boolean = false;
  isLaunched: boolean = false;
  hasReachedApex: boolean = false;
  justScored: boolean = false;
  justMissed: boolean = false;
  rimHit: boolean = false;
  startTrackTimeEvent: Phaser.Time.TimerEvent;
  idleYPosition: number;
  idleScale: number = 1.5;
  launchScale: number = 0.9;
  launchParticles: Phaser.GameObjects.Particles.ParticleEmitter;

  streak: number = 0;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'ball', 0);
    this.gameEvents = new EventController(scene);
    this.idleYPosition = y;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this._init();

    // this.setPosition(x + 50, 150);
    // this.setScale(this.launchScale);
    // this.setGravityY(1800);
  }

  private _init() {
    this.setDepth(4);
    this.setScale(this.idleScale);
    this.body.setCircle(this.width / 2);
    this.setBounceY(1.2);
    this.setBounceX(0.8);
    this.setInteractive({
      cursor: 'grab'
    } as Phaser.Types.Input.InputConfiguration);

    this._initLaunchParticles();
    this._listenForInputs();

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    this.gameEvents.ballAtApex.listen(() => {
      this.setDepth(GameDepths.net - 1);
    });
    this.gameEvents.scoreUpdated.listen(({ streak }) => {
      this.streak = streak;
    });
  }

  private _initLaunchParticles() {
    this.launchParticles = this.scene.add.particles(
      null,
      null,
      'shoot-particle',
      {
        quantity: 10,
        tint: GameColors.white.color,
        color: [GameColors.white.color],
        speedY: { min: 20, max: 50 },
        gravityY: -1800,
        lifespan: { min: 100, max: 300 },
        alpha: { start: 0.5, end: 0, ease: 'Sine.easeIn' },
        scale: { start: 0.3, end: 0.3 },
        frequency: 30,
        blendMode: Phaser.BlendModes.ADD,
        follow: this,
        followOffset: { y: this.height * 0.8, x: 0 },
        delay: 0
      }
    );
  }

  update(_, delta: number): void {
    if (this.isLaunched && !this.hasReachedApex && this.body.velocity.y > 0) {
      this.hasReachedApex = true;
      this.launchParticles.stop();
      this.gameEvents.ballAtApex.fire();
    }

    if (this.isLaunched && this.y > this.scene.scale.height + 250) {
      this.gameEvents.ballReset.fire();
      this._reset();
    }
  }

  private _handleDragStart(pointer: Phaser.Input.Pointer) {
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
  }

  private _handleDragEnd(pointer: Phaser.Input.Pointer) {
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
        this._launch(xTrajectory);
      } else {
        this.tween({ scale: this.idleScale, duration: 100 });
        this.scene.game.canvas.style.cursor = 'grab';
      }
    } else {
      this.tween({ scale: this.idleScale, duration: 100 });
    }
  }

  private _launch(xTrajectory: number) {
    //Turn off listeners when we decide to launch
    this._stopListeningForInputs();

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

  private _reset() {
    this.isLaunched = false;
    this.isDown = false;
    this.hasReachedApex = false;
    this.justScored = false;
    this.justMissed = false;
    this.rimHit = false;
    this.setDepth(GameDepths.ball);
    this.setGravityY(0);
    this.setVelocity(0, 0);
    this.setRotation(0);
    this.setScale(this.idleScale);

    const bounds = getSceneBounds(this.scene);

    const halfWidth = this.displayWidth / 2;
    this.setPosition(
      this.streak > 2
        ? Phaser.Math.Between(bounds.left + halfWidth, bounds.right - halfWidth)
        : bounds.centerX,
      this.scene.scale.height + this.height
    );
    this.tween({
      y: this.idleYPosition,
      duration: 300,
      ease: Phaser.Math.Easing.Back.Out,
      onComplete: () => {
        this._listenForInputs();
      }
    });
  }

  tween(options: {
    y?: number;
    scale?: number;
    rotation?: number;
    duration: number;
    ease?: string | Function;
    onComplete?: () => void;
  }) {
    this.scene.tweens.add({
      targets: this,
      ease: Phaser.Math.Easing.Linear,
      ...options
    });
  }

  private _listenForInputs() {
    this.on('pointerdown', this._handleDragStart, this);
    this.scene.input.on('pointerup', this._handleDragEnd, this);
    this.scene.input.on('pointerupoutside', this._handleDragEnd, this);
  }

  private _stopListeningForInputs() {
    this.off('pointerdown', this._handleDragStart, this);
    this.scene.input.off('pointerup', this._handleDragEnd, this);
    this.scene.input.off('pointerupoutside', this._handleDragEnd, this);
  }
}
