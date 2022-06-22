import React, { useCallback } from 'react';
import { WidgetProps } from '../../types/widget';
import { implementWidget } from '../../utils/widget';
import { Switch } from '@chakra-ui/react';
import { CORE_VERSION, CoreWidgetName } from '@sunmao-ui/shared';

type BooleanFieldType = `${typeof CORE_VERSION}/${CoreWidgetName.BooleanField}`;
declare module '../../types/widget' {
  interface WidgetOptionsMap {
    'core/v1/boolean': {};
  }
}

export const BooleanField: React.FC<WidgetProps<BooleanFieldType>> = props => {
  const { value, onChange } = props;
  const onValueChange = useCallback(
    event => {
      onChange(event.currentTarget.checked);
    },
    [onChange]
  );

  return <Switch isChecked={value} onChange={onValueChange} />;
};

export default implementWidget<BooleanFieldType>({
  version: CORE_VERSION,
  metadata: {
    name: CoreWidgetName.BooleanField,
  },
})(BooleanField);
