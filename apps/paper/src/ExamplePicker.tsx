import React from 'react';
import {Platform} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {Example} from './utils';

interface Props {
  example: Example;
  onChange: (example: Example) => void;
  examples: Example[];
}

export const ExamplePicker = ({example, examples, onChange}: Props) => {
  return (
    <Picker
      selectedValue={example.name}
      onValueChange={(value: string) => {
        onChange(examples.find(ex => ex.name === value)!);
      }}
      style={{
        marginBottom: Platform.select({
          ios: -30,
          android: 0,
        }),
      }}>
      {examples.map(ex => (
        <Picker.Item key={ex.name} label={ex.name} value={ex.name} />
      ))}
    </Picker>
  );
};
