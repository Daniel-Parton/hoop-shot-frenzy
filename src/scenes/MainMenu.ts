import { GameColors } from '@/config/GameColors';
import { GameText } from '@/entities/GameText';
import { NineSliceImageButton } from '@/entities/NineSliceImageButton';
import {
  alignToSceneCenter,
  fadeToScene,
  getSceneBounds
} from '@/utils/SceneHelper';
import { animateReveal } from '@/utils/TweenHelper';

export class MainMenu extends Phaser.Scene {
  title: Phaser.GameObjects.Text;
  playBtn: NineSliceImageButton;
  constructor() {
    super('MainMenu');
  }

  create() {
    this.cameras.main.fadeIn(250);
    this.add.sprite(0, 0, 'menu-bg').setOrigin(0, 0);
    const { centerX, centerY } = getSceneBounds(this);
    this.title = new GameText(this, {
      x: centerX,
      y: centerY,
      alpha: 0,
      text: ['HOOP SHOT', 'FRENZY'],
      style: {
        fontSize: 100,
        fontStyle: 'bold'
      }
    });

    this.playBtn = new NineSliceImageButton(
      this,
      {
        alpha: 0,
        defaultScale: 1.5,
        texture: 'btn',
        styles: {
          default: { tint: GameColors.primary.lighten(30).color },
          over: { tint: GameColors.primary.lighten(25).color }
        },
        text: {
          value: 'PLAY'
        }
      },
      () => {
        fadeToScene('Game', this);
      }
    );

    alignToSceneCenter(this, [this.title, this.playBtn], {
      gap: 50
    });

    animateReveal(this.title, 'y', 50);
    animateReveal(this.playBtn, 'y', 50, {
      delay: 150,
      onComplete: () => {
        this._initAnimations();
      },
      callbackScope: this
    });
  }

  private _initAnimations() {
    this.tweens.add({
      targets: this.title,
      angle: this.title.angle - 2,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: this.title,
      angle: this.title.angle + 4,
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: 1,
      loop: -1,
      delay: 1000
    });
  }
}
