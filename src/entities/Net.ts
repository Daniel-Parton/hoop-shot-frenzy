import { GAME_CONFIG } from '@/config';

export class Net extends Phaser.Physics.Arcade.Sprite {
  animation: Phaser.Animations.Animation;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'net', 0);
    scene.add.existing(this);
    this.init();
  }

  private init() {
    this.animation = this.anims.create({
      key: 'net',
      frames: this.anims.generateFrameNames('net', {
        prefix: 'net-',
        suffix: '.png',
        start: 1,
        end: 4,
        zeroPad: 2
      }),
      frameRate: 15,
      repeat: 0
    }) as Phaser.Animations.Animation;

    this.scene.events.on(GAME_CONFIG.events.score, () => {
      this.animate();
      this.scene.sound.play('net');
    });
  }

  animate() {
    this.play(this.animation, true);
  }
}
