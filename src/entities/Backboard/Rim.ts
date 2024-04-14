import { GameDepths } from '@/config/GameDepths';
import { Ball } from '@/entities/Ball';
import { EventController } from '@/config/EventController';

export class Rim extends Phaser.GameObjects.Container {
  gameEvents: EventController;
  frontRim: Phaser.GameObjects.Image;
  leftRim: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  rightRim: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  scoreIndicator: Phaser.GameObjects.Image;
  sound: Phaser.Sound.BaseSound;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.gameEvents = new EventController(this.scene);
    this.setVisible(false);
    scene.add.existing(this);
    this._init();
  }

  private _init() {
    this.sound = this.scene.sound.add('backboard', { volume: 0.2 });

    this.setDepth(GameDepths.rim);
    this.frontRim = this.scene.add
      .image(0, 0, 'rim')
      .setOrigin(0, 0)
      .setScale(2)
      .setVisible(true);

    const width = this.frontRim.displayWidth;
    const rimX = -(width / 2);
    this.frontRim.setX(rimX);
    this.add(this.frontRim);

    this.leftRim = this._addSideRim(rimX);
    this.rightRim = this._addSideRim(rimX + width * 0.9);
    this.scoreIndicator = this.scene.physics.add
      .sprite(rimX + 30, 40, 'invisible')
      .setBodySize(width - 60, 1, false)
      .setOrigin(0, 0)
      .setDebugBodyColor(0x00ff00);

    this.add(this.scoreIndicator);
    this.setVisible(true);
  }

  handleBallCollision(ball: Ball) {
    this._handleSideRimCollision(ball, this.leftRim);
    this._handleSideRimCollision(ball, this.rightRim);
    this._listenForScore(ball);
  }

  private _listenForScore(ball: Ball) {
    ball.scene.physics.add.overlap(
      ball,
      this.scoreIndicator,
      () => {
        if (!ball.justScored) {
          ball.justScored = true;
          this.gameEvents.ballScored.fire({
            ballBounds: ball.getBounds(),
            rimHit: ball.rimHit
          });
        }
      },
      () => {
        return ball.body.velocity.y >= 0;
      },
      this
    );
  }

  private _addSideRim(x: number) {
    const sideRim = this.scene.physics.add
      .sprite(x, 0, 'invisible')
      .setBodySize(
        this.frontRim.displayHeight,
        this.frontRim.displayHeight,
        false
      )
      .setOrigin(0.5, 0.5)
      .setImmovable(true)
      .setDebugBodyColor(0x00ff00)
      .refreshBody();

    sideRim.body.setCircle(this.frontRim.height);
    this.add(sideRim);
    return sideRim;
  }

  private _handleSideRimCollision(
    ball: Ball,
    sideRim: Phaser.GameObjects.GameObject
  ) {
    this.scene.physics.add.collider(
      ball,
      sideRim,
      (b: Ball) => {
        b.rimHit = true;
        b.tween({
          rotation: ball.body.velocity.x > 0 ? Math.PI / 4 : -Math.PI / 4,
          duration: 600
        });
        this._playSound();
      },
      () => {
        return ball.body.velocity.y >= 0;
      },
      this
    );
  }

  private _playSound() {
    this.sound.stop();
    this.sound.play();
  }
}
