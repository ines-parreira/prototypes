import type { ComponentProps } from 'react'
import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import * as billingFixtures from 'fixtures/billing'
import { initialState } from 'state/billing/reducers'

import { ProductCarousel } from './ProductCarousel'

const defaultState = {
    billing: initialState.mergeDeep(billingFixtures.billingState),
}

const storyConfig: Meta = {
    title: 'Common/Product Carousel',
    component: ProductCarousel,
    args: {
        products: [
            {
                id: 1,
                title: `Gibson ES-335 Sunburst 1970`,
                price: 8289,
                compareAtPrice: 9000,
                currency: 'usd',
                featured_image:
                    'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/gibson-electric-guitars-semi-hollow-gibson-es-335-sunburst-1968-u3877433902-29229399769223_2000x.jpg?v=1652315363',
            },
            {
                id: 2,
                title: `Gator TSA ATA Molded Les Paul Electric Guitar Case`,
                price: 469.98,
                currency: 'usd',
                featured_image:
                    'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/gator-accessories-cases-and-gig-bags-guitar-cases-gator-tsa-ata-molded-les-paul-electric-guitar-case-gtsa-gtrlps-29364584382599_2000x.jpg?v=1657220180',
            },
            {
                id: 3,
                title: `Fender George Harrison All Things Must Pass Pick Tin Set of 6`,
                price: 11.99,
                compareAtPrice: 14.1,
                currency: 'usd',
                featured_image:
                    'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/fender-accessories-picks-fender-george-harrison-all-things-must-pass-pick-tin-set-of-6-1980351046-29707897176199_2000x.jpg?v=1663347561',
            },
        ],
    },
    decorators: [
        (Story) => (
            <Provider store={configureMockStore()(defaultState)}>
                <Story />
            </Provider>
        ),
    ],
}

const Template: StoryFn<ComponentProps<typeof ProductCarousel>> = (props) => (
    <ProductCarousel {...props} />
)

export const Primary = Template.bind({})

export default storyConfig
