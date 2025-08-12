import React from 'react'

import { render, screen } from '@testing-library/react'

import { AiAgentOpportunities } from '../AiAgentOpportunities'

describe('AiAgentOpportunities', () => {
    it('should render OpportunitiesLayout', () => {
        render(<AiAgentOpportunities />)

        expect(screen.getByText('Available opportunities')).toBeInTheDocument()
        expect(screen.getByText('Opportunities')).toBeInTheDocument()
    })

    it('should render with correct data attributes', () => {
        const { container } = render(<AiAgentOpportunities />)

        const wrapper = container.querySelector('[data-ai-opportunities]')
        expect(wrapper).toBeInTheDocument()
        expect(wrapper).toHaveAttribute('data-overflow', 'visible')
    })
})
