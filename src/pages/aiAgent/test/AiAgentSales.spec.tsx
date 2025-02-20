import {render, screen} from '@testing-library/react'
import React from 'react'

import {AiAgentSales} from '../AiAgentSales'

const renderComponent = () => render(<AiAgentSales />)

describe('<AiAgentSales />', () => {
    it('should render the sales components', () => {
        renderComponent()

        expect(screen.getByText('Sales settings')).toBeInTheDocument()
    })
})
