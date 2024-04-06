export const hexColor = (hex: string) =>
  Phaser.Display.Color.HexStringToColor(hex);

export const GameColors = {
  white: hexColor('#FFFFFF'),
  black: hexColor('#000000'),
  gray: hexColor('#696969'),
  loadingBar: hexColor('#dd6b20')
};
