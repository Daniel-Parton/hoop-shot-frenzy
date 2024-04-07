export const animateReveal = (
  target: Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Transform,
  variant: 'y' | 'x',
  offset: number = 50,
  options?: {
    duration?: number;
    delay?: number;
    onComplete?: () => void;
    callbackScope?: any;
  }
) => {
  const { duration = 500, onComplete, ...rest } = options || {};

  target.scene.tweens.add({
    targets: target,
    alpha: 1,
    duration,
    [variant]: target[variant] + offset,
    ease: (v) => Phaser.Math.Easing.Back.Out(v, Math.abs(offset) * 0.1),
    onComplete,
    onUpdate: (tween: Phaser.Tweens.Tween) => {
      target.emit('tweenupdate', tween);
    },
    ...rest
  });
};
