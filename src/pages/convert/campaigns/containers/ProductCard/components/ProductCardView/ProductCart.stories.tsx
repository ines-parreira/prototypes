import React, { ComponentProps } from 'react'

import { Meta, Story } from '@storybook/react'

import { FRAME_WIDTH } from '../../../../constants/visuals'
import { ProductCardView } from './ProductCardView'

const storyConfig: Meta = {
    title: 'Convert/Chat Campaigns/Product Card',
    component: ProductCardView,
    argTypes: {
        color: {
            control: {
                type: 'color',
            },
        },
    },
    args: {
        bgColor: '#0097ff',
        currency: 'USD',
        image: 'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
        price: 1234.43,
        compareAtPrice: 2345.67,
        title: 'MacBook Air with M1 chip',
        onClickEdit: () => null,
    },
    decorators: [
        (storyFn) => <div style={{ width: FRAME_WIDTH }}>{storyFn()}</div>,
    ],
}

const Template: Story<ComponentProps<typeof ProductCardView>> = (props) => (
    <ProductCardView {...props} />
)

export const Primary = Template.bind({})

export default storyConfig
