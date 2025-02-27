import React from 'react'

import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentSales } from '../AiAgentSales'

const renderComponent = () =>
    renderWithRouter(
        <Provider store={mockStore({})}>
            <AiAgentSales />
        </Provider>,
    )

describe('<AiAgentSales />', () => {
    it('should render the sales components', () => {
        renderComponent()

        expect(screen.getByText('Sales settings')).toBeInTheDocument()
    })
})
