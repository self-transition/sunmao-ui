import React, { useMemo, useCallback } from 'react';
import { css } from '@emotion/css';
import { IconButton, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { parseTypeBox, isJSONSchema } from '@sunmao-ui/shared';
import { JSONSchema7 } from 'json-schema';
import { TSchema } from '@sinclair/typebox';
import { ArrayButtonGroup } from './ArrayButtonGroup';
import { PopoverWidget } from '../Widgets/PopoverWidget';
import { WidgetProps } from '../../types';
import { mergeWidgetOptionsIntoSpec } from '../../utils/widget';

const TableWrapperStyle = css`
  border: 1px solid var(--chakra-colors-gray-200);
  border-radius: var(--chakra-radii-sm);
`;

const TableRowStyle = css`
  & > th,
  & > td {
    padding-inline-start: var(--chakra-space-1);
    padding-inline-end: var(--chakra-space-1);
    padding-top: var(--chakra-space-1);
    padding-bottom: var(--chakra-space-1);
    border-bottom-width: 1px;
    border-color: var(--chakra-colors-gray-100);
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  & > th:last-child {
    width: 76px;
  }
`;

type ArrayTableProps = WidgetProps<'core/v1/array'> & {
  itemSpec: JSONSchema7;
};
type RowProps = ArrayTableProps & {
  itemValue: any;
  itemIndex: number;
};

const DEFAULT_KEYS = ['index'];

const TableRow: React.FC<RowProps> = props => {
  const { value, itemSpec, spec, level, path, children, itemValue, itemIndex, onChange } =
    props;
  const { expressionOptions, displayedKeys = [] } = spec.widgetOptions || {};
  const keys = displayedKeys.length ? displayedKeys : DEFAULT_KEYS;
  const mergedSpec = useMemo(
    () =>
      mergeWidgetOptionsIntoSpec(
        {
          ...itemSpec,
          title: '',
        },
        {
          expressionOptions,
        }
      ),
    [itemSpec, expressionOptions]
  );
  const nextPath = useMemo(() => path.concat(String(itemIndex)), [path, itemIndex]);
  const onPopoverWidgetChange = useCallback(
    (newItemValue: any) => {
      const newValue = [...value];
      newValue[itemIndex] = newItemValue;
      onChange(newValue);
    },
    [itemIndex, onChange, value]
  );

  return (
    <Tr className={TableRowStyle}>
      <Td key="setting">
        <PopoverWidget
          {...props}
          value={itemValue}
          spec={mergedSpec}
          path={nextPath}
          level={level + 1}
          onChange={onPopoverWidgetChange}
        >
          {typeof children === 'function' ? children(props, itemValue, itemIndex) : null}
        </PopoverWidget>
      </Td>
      {keys.map((key: string) => {
        const propertyValue =
          key === 'index' ? itemValue[key] ?? itemIndex : itemValue[key];

        return <Td key={key}>{propertyValue}</Td>;
      })}
      <Td key="button">
        <ArrayButtonGroup index={itemIndex} value={value} onChange={onChange} />
      </Td>
    </Tr>
  );
};

export const ArrayTable: React.FC<ArrayTableProps> = props => {
  const { value, itemSpec, spec, onChange } = props;
  const { displayedKeys = [] } = spec.widgetOptions || {};
  const keys = displayedKeys.length ? displayedKeys : ['index'];

  return (
    <div className={TableWrapperStyle}>
      <Table size="sm" sx={{ tableLayout: 'fixed' }}>
        <Thead>
          <Tr className={TableRowStyle}>
            <Th width="24px" />
            {keys.map((key: string) => {
              const propertySpec = itemSpec.properties?.[key];
              const title = isJSONSchema(propertySpec) ? propertySpec.title || key : key;

              return <Th key={key}>{title}</Th>;
            })}
            <Th key="button">
              <IconButton
                aria-label="add"
                icon={<AddIcon />}
                size="xs"
                variant="ghost"
                onClick={() => {
                  onChange(value.concat(parseTypeBox(itemSpec as TSchema)));
                }}
              />
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {value.map((itemValue: any, itemIndex: number) => (
            <TableRow
              {...props}
              key={itemIndex}
              itemValue={itemValue}
              itemIndex={itemIndex}
            />
          ))}
        </Tbody>
      </Table>
    </div>
  );
};
