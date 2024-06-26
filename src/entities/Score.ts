import { LocalStorageHelper } from '@/utils/LocalStorageHelper';
import { EventController } from '@/config/EventController';
import { FloatingScore } from './FloatingScore';

const baseKey = 'hoop_';
export class Score extends Phaser.GameObjects.Container {
  gameEvents: EventController;
  floatingScore: FloatingScore;

  bestScoreKey = `${baseKey}bestScore`;

  currentText: Phaser.GameObjects.Text;
  bestText: Phaser.GameObjects.Text;

  best: number = 0;
  current: number = 0;
  streak: number = 0;

  interval: number = 25;
  delta: number = 0;

  scoreSoundPlayingKey: number;
  scoreSounds: Phaser.Sound.NoAudioSound[] = [];

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);
    this.gameEvents = new EventController(this.scene);
    this.floatingScore = new FloatingScore({ scene: this.scene });
    scene.add.existing(this);
    scene.physics.add.existing(this as any);
    this.init();
  }

  private init() {
    this.scoreSounds.push(
      this.scene.sound.add('score-1', {
        volume: 1.2
      }) as Phaser.Sound.NoAudioSound
    );
    this.scoreSounds.push(
      this.scene.sound.add('score-2', {
        volume: 0.2
      }) as Phaser.Sound.NoAudioSound
    );

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

    this.gameEvents.ballScored.listen(this._handleScore, this);
    this.gameEvents.ballMissed.listen(this._handleMiss, this);
  }

  private _handleScore(payload: {
    ballBounds: Phaser.Geom.Rectangle;
    rimHit: boolean;
  }) {
    const score = payload.rimHit ? 1 : 2;
    this.current += score;
    ++this.streak;
    this.floatingScore.showScore(payload.ballBounds, score);
    this.scene.time.delayedCall(500, this._playScoreSound, null, this);
    this.currentText.text = 'Score: ' + this.current.toLocaleString();
    if (this.current > this.best) {
      this.best = this.current;
      this.bestText.text = 'Best: ' + this.best.toLocaleString();
      LocalStorageHelper.set(this.bestScoreKey, this.best);
    }

    this.gameEvents.scoreUpdated.fire({
      score: this.current,
      streak: this.streak
    });
    this.scene.tweens.add({
      targets: this.currentText,
      duration: 100,
      scale: 1.1,
      repeat: 2,
      alpha: 0,
      yoyo: true
    });
  }

  private _handleMiss() {
    this.streak = 0;
    this._stopScoreSound();
    this.gameEvents.scoreUpdated.fire({
      score: this.current,
      streak: this.streak
    });
  }

  private _playScoreSound() {
    this._stopScoreSound();
    this.scoreSoundPlayingKey = Phaser.Math.Between(
      0,
      this.scoreSounds.length - 1
    );
    this.scoreSounds[this.scoreSoundPlayingKey].play();
  }

  private _stopScoreSound() {
    if (this.scoreSoundPlayingKey) {
      this.scoreSounds[this.scoreSoundPlayingKey].stop();
    }
  }
}
