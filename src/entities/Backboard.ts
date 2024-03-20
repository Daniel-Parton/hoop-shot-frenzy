import { getSceneSizeData } from '@/utils/SceneSizeHelper';
import { Net } from './Net';
import { Ball } from './Ball';

export class Backboard extends Phaser.GameObjects.Container {
  leftMast: Phaser.GameObjects.Image;
  rightMast: Phaser.GameObjects.Image;
  backboard: Phaser.GameObjects.Image;
  frontRim: Phaser.GameObjects.Image;
  leftRim: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  rightRim: Phaser.Types.Physics.Arcade.ImageWithStaticBody;
  net: Net;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.setVisible(false);
    scene.add.existing(this);
    this.init();
  }

  private init() {
    const { center } = getSceneSizeData(this.scene);
    this.backboard = this.scene.add
      .image(center.x, 50, 'backboard')
      .setOrigin(0.5, 0)
      .setDepth(2);

    const topLeftX = this.backboard.x - this.backboard.displayWidth / 2;
    this.leftMast = this.addMast(topLeftX + 50, -125).setOrigin(0, 0);

    const topRightX = this.backboard.x + this.backboard.displayWidth / 2;
    this.rightMast = this.addMast(topRightX - 50, -125).setOrigin(1, 0);

    const bottomY = this.backboard.y + this.backboard.displayHeight;
    this.frontRim = this.scene.add
      .image(center.x, bottomY - 50, 'rim')
      .setOrigin(0.5, 0)
      .setScale(2)
      .setDepth(2);

    const frontRimLeftX = this.frontRim.x - this.frontRim.displayWidth / 2;

    this.leftRim = this.addSideRim(frontRimLeftX, this.frontRim.y);

    this.rightRim = this.addSideRim(
      frontRimLeftX + this.frontRim.displayWidth * 0.9,
      this.frontRim.y
    );

    this.net = new Net(this.scene, center.x, this.frontRim.y + 3)
      .setOrigin(0.5, 0)
      .setScale(0.75)
      .setDepth(3);

    this.add([
      this.backboard,
      this.leftMast,
      this.rightMast,
      this.frontRim,
      this.leftRim,
      this.rightRim
    ]);
    this.setVisible(true);

    this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
  }

  initBallCollision(ball: Ball) {
    this.scene.physics.add.collider(
      ball,
      this.rightRim,
      null,
      () => {
        return ball.body.velocity.y >= 0;
      },
      this
    );
    this.scene.physics.add.collider(
      ball,
      this.leftRim,
      (_, o: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody) => {
        //TODO PLAY SOUND
      },
      () => {
        return ball.body.velocity.y >= 0;
      },
      this
    );
  }

  hasScored(ball: Ball) {
    if (
      !ball.justScored &&
      ball.hasReachedApex &&
      ball.x > this.leftRim.x &&
      ball.x < this.rightRim.x &&
      ball.y > this.frontRim.y
    ) {
      return true;
    }

    return false;
  }

  addMast(x: number, y: number) {
    return this.scene.add.image(x, y, 'mast').setScale(0.5).setTint(0xffffff);
  }

  addSideRim(x: number, y: number) {
    const sideRim = this.scene.physics.add
      .staticImage(x, y, 'rim')
      .setOrigin(0, 0)
      .setScale(0.2, 2)
      .setDepth(2)
      .refreshBody();

    sideRim.body.setCircle(sideRim.displayWidth / 2);
    return sideRim;
  }
}
