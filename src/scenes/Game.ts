import { EventController } from '@/config/EventController';
import { GameDepths } from '@/config/GameDepths';
import { Backboard } from '@/entities/Backboard';
import { Ball } from '@/entities/Ball';
import { Score } from '@/entities/Score';
import { getSceneBounds } from '@/utils/SceneHelper';

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
  missIndicator: Phaser.GameObjects.Image;
  missSoundPlayingKey: string;

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
    this.initMissIndicator(this.ball);
    this.gameEvents.ballScored.listen(this.stopMissSound, this);
  }

  update(_, delta: number): void {}

  initEnvironment() {
    this.seats = this.add.image(0, 0, 'seats').setOrigin(0, 0).setDepth(0);

    this.barrier = this.add
      .image(0, this.seats.height - 28, 'barrier')
      .setOrigin(0, 0)
      .setDepth(GameDepths.background);

    this.court = this.add
      .image(0, this.height - 586, 'court')
      .setOrigin(0.23, 0)
      .setDepth(GameDepths.background);
  }

  initMissIndicator(ball: Ball) {
    const { width, centerY } = getSceneBounds(this);

    this.sound.add('miss-1');
    this.sound.add('miss-2');
    this.sound.add('miss-3');
    this.sound.add('miss-4');

    this.missIndicator = this.physics.add
      .sprite(0, centerY, 'invisible')
      .setBodySize(width * 3, 1, false)
      .setOrigin(0.5, 0.5)
      .setDebugBodyColor(0xff0000);

    this.physics.add.overlap(
      ball,
      this.missIndicator,
      () => {
        if (!ball.justScored && !ball.justMissed) {
          ball.justMissed = true;
          this.playMissSound();
          this.gameEvents.ballMissed.fire();
        }
      },
      () => {
        return ball.body.velocity.y >= 0;
      },
      this
    );
  }

  playMissSound() {
    this.stopMissSound();
    this.missSoundPlayingKey = `miss-${Phaser.Math.Between(1, 4)}`;
    this.sound.play(this.missSoundPlayingKey);
  }

  stopMissSound() {
    if (this.missSoundPlayingKey) {
      this.sound.stopByKey(this.missSoundPlayingKey);
    }
  }
}
