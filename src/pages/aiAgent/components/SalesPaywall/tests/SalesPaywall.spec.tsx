import React from 'react'

import { render, screen } from '@testing-library/react'
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

        expect(screen.getByText('Sales features here')).toBeInTheDocument()
    })
})
