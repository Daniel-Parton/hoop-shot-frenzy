import { GameColors } from '@/config/GameColors';
import { isNil } from '@/utils/isNil';

type GameTextConfig = {
  x?: number;
  y?: number;
  alpha?: number;
  text: string | string[];
  style?: Phaser.Types.GameObjects.Text.TextStyle;
};
export class GameText extends Phaser.GameObjects.Text {
  constructor(
    scene: Phaser.Scene,
    { text, style, x = 0, y = 0, alpha }: GameTextConfig
  ) {
    super(scene, x, y, text, resolveStyle(style));
    this.setOrigin(0.5, 0.5);
    if (!isNil(alpha)) {
      this.setAlpha(alpha);
    }
    scene.add.existing(this);
  }
}

const resolveStyle = (style?: Phaser.Types.GameObjects.Text.TextStyle) => {
  const resolved: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: 40,
    align: 'center',
    fontFamily: 'Arial',
    stroke: GameColors.primary.rgba,
    color: GameColors.black.rgba
  };

  style = style || {};
  Object.assign(resolved, style);
  if (!resolved.strokeThickness)
    resolved.strokeThickness =
      (resolved.fontSize as number) * (style.fontStyle === 'bold' ? 0.1 : 0.05);
  return resolved;
};
