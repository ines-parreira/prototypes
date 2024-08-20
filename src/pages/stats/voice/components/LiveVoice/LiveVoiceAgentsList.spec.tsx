import React from 'react'
import {render, screen} from '@testing-library/react'
import {assumeMock} from 'utils/testing'
import LiveVoiceAgentsList from './LiveVoiceAgentsList'
import {AgentStatusCategory, groupAgentsByStatus} from './utils'

jest.mock('pages/stats/voice/components/LiveVoice/utils')

const groupAgentsByStatusMock = assumeMock(groupAgentsByStatus)

describe('LiveVoiceAgentsList', () => {
    const renderComponent = () => render(<LiveVoiceAgentsList agents={[]} />)

    it('should render the title and category labels correctly when there are no agents in category', () => {
        groupAgentsByStatusMock.mockReturnValue({
            [AgentStatusCategory.Busy]: [],
            [AgentStatusCategory.Available]: [],
            [AgentStatusCategory.Unavailable]: [],
        })
        renderComponent()

        expect(screen.getByText('Busy (0)')).toBeInTheDocument()
        expect(screen.getByText('Available (0)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (0)')).toBeInTheDocument()
    })

    it('should render the title and category labels correctly when there are agents in category', () => {
        groupAgentsByStatusMock.mockReturnValue({
            [AgentStatusCategory.Busy]: [
                {id: 1, name: 'Agent 1'},
                {id: 4, name: 'Agent 4'},
            ],
            [AgentStatusCategory.Available]: [{id: 2, name: 'Agent 2'}],
            [AgentStatusCategory.Unavailable]: [{id: 3, name: 'Agent 3'}],
        })
        renderComponent()

        expect(screen.getByText('Busy (2)')).toBeInTheDocument()
        expect(screen.getByText('Available (1)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (1)')).toBeInTheDocument()
    })
})
