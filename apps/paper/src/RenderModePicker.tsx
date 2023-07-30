import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {LottieViewProps} from 'lottie-react-native';

interface Props {
  renderMode: LottieViewProps['renderMode'];
  onChange: (renderMode: LottieViewProps['renderMode']) => void;
}

const renderModes = [
  {
    label: 'RenderMode: Automatic',
    value: 'AUTOMATIC',
  },
  {
    label: Platform.select({
      ios: 'RenderMode: Hardware (Core Animation)',
      default: 'RenderMode: Hardware',
    }),
    value: 'HARDWARE',
  },
  {
    label: Platform.select({
      ios: 'RenderMode: Software (Main Thread)',
      default: 'RenderMode: Software',
    }),
    value: 'SOFTWARE',
  },
];

export default function RenderModePicker(props: Props) {
  const {renderMode, onChange} = props;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(renderMode);

  useEffect(() => {
    if (renderMode === value) {
      return;
    }
    onChange(value);
  }, [renderMode, value, onChange]);

  return (
    <DropDownPicker
      value={renderMode as string}
      open={open}
      items={renderModes}
      setValue={setValue}
      setOpen={setOpen}
      zIndex={2}
    />
  );
}
