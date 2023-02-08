import {Platform} from 'react-native';

export type Example = ReturnType<typeof makeExample>;

export const makeExample = (
  name: string,
  getJson: () => any,
  width?: number,
) => ({
  name,
  getSource: Platform.select({
    windows: () => name, // Use codegen resources, which are referenced by name
    default: getJson,
  }),
  width,
});
