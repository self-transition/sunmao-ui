import React from 'react';
import { CORE_VERSION, StyleWidgetName } from '@sunmao-ui/shared';
import { WidgetProps } from '../../../types/widget';
import { implementWidget, mergeWidgetOptionsIntoSpec } from '../../../utils/widget';
import { ExpressionWidget } from '../ExpressionWidget';
import { Grid, GridItem } from '@chakra-ui/react';

const SPACE_DIRECTIONS = ['top', 'right', 'bottom', 'left'];

type SpaceWidgetType = `${typeof CORE_VERSION}/${StyleWidgetName.Space}`;
declare module '../../../types/widget' {
  interface WidgetOptionsMap {
    'core/v1/space': {};
  }
}

export const SpaceWidget: React.FC<WidgetProps<SpaceWidgetType>> = props => {
  const { value, onChange } = props;

  return (
    <div>
      <Grid
        templateRows="repeat(3, 1fr)"
        templateColumns="repeat(3, 1fr)"
        templateAreas={`". top ."
                        "left . right"
                        ". bottom ."`}
        gap="1"
      >
        {SPACE_DIRECTIONS.map((direction, idx) => {
          return (
            <GridItem
              maxW="120px"
              minW="0px"
              key={direction}
              area={direction}
              gridArea={direction}
            >
              <ExpressionWidget
                {...props}
                spec={mergeWidgetOptionsIntoSpec<'core/v1/expression'>(props.spec, {
                  compactOptions: { height: '32px' },
                })}
                value={value[idx]}
                onChange={v => {
                  onChange(v, direction);
                }}
              />
            </GridItem>
          );
        })}
      </Grid>
    </div>
  );
};

export default implementWidget<SpaceWidgetType>({
  version: CORE_VERSION,
  metadata: {
    name: StyleWidgetName.Space,
  },
})(SpaceWidget);
