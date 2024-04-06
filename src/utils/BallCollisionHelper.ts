import { Ball } from '@/entities/Ball';

type CollisionOptions = {
  ball: Ball;
  object: Phaser.GameObjects.GameObject;
  callback?: (ball: Ball, object: Phaser.GameObjects.GameObject) => void;
  ctx: any;
};

//Will only handle collisions when ball is falling
export const handleBallCollision = ({
  ball,
  object,
  callback,
  ctx
}: CollisionOptions) => {
  ball.scene.physics.add.collider(
    ball,
    object,
    (b, o) => callback?.(b as Ball, o as Phaser.GameObjects.GameObject),
    () => {
      return ball.body.velocity.y >= 0;
    },
    ctx
  );
};
