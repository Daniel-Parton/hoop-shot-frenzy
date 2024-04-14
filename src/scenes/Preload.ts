import { LoadingBar } from '@/entities/LoadingBar';
import { fadeToScene } from '@/utils/SceneHelper';

export class Preload extends Phaser.Scene {
  loadingBar: LoadingBar;
  constructor() {
    super('Preload');
  }

  preload() {
    this.add.sprite(0, 0, 'menu-bg').setOrigin(0, 0);
    this.loadingBar = new LoadingBar(this, 'loading-bar', {
      onComplete: () => {
        fadeToScene('MainMenu', this);
      }
    });

    this.load.setPath('./assets');

    this.load.image('court', 'court.jpg');
    this.load.image('seats', 'seats.png');
    this.load.image('barrier', 'barrier.jpg');

    this.load.image('invisible', 'invisible.png');
    this.load.image('ball', 'ball.png');
    this.load.image('backboard', 'backboard.jpg');
    this.load.image('shoot-particle', 'shoot-particle.png');
    this.load.image('mast', 'mast.png');
    this.load.image('rim', 'rim.png');
    this.load.atlas('net', 'net.png', 'net.json');
    this.load.image('btn', 'btn.png');
    this.load.image('btn-circle', 'btn-circle.png');

    this.loadAudio('backboard');
    this.loadAudio('shoot');
    this.loadAudio('score-1');
    this.loadAudio('score-2');
    this.loadAudio('miss-1');
    this.loadAudio('miss-2');
    this.loadAudio('miss-3');
    this.loadAudio('miss-4');
    this.loadAudio('net');
  }

  loadAudio(path: string) {
    this.load.audio(
      path,
      ['.mp3', '.ogg', '.m4a', '.wav'].map((ext) => `${path}${ext}`)
    );
  }
}
