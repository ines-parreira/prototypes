import React from 'react'

import { render, screen } from '@testing-library/react'

import { AgentAvatar } from 'domains/reporting/pages/common/AgentAvatar'
import { agents } from 'fixtures/agents'

describe('<AgentAvatar>', () => {
    const agent = agents[0]

    it('should render agent name', () => {
        render(<AgentAvatar agent={agent} />)

        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
    })
})
