import React from 'react';
import {Platform, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Example} from './utils';

interface Props {
  example: Example;
  onChange: (example: Example) => void;
  examples: Example[];
}

export const ExamplePicker = ({example, examples, onChange}: Props) => {
  const webStyle = {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  };

  const viewStyle = Platform.select({
    ios: {
      marginBottom: -30,
    },
    android: {
      marginBottom: 0,
    },
  });

  return (
    <View style={viewStyle}>
      <Picker
        selectedValue={example.name}
        onValueChange={(value: string) => {
          onChange(examples.find(ex => ex.name === value)!);
        }}
        style={Platform.OS === 'web' ? webStyle : viewStyle}>
        {examples.map(ex => (
          <Picker.Item key={ex.name} label={ex.name} value={ex.name} />
        ))}
      </Picker>
    </View>
  );
};
