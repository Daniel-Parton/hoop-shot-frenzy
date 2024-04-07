export const hexColor = (hex: string) =>
  Phaser.Display.Color.HexStringToColor(hex);

export const GameColors = {
  white: hexColor('#FFFFFF'),
  black: hexColor('#000000'),
  gray: hexColor('#696969'),
  debug: hexColor('#ff0000'),
  primary: hexColor('#dd6b20')
};
