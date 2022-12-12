import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import {FRAME_WIDTH} from '../../../../constants/visuals'

import {ProductCard} from './ProductCard'

const storyConfig: Meta = {
    title: 'Data Display/Chat Campaigns/Product Card',
    component: ProductCard,
    argTypes: {
        color: {
            control: {
                type: 'color',
            },
        },
    },
    args: {
        color: '#0097ff',
        currency: 'USD',
        image: 'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
        price: 1234.43,
        title: 'MacBook Air with M1 chip',
    },
    decorators: [
        (storyFn) => <div style={{width: FRAME_WIDTH}}>{storyFn()}</div>,
    ],
}

const Template: Story<ComponentProps<typeof ProductCard>> = (props) => (
    <ProductCard {...props} />
)

export const Primary = Template.bind({})

export default storyConfig
