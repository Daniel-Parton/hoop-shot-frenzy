export class Preload extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  preload() {
    this.load.setPath('./assets');

    this.load.image('invisible', 'invisible.png');
    this.load.image('court', 'court.jpg');
    this.load.image('seats', 'seats.png');
    this.load.image('barrier', 'barrier.jpg');
    this.load.image('ball', 'ball.png');
    this.load.image('backboard', 'backboard.jpg');
    this.load.image('shoot-particle', 'shoot-particle.png');
    this.load.image('mast', 'mast.png');
    this.load.image('rim', 'rim.png');
    this.load.atlas('net', 'net.png', 'net.json');

    this.loadAudio('score');
    this.loadAudio('shoot');
    this.loadAudio('net');
  }

  create() {
    this.scene.start('Play');
  }

  loadAudio(path: string) {
    this.load.audio(
      path,
      ['.mp3', '.ogg', '.m4a'].map((ext) => `${path}${ext}`)
    );
  }
}
