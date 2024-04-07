import { getSceneBounds } from '@/utils/SceneHelper';

import { Net } from './Net';
import { Ball } from './Ball';
import { Rim } from './Rim';
import { GameDepths } from '@/config/GameDepths';

export class Backboard extends Phaser.GameObjects.Group {
  leftMast: Phaser.GameObjects.Image;
  rightMast: Phaser.GameObjects.Image;
  board: Phaser.GameObjects.Image;
  rim: Rim;
  net: Net;

  constructor(scene: Phaser.Scene) {
    super(scene);
    this.setVisible(false);
    scene.add.existing(this);
    this._init();
  }

  private _init() {
    const sceneBounds = getSceneBounds(this.scene);

    this.board = this.scene.add
      .image(sceneBounds.centerX, 50, 'backboard')
      .setOrigin(0.5, 0)
      .setDepth(GameDepths.backboard);

    this.add(this.board);

    const bottomCenter = this.board.getBottomCenter();
    this.rim = new Rim(
      this.scene,
      bottomCenter.x,
      bottomCenter.y - 50
    ).setDepth(GameDepths.rim);
    this.add(this.rim);

    this.net = new Net(this.scene, bottomCenter.x, this.rim.y + 3).setDepth(
      GameDepths.net
    );
    this.add(this.net);

    const topLeft = this.board.getTopLeft();
    this.leftMast = this._addMast(topLeft.x + 50, topLeft.y + 20).setOrigin(
      0,
      1
    );

    const topRight = this.board.getTopRight();
    this.rightMast = this._addMast(topRight.x - 50, topRight.y + 20).setOrigin(
      1,
      1
    );

    this.setVisible(true);
  }

  handleBallCollision(ball: Ball) {
    this.rim.handleBallCollision(ball);
    this.net.handleBallCollision(ball);
  }

  private _addMast(x: number, y: number) {
    const mast = this.scene.add
      .image(x, y, 'mast')
      .setScale(0.5)
      .setDepth(GameDepths.backboard)
      .setTint(0xffffff);
    this.add(mast);
    return mast;
  }
}
