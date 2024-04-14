import { GameColors } from '@/config/GameColors';
import { isNil } from '@/utils/isNil';

export class ImageButton extends Phaser.GameObjects.Image {
  private _config: ImageButtonConfig;
  private _callback: (button: ImageButton) => void;
  private _text: Phaser.GameObjects.Text | null;
  private _highlighted: boolean;
  private _disabled: boolean;
  private _hitRect: Phaser.Geom.Rectangle | null;
  private _id: string;
  private _isDown: boolean;
  private _defaultScale: number;

  constructor(
    scene: Phaser.Scene,
    config: ImageButtonConfig,
    onUpCallback: (button: ImageButton) => void
  ) {
    super(
      scene,
      config.x,
      config.y,
      config.texture,
      config.styles?.default?.frame
    );
    this.scene = scene;
    this._config = config;
    this._callback = onUpCallback;
    this._highlighted = false;
    this._disabled = false;
    this._hitRect = config.hitArea
      ? new Phaser.Geom.Rectangle(
          config.hitArea.x,
          config.hitArea.y,
          config.hitArea.width,
          config.hitArea.height
        )
      : null;
    this._id = config.id || '';
    this._text = null;

    if (!isNil(config.angle)) {
      this.angle = config.angle;
    }
    if (!isNil(config.depth)) {
      this.depth = config.depth;
    }
    if (!isNil(config.scaleX)) {
      this.scaleX = config.scaleX;
    }
    if (!isNil(config.scaleY)) {
      this.scaleY = config.scaleY;
    }
    if (!isNil(config.scale)) {
      this.setScale(config.scale);
    }
    if (!isNil(config.alpha)) {
      this.setAlpha(config.alpha);
    }
    this.addText();
    this.setOrigin(0.5, 0.5);
    this.enable();

    this._defaultScale = this.scale;
    this.scene.add.existing(this);
  }

  enable(): void {
    if (this._hitRect) {
      this.setInteractive(
        { hitArea: this._hitRect, useHandCursor: true },
        this.checkHitRect
      );
    } else {
      this.setInteractive({ useHandCursor: true });
    }
    this.on('pointerover', this.onOver, this);
    this.on('pointerdown', this.onDown, this);
    this.on('pointerout', this.onOut, this);
    this.on('pointerup', this.onUp, this);
    this.on('tweenupdate', this._syncText, this);

    this._setStyle('default');
    this._setTextStyle('default');

    this._disabled = false;
  }

  disable(changeVisuals: boolean = true): void {
    this.off('pointerover', this.onOver, this);
    this.off('pointerdown', this.onDown, this);
    this.off('pointerout', this.onOut, this);
    this.off('pointerup', this.onUp, this);
    this.setInteractive(false);
    if (changeVisuals) {
      this._setStyle('disabled');
      this._setTextStyle('disabled');
    }
    if (changeVisuals) {
    }
    this._disabled = true;
  }

  isDisabled(): boolean {
    return this._disabled;
  }

  highlight(): void {
    this._setStyle('highlightedDefault');
    this._highlighted = true;
  }

  unhighlight(): void {
    this._setStyle('default');
    this._highlighted = false;
  }

  toggleHighlight(): boolean {
    if (this._highlighted) {
      this.unhighlight();
    } else {
      this.highlight();
    }
    return this._highlighted;
  }

  isHighlighted(): boolean {
    return this._highlighted;
  }

  private onOver(pointer: Phaser.Input.Pointer): void {
    if (this._highlighted) {
      this._setStyle('highlightedOver', ['over']);
      this._setTextStyle('highlightedOver', ['over']);
    } else {
      this._setStyle('over');
      this._setTextStyle('over');
    }
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    this._isDown = true;
    if (this._highlighted) {
      this._setStyle('highlightedDown', ['down']);
      this._setTextStyle('highlightedDown', ['down']);
    } else {
      this._setStyle('down');
      this._setTextStyle('down');
    }

    this._animateScale(this._defaultScale * 0.95);
  }

  private onOut(pointer: Phaser.Input.Pointer): void {
    if (this._highlighted) {
      this._setStyle('highlightedDefault', ['default']);
      this._setTextStyle('highlightedDefault', ['default']);
    } else {
      this._setStyle('default');
      this._setTextStyle('default');
    }
    this._animateScale(this._defaultScale);
  }

  onUp(pointer: Phaser.Input.Pointer): void {
    this._isDown = false;

    if (this._highlighted) {
      this._setStyle('highlightedOver', [
        'over',
        'highlightedDefault',
        'default'
      ]);
      this._setTextStyle('highlightedOver', [
        'over',
        'highlightedDefault',
        'default'
      ]);
    } else {
      this._setStyle('over', ['default']);
      this._setTextStyle('over', ['default']);
    }
    this._animateScale(this._defaultScale);

    this._callback(this);
  }

  getId(): string {
    return this._id;
  }

  setId(id: string): void {
    this._id = id;
  }

  moveTo(newX: number, newY: number): void {
    this.setPosition(newX, newY);
    this.tweenTo;
  }

