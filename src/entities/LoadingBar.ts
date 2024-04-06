import { GameColors } from '@/config/GameColors';
import { getSceneSizeData } from '@/utils/SceneSizeHelper';

export class LoadingBar extends Phaser.GameObjects.Sprite {
  progress: Phaser.GameObjects.Graphics;
  progressValue: number = 50;
  text: Phaser.GameObjects.Text;
  initialLoadAnimationComplete: boolean = false;
  finished: boolean = false;
  xPadding: number = 20;
  yPadding: number = 10;
  revealYOffset: number;

  readonly onComplete: () => void;
  constructor(
    scene: Phaser.Scene,
    key: string,
    options?: { revealYOffset?: number; onComplete?: () => void }
  ) {
    const { center } = getSceneSizeData(scene);
    const { onComplete, revealYOffset = 30 } = options || {};
    super(scene, center.x, center.y + 75 - revealYOffset, key);
    this.revealYOffset = revealYOffset;
    this.onComplete = onComplete;
    this.setAlpha(0);
    scene.add.existing(this);
    this.text = scene.add
      .text(center.x, center.y - this.revealYOffset, 'Loading', {
        fontSize: 60,
        fontFamily: 'Arial',
        stroke: GameColors.black.rgba,
        strokeThickness: 10,
        color: GameColors.loadingBar.rgba
      })
      .setOrigin(0.5, 0.5)
      .setAlpha(0);

    this._initReveal();
    this.scene.load.on('progress', this._handleLoadProgress, this);
  }

  private _initReveal() {
    this._animateReveal(this.text);
    this._animateReveal(this, {
      delay: 300,
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
    this.progress.fillStyle(GameColors.loadingBar.color, 1);
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

  private _animateReveal(
    target: Phaser.GameObjects.Sprite | Phaser.GameObjects.Text,
    options?: { delay?: number; onComplete?: () => void }
  ) {
    this.scene.tweens.add({
      targets: target,
      duration: 500,
      y: target.y + this.revealYOffset,
      alpha: 1,
      ease: Phaser.Math.Easing.Linear,
      callbackScope: this,
      ...options
    });
  }
}
