/* eslint-disable global-require */
import React from 'react';
import { Platform } from 'react-native';
import PropTypes from 'prop-types';
import { Picker } from '@react-native-picker/picker';

const propTypes = {
  renderMode: PropTypes.string,
  onChange: PropTypes.func,
};

const renderModes = [
  {
    label: 'Automatic',
    value: 'AUTOMATIC',
  },
  {
    label: Platform.select({
      ios: 'Hardware (Core Animation)',
      default: 'Hardware',
    }),
    value: 'HARDWARE',
  },
  {
    label: Platform.select({
      ios: 'Software (Main Thread)',
      default: 'Software',
    }),
    value: 'SOFTWARE',
  },
];

export default class RenderModePicker extends React.Component {
  render() {
    return (
      <Picker
        selectedValue={this.props.renderMode}
        onValueChange={this.props.onChange}
        style={{
          marginBottom: Platform.select({
            ios: -30,
            android: 0,
          }),
        }}
      >
        {renderModes.map(mode => (
          <Picker.Item key={mode.value} {...mode} />
        ))}
      </Picker>
    );
  }
}

RenderModePicker.propTypes = propTypes;
