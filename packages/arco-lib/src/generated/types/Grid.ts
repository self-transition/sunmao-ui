import { Type } from '@sinclair/typebox';
import { Category } from '../../constants/category';
import { StringUnion } from '../../sunmao-helper';

export const RowPropsSpec = {
    gutter: Type.Number({
        title: 'Gutter',
        category: Category.Layout,
    }),
    align: StringUnion(['start', 'center', 'end', 'stretch'], {
        title: 'Align',
        category: Category.Layout,
        description: 'Vertical alignment, same as css align-items',
    }),
    justify: StringUnion(['start', 'center', 'end', 'space-around', 'space-between'], {
        title: 'Justify',
        category: Category.Layout,
        description: 'Horizontal alignment, same as css justify-content',
    })
};

export const ColPropsSpec = {
    offset: Type.Number({
        title: 'Offset'
    }),
    pull: Type.Number({
        title: 'Pull'
    }),
    push: Type.Number({
        title: 'Push'
    }),
    span: Type.Number({
        title: 'Span'
    }),
    order: Type.Number({
        title: 'Order'
    }),
};
