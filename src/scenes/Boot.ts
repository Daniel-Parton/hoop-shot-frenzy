export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.load.setPath('./assets');
    this.load.image('menu-bg', 'menu-bg.jpg');
    this.load.image('loading-bar', 'loading-bar.png');
  }

  create() {
    this.scene.start('Preload');
  }
}
