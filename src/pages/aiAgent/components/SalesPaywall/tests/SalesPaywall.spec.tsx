import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { SalesPaywall } from '../SalesPaywall'

const renderComponent = () =>
    render(
        <Provider store={mockStore({})}>
            <SalesPaywall />
        </Provider>,
    )

describe('<SalesPaywall />', () => {
    it('should render the sales paywall component', () => {
        renderComponent()

        expect(screen.getByRole('radiogroup')).toBeInTheDocument()
    })

    it('should display Sales Strategy image by default', () => {
        renderComponent()

        expect(screen.getAllByRole('radio')[0]).toBeChecked()
    })

    it('should change image to Dynamic Discount when the corresponding option is selected', async () => {
        renderComponent()

        await userEvent.click(screen.getByText('Dynamic Discount'))

        expect(screen.getAllByRole('radio')[1]).toBeChecked()
    })

    it('should change image to Product Recommendations when the corresponding option is selected', async () => {
        renderComponent()

        await userEvent.click(screen.getByText('Product Recommendations'))

        expect(screen.getAllByRole('radio')[2]).toBeChecked()
    })
})
