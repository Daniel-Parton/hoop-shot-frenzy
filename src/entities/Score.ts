import { GAME_CONFIG } from '@/config';
import { LocalStorageHelper } from '@/utils/LocalStorageHelper';

const baseKey = 'hoop_';
export class Score extends Phaser.GameObjects.Container {
  bestScoreKey = `${baseKey}bestScore`;

  currentText: Phaser.GameObjects.Text;
  bestText: Phaser.GameObjects.Text;

  best: number = 0;
  current: number = 0;

  interval: number = 25;
  delta: number = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    scene.add.existing(this);
    scene.physics.add.existing(this as any);
    this.init();
  }

  private init() {
    this.scene.sound.add('score');
    this.best = LocalStorageHelper.getInt(this.bestScoreKey);
    const gameWidth = this.scene.scale.width;
    this.currentText = this.scene.add
      .text(5, 0, 'Score: 0', {
        fontSize: 25,
        fontFamily: 'Arial',
        color: '#FFFFFF'
      })
      .setOrigin(0, 0);

    this.bestText = this.scene.add
      .text(gameWidth - 5, 0, 'Best: ' + this.best.toLocaleString(), {
        fontSize: 25,
        fontFamily: 'Arial',
        color: '#FFFFFF'
      })
      .setOrigin(1, 0);

    this.add([this.currentText, this.bestText]).setDepth(4);

    this.scene.events.on(
      GAME_CONFIG.events.score,
      () => {
        this.increaseScore();
        this.scene.tweens.add({
          targets: this.currentText,
          duration: 100,
          scale: 1.1,
          repeat: 2,
          alpha: 0,
          yoyo: true
        });
      },
      this
    );
  }

  private increaseScore() {
    ++this.current;
    this.scene.time.delayedCall(
      500,
      () => this.scene.sound.play('score'),
      null,
      this
    );
    this.currentText.text = 'Score: ' + this.current.toLocaleString();
    if (this.current > this.best) {
      this.best = this.current;
      this.bestText.text = 'Best: ' + this.best.toLocaleString();
      LocalStorageHelper.set(this.bestScoreKey, this.best);
    }
  }
}
