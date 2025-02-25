import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { AiAgentSales } from '../AiAgentSales'

const renderComponent = () =>
    render(
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
