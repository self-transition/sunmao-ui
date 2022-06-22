import { Type } from '@sinclair/typebox';
import { StringUnion } from '../../sunmao-helper';
import { Category } from '../../constants/category';

const RadioItemSpec = Type.Object({
  value: Type.String(),
  label: Type.String(),
  disabled: Type.Optional(Type.Boolean()),
});

export const RadioPropsSpec = {
  defaultCheckedValue: Type.String({
    category: Category.Data,
  }),
  options: Type.Array(RadioItemSpec, {
    category: Category.Data,
    widget: 'core/v1/array',
    widgetOptions: {
      displayedKeys: ['label'],
    },
  }),
  updateWhenDefaultValueChanges: Type.Boolean({
    title: 'Update When Default Value Changes',
    category: Category.Basic,
  }),
  type: StringUnion(['radio', 'button'], {
    category: Category.Style,
  }),
  direction: StringUnion(['horizontal', 'vertical'], {
    category: Category.Style,
    conditions: [
      {
        key: 'type',
        value: 'radio',
      },
    ],
  }),
  size: StringUnion(['small', 'default', 'large', 'mini'], {
    category: Category.Style,
  }),
};
