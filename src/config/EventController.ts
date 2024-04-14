export class EventController {
  readonly ballAtApex: EventType;
  readonly ballReset: EventType;
  readonly ballScored: EventType<{
    ballBounds: Phaser.Geom.Rectangle;
    rimHit: boolean;
  }>;
  readonly ballMissed: EventType;
  readonly scoreUpdated: EventType<{ score: number; streak: number }>;

  constructor(scene: Phaser.Scene) {
    this.ballAtApex = new EventType(scene, 'BALL_AT_APEX');
    this.ballReset = new EventType(scene, 'BALL_RESET');
    this.ballScored = new EventType(scene, 'BALL_SCORED');
    this.ballMissed = new EventType(scene, 'BALL_MISSED');
    this.scoreUpdated = new EventType(scene, 'SCORE_UPDATED');
  }
}

class EventType<TPayload = unknown> {
  private readonly _scene: Phaser.Scene;
  private readonly _name: string;
  constructor(scene: Phaser.Scene, name: string) {
    this._scene = scene;
    this._name = name;
  }

  fire(payload?: TPayload) {
    this._scene.events.emit(this._name, payload);
  }

  listen(callback: (payload?: TPayload) => void, context?: any) {
    this._scene.events.on(this._name, callback, context);
  }

  stop(callback: Function, context?: any) {
    this._scene.events.on(this._name, callback, context);
  }
}
