import { GameColors } from '@/config/GameColors';
import { GameDepths } from '@/config/GameDepths';
import { nanoid } from 'nanoid';

export class FloatingScore {
  private readonly scene: Phaser.Scene;
  private readonly textStyle: Phaser.Types.GameObjects.Text.TextStyle;
  private duration: number = 400;
  private fadeDistance: number = 150;

  private scores: Record<string, Phaser.GameObjects.Text> = {};

  constructor({ scene, textStyle }: FloatingScoreConfig) {
    this.scene = scene;
    this.textStyle = resolveStyle(textStyle);
  }

  showScore(target: Phaser.Geom.Rectangle, value: number) {
    const id = nanoid();
    this.scores[id] = new Phaser.GameObjects.Text(
      this.scene,
      target.centerX,
      target.bottom,
      `+${value.toLocaleString()}`,
      this.textStyle
    );
    this.scores[id].setOrigin(0.5, 0.5);
    this.scores[id].setName(id);
    this.scores[id].setAlpha(1);
    this.scores[id].setScale(0.2);
    this.scores[id].setDepth(GameDepths.floatingScore);
    this.scene.add.existing(this.scores[id]);
    this._animateShow(this.scores[id], () => {
      this._animateFadeUp(this.scores[id]);
    });
  }

  private _animateShow(
    score: Phaser.GameObjects.Text,
    onComplete?: Phaser.Types.Tweens.TweenOnCompleteCallback
  ) {
    this.scene.tweens.add({
      targets: score,
      scale: 1,
      alpha: 1,
      duration: 500,
      callbackScope: this,
      ease: (v) => Phaser.Math.Easing.Back.Out(v, 5),
      onComplete
    });
  }

  private _animateFadeUp(score: Phaser.GameObjects.Text) {
    this.scene.tweens.add({
      targets: score,
      y: score.y - this.fadeDistance,
      ease: Phaser.Math.Easing.Sine.Out,
      duration: this.duration,
      callbackScope: this
    });

    this.scene.time.delayedCall(this.duration / 4, () => {
      this.scene.tweens.add({
        targets: score,
        alpha: 0,
        ease: Phaser.Math.Easing.Sine.Out,
        duration: this.duration,
        yoyo: false,
        callbackScope: this,
        onComplete: () => {
          score.destroy();
          this.scores[score.name] = null;
        }
      });
    });
  }
}

type FloatingScoreConfig = {
  scene: Phaser.Scene;
  textStyle?: Phaser.Types.GameObjects.Text.TextStyle;
  duration?: number;
};

const resolveStyle = (style?: Phaser.Types.GameObjects.Text.TextStyle) => {
  const resolved: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: 80,
    align: 'center',
    fontFamily: 'Arial',
    fontStyle: 'bold',
    stroke: GameColors.black.rgba,
    color: GameColors.primary.rgba
  };

  style = style || {};
  Object.assign(resolved, style);
  if (!resolved.strokeThickness)
    resolved.strokeThickness =
      (resolved.fontSize as number) * (style.fontStyle === 'bold' ? 0.1 : 0.05);
  return resolved;
};
