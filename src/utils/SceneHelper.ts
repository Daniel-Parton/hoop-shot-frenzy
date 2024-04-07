export const getSceneBounds = (scene: Phaser.Scene) => {
  const { height, width } = scene.scale;
  return new Phaser.Geom.Rectangle(0, 0, width, height);
};

export const alignToSceneCenter = (
  scene: Phaser.Scene,
  targets: (Phaser.GameObjects.Components.ComputedSize &
    Phaser.GameObjects.Components.Transform)[],
  options?: { gap?: number; offset?: { x?: number; y?: number } }
) => {
  const { gap = 0, offset } = options || {};
  const offsetY = offset?.y || 0;
  const offsetX = offset?.x || 0;
  let totalHeight = gap;

  for (const target of targets) {
    totalHeight += target.displayHeight;
  }

  const { centerX, centerY } = getSceneBounds(scene);

  const targetCount = targets.length;
  let accumulatedHeight = -totalHeight / targetCount;

  for (const target of targets) {
    target.setPosition(
      centerX + offsetX,
      centerY + accumulatedHeight + target.displayHeight / targetCount + offsetY
    );
    accumulatedHeight += target.displayHeight + gap;
  }
};

export const fadeToScene = (sceneName: string, scene: Phaser.Scene) => {
  scene.cameras.main.fadeOut(250);
  scene.time.addEvent({
    delay: 250,
    callback: function () {
      scene.scene.start(sceneName);
    },
    callbackScope: scene
  });
};
