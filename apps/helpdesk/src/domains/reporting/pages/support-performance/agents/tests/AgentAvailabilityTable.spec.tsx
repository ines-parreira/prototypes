import React from 'react'

import { render, screen } from '@testing-library/react'

import { AgentAvailabilityTable } from 'domains/reporting/pages/support-performance/agents/AgentAvailabilityTable'

describe('AgentAvailabilityTable', () => {
    it('should render placeholder content', () => {
        render(<AgentAvailabilityTable />)

        expect(screen.getByText('Agent Availability')).toBeInTheDocument()
    })
})
