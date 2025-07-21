import React from 'react'

import { render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { storeWithActiveSubscriptionWithConvert } from 'pages/settings/new_billing/fixtures'
import { userEvent } from 'utils/testing/userEvent'

import { ProductCarousel } from '../ProductCarousel'

const defaultProps = {
    products: [
        {
            id: 1,
            title: 'Product 1',
            price: 8289,
            compareAtPrice: 9000,
            currency: 'usd',
            featured_image:
                'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/gibson-electric-guitars-semi-hollow-gibson-es-335-sunburst-1968-u3877433902-29229399769223_2000x.jpg?v=1652315363',
        },
        {
            id: 2,
            title: 'Product 2',
            price: 469.98,
            currency: 'usd',
            featured_image:
                'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/gator-accessories-cases-and-gig-bags-guitar-cases-gator-tsa-ata-molded-les-paul-electric-guitar-case-gtsa-gtrlps-29364584382599_2000x.jpg?v=1657220180',
        },
        {
            id: 3,
            title: 'Product 3',
            price: 11.99,
            compareAtPrice: 14.1,
            currency: 'usd',
            featured_image:
                'https://cdn.shopify.com/s/files/1/0343/4368/2183/products/fender-accessories-picks-fender-george-harrison-all-things-must-pass-pick-tin-set-of-6-1980351046-29707897176199_2000x.jpg?v=1663347561',
        },
    ],
}
const renderComponent = (props: any = defaultProps) =>
    render(
        <Provider
            store={configureMockStore()(storeWithActiveSubscriptionWithConvert)}
        >
            <ProductCarousel {...props} />
        </Provider>,
    )

describe('<ProductCarousel />', () => {
    it('should show the first product highlighted', () => {
        renderComponent()
        const highlightedProduct = document.querySelector(
            '.highlighted',
        ) as HTMLElement

        expect(
            within(highlightedProduct).getByText('Product 1'),
        ).toBeInTheDocument()
    })

    it('should show 3 products', () => {
        renderComponent()
        expect(screen.getAllByText('Add to cart').length).toBe(3)
    })

    it('should navigate to the next product when the next button is clicked', async () => {
        renderComponent({ ...defaultProps, shouldHideRepositionImage: true })

        await userEvent.click(screen.getByTestId('next-button'))
        const highlightedProduct = document.querySelector(
            '.highlighted',
        ) as HTMLElement

        expect(
            within(highlightedProduct).getByText('Product 2'),
        ).toBeInTheDocument()
    })

    it('should navigate to the previous product when the previous button is clicked', async () => {
        renderComponent()

        await userEvent.click(screen.getByTestId('next-button'))
        await userEvent.click(screen.getByTestId('prev-button'))

        const highlightedProduct = document.querySelector(
            '.highlighted',
        ) as HTMLElement

        expect(
            within(highlightedProduct).getByText('Product 1'),
        ).toBeInTheDocument()
    })
})
