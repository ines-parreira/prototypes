import {render, screen} from '@testing-library/react'
import React from 'react'

import {AgentAvatar} from 'pages/stats/AgentAvatar'
import {agents} from 'fixtures/agents'

describe('<AgentAvatar>', () => {
    const agent = agents[0]

    it('should render agent name', () => {
        render(<AgentAvatar agent={agent} />)

        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
    })
})
