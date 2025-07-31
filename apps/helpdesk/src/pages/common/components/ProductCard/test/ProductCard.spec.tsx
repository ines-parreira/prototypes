import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { storeWithActiveSubscriptionWithConvert } from 'pages/settings/new_billing/fixtures'

import { ProductCard } from '../ProductCard'

const defaultProps = {
    imageSrc: 'https://cdn.mos.cms.futurecdn.net/gPvyaz76tASn87RCGuSdDc.jpg',
    title: 'Product Title',
    buttonText: 'Add to cart',
    currency: 'USD',
    price: 1234.43,
    compareAtPrice: 2345.67,
    isHighlighted: true,
    onClickEdit: () => null,
    onClick: () => null,
}

const renderComponent = (props: any = defaultProps) =>
    render(
        <Provider
            store={configureMockStore()(storeWithActiveSubscriptionWithConvert)}
        >
            <ProductCard {...props} />
        </Provider>,
    )

describe('<ProductCard />', () => {
    it('should display the product title', () => {
        renderComponent()
        expect(screen.getByText('Product Title')).toBeInTheDocument()
    })

    it('should display the price', () => {
        renderComponent()
        expect(screen.getByText('$1,234.43')).toBeInTheDocument()
    })

    it('should handle add to cart button click', async () => {
        const onClick = jest.fn()
        renderComponent({ onClick })

        await userEvent.click(
            screen.getByRole('button', { name: 'Add to cart' }),
        )

        expect(onClick).toHaveBeenCalled()
    })

    it('should display the reposition image button', async () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Reposition image' }),
        ).toBeInTheDocument()
    })

    it('should not display the reposition image button if isHighlighted is false', async () => {
        renderComponent({ isHighlighted: false })

        expect(
            screen.queryByRole('button', { name: 'Reposition image' }),
        ).not.toBeInTheDocument()
    })

    it('should render edit view when user clicks on the reposition image button', async () => {
        renderComponent()

        await userEvent.click(
            screen.getByRole('button', { name: 'Reposition image' }),
        )

        expect(
            screen.queryByRole('button', { name: 'Reposition image' }),
        ).not.toBeInTheDocument()
        expect(screen.getByRole('slider')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Save Position' }),
        ).toBeInTheDocument()
    })

    it('should not render edit view when user cancel the edit', async () => {
        renderComponent()

        await userEvent.click(
            screen.getByRole('button', { name: 'Reposition image' }),
        )
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(
            screen.getByRole('button', { name: 'Reposition image' }),
        ).toBeInTheDocument()
        expect(screen.queryByRole('slider')).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Cancel' }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Save Position' }),
        ).not.toBeInTheDocument()
    })
})
