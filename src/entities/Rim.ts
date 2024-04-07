import { GameDepths } from '@/config/GameDepths';
import { Ball } from './Ball';
import { EventController } from '@/config/EventController';

export class Rim extends Phaser.GameObjects.Container {
  gameEvents: EventController;
  frontRim: Phaser.GameObjects.Image;
  leftRim: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  rightRim: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  scoreIndicator: Phaser.GameObjects.Image;
  justScored: boolean = false;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.gameEvents = new EventController(this.scene);
    this.setVisible(false);
    scene.add.existing(this);
    this._init();
  }

  private _init() {
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
      .sprite(rimX + 30, 30, 'invisible')
      .setBodySize(width - 60, 1, false)
      .setOrigin(0, 0)
      .setDebugBodyColor(0x00ff00);

    this.add(this.scoreIndicator);
    this.setVisible(true);

    this.gameEvents.ballReset.listen(this._handleBallReset, this);
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
          this.gameEvents.ballScored.fire();
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
      .sprite(x, 0, 'rim')
      .setOrigin(0, 0)
      .setScale(0.2, 2)
      .setImmovable(true)
      .setDebugBodyColor(0x00ff00)
      .refreshBody();

    sideRim.body.setCircle(sideRim.displayWidth / 2);
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

  private _handleBallReset() {
    this.justScored = false;
  }

  private _playSound() {
    this.scene.sound.play('backboard', { volume: 0.5 });
  }
}
