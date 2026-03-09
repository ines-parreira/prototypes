import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { FRAME_WIDTH } from 'pages/common/components/ProductCarousel/constants/visuals'
import { storeWithActiveSubscriptionWithConvert } from 'pages/settings/new_billing/fixtures'

import { ProductCard } from './ProductCard'

const defaultState = {
    ...storeWithActiveSubscriptionWithConvert,
}

const storyConfig: Meta = {
    title: 'Common/Product Card',
    component: ProductCard,
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
        imageSrc:
            'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
        price: 1234.43,
        compareAtPrice: 2345.67,
        title: 'MacBook Air with M1 chip',
        onClickEdit: () => null,
        onClick: () => null,
    },
    decorators: [
        (Story) => (
            <Provider store={configureMockStore()(defaultState)}>
                <div style={{ width: FRAME_WIDTH }}>
                    <Story />
                </div>
            </Provider>
        ),
    ],
}

const Template: StoryFn<ComponentProps<typeof ProductCard>> = (props) => (
    <ProductCard {...props} />
)

export const Primary = Template.bind({})

export const WithReposition = Template.bind({})
WithReposition.args = {
    shouldHideRepositionImage: false,
    isHighlighted: true,
}

export default storyConfig
