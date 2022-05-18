/* eslint-disable global-require */
import React from 'react';
import { Platform } from 'react-native';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-picker/picker';

const propTypes = {
  example: PropTypes.any,
  onChange: PropTypes.func,
  examples: PropTypes.any,
};

export default class ExamplePicker extends React.Component {
  render() {
    return (
      <Picker
        selectedValue={this.props.example}
        onValueChange={this.props.onChange}
        style={{
          marginBottom: Platform.select({
            ios: -30,
            android: 0,
          }),
        }}
      >
        {this.props.examples.map(ex => (
          <Picker.Item key={ex.name} label={ex.name} value={ex} />
        ))}
      </Picker>
    );
  }
}

ExamplePicker.propTypes = propTypes;
