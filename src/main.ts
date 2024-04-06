import './style.css';
import Phaser from 'phaser';
import { Boot } from './scenes/Boot';
import { Preload } from './scenes/Preload';
import { Game } from './scenes/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 1250,
  max: {
    width: 550,
    height: 550 / (800 / 1250)
  },
  min: {
    width: 350,
    height: 350 / (800 / 1250)
  },
  input: {
    mouse: {
      target: window
    }
  },
  parent: 'game-container',
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    fullscreenTarget: 'game-container',
    parent: 'game-container'
  },
  scene: [Boot, Preload, Game]
};

new Phaser.Game(config);
