export class EventController {
  readonly ballAtApex: EventType;
  readonly ballReset: EventType;
  readonly score: EventType;

  constructor(scene: Phaser.Scene) {
    this.ballAtApex = new EventType(scene, 'BALL_AT_APEX');
    this.ballReset = new EventType(scene, 'BALL_RESET');
    this.score = new EventType(scene, 'SCORE');
  }
}

class EventType<TArgs = unknown[]> {
  private readonly _scene: Phaser.Scene;
  private readonly _name: string;
  constructor(scene: Phaser.Scene, name: string) {
    this._scene = scene;
    this._name = name;
  }

  fire(...args: TArgs[]) {
    this._scene.events.emit(this._name, ...args);
  }

  listen(callback: (args?: TArgs) => void, context?: any) {
    this._scene.events.on(this._name, callback, context);
  }

  stop(callback: Function, context?: any) {
    this._scene.events.on(this._name, callback, context);
  }
}