  tweenTo(
    newX: number,
    newY: number,
    duration: number,
    ease: string = 'linear'
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const targets: any[] = [this];
    if (this._text) {
      targets.push(this._text);
    }
    const xDiff: number = newX - this.x;
    const yDiff: number = newY - this.y;
    this.scene.tweens.add({
      targets: targets,
      x: '+=' + xDiff,
      y: '+=' + yDiff,
      duration: duration,
      ease: ease,
      onUpdate: () => {
        this._syncText();
      },
      callbackScope: this
    });

    this._syncText();
  }

  checkHitRect(hitArea: Phaser.Geom.Rectangle, x: number, y: number): boolean {
    if (
      x >= hitArea.x &&
      x <= hitArea.x + hitArea.width &&
      y >= hitArea.y &&
      y <= hitArea.y + hitArea.height
    ) {
      return true;
    } else {
      return false;
    }
  }

  private addText(): void {
    if (!this._config.text) {
      return;
    }

    const { centerX, centerY } = this.getBounds();
    if (!this._config.text.styles) {
      this._config.text.styles = {};
    }
    this._config.text.styles.default = resolveStyle(
      this._config.text.styles.default
    );

    this._text = this.scene.add.text(
      centerX,
      centerY,
      this._config.text.value,
      this._config.text.styles.default
    );
    this._text.setOrigin(0.5, 0.5);
    if (this._config.text.lineHeight) {
      this._text.setLineSpacing(this._config.text.lineHeight);
    }
    this._text.depth = this.depth + 1;
    if (!isNil(this._config.alpha)) {
      this._text.setAlpha(this._config.alpha);
    }
  }

  setText(text: string): void {
    if (this._text) {
      this._text.text = text;
    }
  }

  cleanUp(): void {
    this.disable();
    if (this._text) {
      this._text.destroy();
    }
    this.destroy();
  }

  setPosition(x?: number, y?: number, z?: number, w?: number): this {
    super.setPosition(x, y, z, w);
    this._syncText();
    return this;
  }

  setX(value: number): this {
    super.setX(value);
    this._syncText();
    return this;
  }

  setY(value: number): this {
    super.setY(value);
    this._syncText();
    return this;
  }

  setAlpha(value: number): this {
    super.setAlpha(value);
    this._text?.setAlpha?.(value);
    return this;
  }

  private _setStyle(
    style: keyof ImageButtonConfig['styles'],
    fallbacks?: (keyof ImageButtonConfig['styles'])[]
  ) {
    if (!this._config.styles) {
      return;
    }

    const s = this._config.styles[style];
    if (s) {
      if (s.frame) this.setFrame(s.frame);
      if (s.tint) this.setTint(s.tint);
    } else if (fallbacks?.length) {
      this._setStyle(fallbacks[0], fallbacks.slice(1));
    }
  }

  private _setTextStyle(
    style: keyof ImageButtonConfig['text']['styles'],
    fallbacks?: (keyof ImageButtonConfig['text']['styles'])[]
  ) {
    if (!this._text || !this._config.text?.styles) {
      return;
    }

    if (this._config.text.styles[style]) {
      this._text.setStyle(this._config.text.styles[style]);
    } else if (fallbacks?.length) {
      this._setTextStyle(fallbacks[0], fallbacks.slice(1));
    }
  }

  private _syncText() {
    if (!this._text) {
      return;
    }
    this._text.setAlpha(this.alpha);
    this._text.setScale(this.scale);
    const { centerX, centerY } = this.getBounds();
    this._text.setPosition(centerX, centerY);
  }

  private _animateScale(value: number, duration: number = 100): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: value,
      scaleY: value,
      duration: duration,
      ease: Phaser.Math.Easing.Sine.InOut
    });
  }
}

export interface ImageButtonConfig {
  id?: string;
  x: number;
  y: number;
  angle?: number;
  depth?: number;
  scaleX?: number;
  scaleY?: number;
  scale?: number;
  alpha?: number;
  texture: string;
  styles?: {
    default?: { tint?: number; frame?: string | number };
    over?: { tint?: number; frame?: string | number };
    down?: { tint?: number; frame?: string | number };
    disabled?: { tint?: number; frame?: string | number };
    highlightedDefault?: { tint?: number; frame?: string | number };
    highlightedOver?: { tint?: number; frame?: string | number };
    highlightedDown?: { tint?: number; frame?: string | number };
  };
  hitArea?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  text?: {
    lineHeight?: number;
    value: string;
    styles?: {
      default?: Phaser.Types.GameObjects.Text.TextStyle;
      over?: Phaser.Types.GameObjects.Text.TextStyle;
      down?: Phaser.Types.GameObjects.Text.TextStyle;
      disabled?: Phaser.Types.GameObjects.Text.TextStyle;
      highlightedDefault?: Phaser.Types.GameObjects.Text.TextStyle;
      highlightedOver?: Phaser.Types.GameObjects.Text.TextStyle;
      highlightedDown?: Phaser.Types.GameObjects.Text.TextStyle;
    };
  };
}

const resolveStyle = (style?: Phaser.Types.GameObjects.Text.TextStyle) => {
  const resolved: Phaser.Types.GameObjects.Text.TextStyle = {
    fontSize: 30,
    align: 'center',
    fontFamily: 'Arial',
    fontStyle: 'bold',
    color: GameColors.black.rgba
  };

  style = style || {};
  Object.assign(resolved, style);
  return resolved;
};
