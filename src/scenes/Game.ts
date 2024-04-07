import { EventController } from '@/config/EventController';
import { Backboard } from '@/entities/Backboard';
import { Ball } from '@/entities/Ball';
import { Score } from '@/entities/Score';

export class Game extends Phaser.Scene {
  gameEvents: EventController;

  get height() {
    return this.scale.height;
  }
  get width() {
    return this.scale.width;
  }

  get center(): Phaser.Types.Math.Vector2Like {
    return { x: this.width / 2, y: this.height / 2 };
  }

  isBallBelowHoop: boolean = true;
  backboard: Backboard;
  ball: Ball;
  court: Phaser.GameObjects.Image;
  barrier: Phaser.GameObjects.Image;
  seats: Phaser.GameObjects.Image;
  score: Score;

  constructor() {
    super('Game');
    this.gameEvents = new EventController(this);
  }

  create() {
    this.cameras.main.fadeIn(250);

    this.initEnvironment();
    this.score = new Score(this);
    this.backboard = new Backboard(this);
    this.ball = new Ball(this, this.center.x, this.height - 200).setOrigin(
      0.5,
      0.5
    );

    this.backboard.handleBallCollision(this.ball);

    this.gameEvents.ballAtApex.listen(() => {
      this.ball.setDepth(this.backboard.net.depth - 1);
    }, this);
  }

  update(_, delta: number): void {}

  initEnvironment() {
    this.seats = this.add.image(0, 0, 'seats').setOrigin(0, 0).setDepth(0);

    this.barrier = this.add
      .image(0, this.seats.height - 28, 'barrier')
      .setOrigin(0, 0)
      .setDepth(1);

    this.court = this.add
      .image(0, this.height - 586, 'court')
      .setOrigin(0.23, 0)
      .setDepth(1);
  }
}
