import { EventController } from '@/config/EventController';
import { Ball } from './Ball';
import { GameDepths } from '@/config/GameDepths';

export class Net extends Phaser.GameObjects.Container {
  gameEvents: EventController;
  animation: Phaser.Animations.Animation;
  image: Phaser.Physics.Arcade.Sprite;
  leftWall: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  rightWall: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  scoreIndicator: Phaser.GameObjects.Image;
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.gameEvents = new EventController(this.scene);
    this.setVisible(false);
    scene.add.existing(this);
    this._init();
  }

  private _init() {
    this.image = this.scene.physics.add
      .sprite(0, 0, 'net')
      .setScale(0.75)
      .setOrigin(0, 0);

    this.setDepth(GameDepths.net);
    const imageWidth = this.image.displayWidth;
    const imageX = -(imageWidth / 2);
    this.image.setX(imageX);
    this.add(this.image);
    this._initAnimation();
    this.leftWall = this._addWall(imageX + 5);
    this.rightWall = this._addWall(imageX + imageWidth - 5);

    this.gameEvents.score.listen(() => {
      this._animate();
      this.scene.sound.play('net');
    }, this);

    this.setVisible(true);
  }

  private _initAnimation() {
    this.animation = this.image.anims.create({
      key: 'net',
      frames: this.image.anims.generateFrameNames('net', {
        prefix: 'net-',
        suffix: '.png',
        start: 1,
        end: 5,
        zeroPad: 2
      }),
      frameRate: 15,
      repeat: 0
    }) as Phaser.Animations.Animation;
  }

  handleBallCollision(ball: Ball) {
    this._handleWallCollision(ball, this.leftWall);
    this._handleWallCollision(ball, this.rightWall);
  }

  disableDebugDisplay() {
    this.leftWall.body.debugShowBody = false;
    this.rightWall.body.debugShowBody = false;
    this.image.body.debugShowBody = false;
  }

  private _animate() {
    this.image.play(this.animation, true);
  }

  private _addWall(x: number) {
    const wall = this.scene.physics.add
      .sprite(x, 15, 'invisible')
      .setBodySize(1, this.image.displayHeight - 15, false)
      .setImmovable(true)
      .setDebugBodyColor(0x00ff00)
      .refreshBody();

    this.add(wall);
    return wall;
  }

  private _handleWallCollision(
    ball: Ball,
    wall: Phaser.GameObjects.GameObject
  ) {
    this.scene.physics.add.collider(
      ball,
      wall,
      () => {
        ball.setVelocityX(-ball.body.velocity.x);
      },
      () => {
        return ball.body.velocity.y >= 0;
      },
      this
    );
  }
}
