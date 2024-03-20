export class Boot extends Phaser.Scene {

  constructor() {
    super('Boot');
  }

  preload () {
    this.load.setPath('./assets');
    this.load.image('court', 'court.jpg');
    this.load.image('seats', 'seats.png');
    this.load.image('barrier', 'barrier.jpg');
  }

  create() {
    this.scene.start('Preload');
  }
}