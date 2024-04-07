export class MainMenu extends Phaser.Scene {
  constructor() {
    super('MainMenu');
  }

  create() {
    this.add.sprite(0, 0, 'menu-bg').setOrigin(0, 0);

    this.scene.start('Play');
  }

  loadAudio(path: string) {
    this.load.audio(
      path,
      ['.mp3', '.ogg', '.m4a'].map((ext) => `${path}${ext}`)
    );
  }
}
