import { GameColors } from '@/config/GameColors';
import { alignToSceneCenter } from '@/utils/SceneHelper';
import { GameText } from './GameText';
import { animateReveal } from '@/utils/TweenHelper';

export class LoadingBar extends Phaser.GameObjects.Sprite {
  progress: Phaser.GameObjects.Graphics;
  progressValue: number = 50;
  text: GameText;
  initialLoadAnimationComplete: boolean = false;
  finished: boolean = false;
  xPadding: number = 20;
  yPadding: number = 10;
  revealYOffset: number;

  readonly onComplete: () => void;

  constructor(
    scene: Phaser.Scene,
    key: string,
    options?: {
      revealYOffset?: number;
      onComplete?: () => void;
    }
  ) {
    const { onComplete, revealYOffset = 50 } = options || {};
    super(scene, 0, 0, key);
    this.revealYOffset = revealYOffset;
    this.onComplete = onComplete;
    this.setAlpha(0);
    scene.add.existing(this);
    this.text = new GameText(scene, {
      text: 'Loading',
      alpha: 0,
      style: {
        fontSize: 70
      }
    });

    alignToSceneCenter(scene, [this.text, this], {
      gap: 20,
      offset: { y: -this.revealYOffset }
    });

    this._initReveal();
    this.scene.load.on('progress', this._handleLoadProgress, this);
  }

  private _initReveal() {
    animateReveal(this.text, 'y', this.revealYOffset);
    animateReveal(this, 'y', this.revealYOffset, {
      delay: 150,
      onComplete: () => this._initLoading()
    });
  }

  private _initLoading() {
    this.progress = this.scene.add.graphics();

    //It looks weird when it loads too fast because it just flashes the screen
    //This will show an initial loading to 50% and then either defer to the
    //actual loading progress or finish the loading bar
    this._tweenLoading({
      from: 0,
      to: 50,
      onComplete: () => {
        this.initialLoadAnimationComplete = true;
        if (!this.finished && this.progressValue === 1) {
          this._tweenLoading({
            from: 51,
            to: 100,
            onComplete: () => this._finish()
          });
        }
      }
    });
  }

  private _handleLoadProgress(value: number) {
    this.progressValue = value;
    if (this.initialLoadAnimationComplete) {
      this.fillProgressToPercent(value);
      if (value === 1) {
        this._finish();
      }
    }
  }

  fillProgressToPercent(value: number) {
    this.progress.clear();
    this.progress.fillStyle(GameColors.primary.color, 1);
    this.progress.fillRect(
      this.x - this.width * 0.5 + this.xPadding,
      this.y - this.height * 0.5 + this.yPadding,
      (this.width - this.xPadding * 2) * value,
      this.height - this.yPadding * 2
    );
  }

  private _finish() {
    this.finished = true;
    this.scene.time.delayedCall(500, () => {
      this.onComplete?.();
    });
  }

  private _tweenLoading(options: {
    from: number;
    to: number;
    onComplete?: () => void;
  }) {
    this.scene.tweens.addCounter({
      from: options.from,
      to: options.to,
      duration: 250,
      onUpdate: (t) => {
        this.fillProgressToPercent(t.getValue() / 100);
      },
      onComplete: () => {
        options?.onComplete?.();
      },
      callbackScope: this
    });
  }
}
