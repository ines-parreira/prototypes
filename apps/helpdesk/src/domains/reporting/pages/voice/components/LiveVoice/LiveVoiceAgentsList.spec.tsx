import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import type { LiveCallQueueAgent } from '@gorgias/helpdesk-queries'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import LiveVoiceAgentsList from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsList'
import {
    AgentStatusCategory,
    groupAgentsByStatus,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'

jest.mock('@gorgias/realtime')
jest.mock('domains/reporting/pages/voice/components/LiveVoice/utils', () => ({
    ...jest.requireActual(
        'domains/reporting/pages/voice/components/LiveVoice/utils',
    ),
    groupAgentsByStatus: jest.fn(),
}))
jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentRow',
    () => () => <div>LiveVoiceAgentRow</div>,
)
const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)
const groupAgentsByStatusMock = assumeMock(groupAgentsByStatus)

describe('LiveVoiceAgentsList', () => {
    beforeEach(() => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: {},
        })
    })

    const renderComponent = (agents?: LiveCallQueueAgent[]) =>
        render(<LiveVoiceAgentsList agents={agents || []} />)

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
                { id: 1, name: 'Agent 1' },
                { id: 4, name: 'Agent 4' },
            ],
            [AgentStatusCategory.Available]: [{ id: 2, name: 'Agent 2' }],
            [AgentStatusCategory.Unavailable]: [{ id: 3, name: 'Agent 3' }],
        })
        renderComponent()

        expect(screen.getByText('Busy (2)')).toBeInTheDocument()
        expect(screen.getByText('Available (1)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (1)')).toBeInTheDocument()
    })

    it('should be able to sort data', () => {
        groupAgentsByStatusMock.mockReturnValue({
            [AgentStatusCategory.Busy]: [
                { id: 1, name: 'Agent Tom' },
                { id: 4, name: 'Agent Ann' },
            ],
            [AgentStatusCategory.Available]: [
                { id: 2, name: undefined },
                { id: 5, name: undefined },
                { id: 7, name: 'testing' },
            ],
            [AgentStatusCategory.Unavailable]: [{ id: 3, name: 'Agent 3' }],
        })
        renderComponent()

        expect(screen.getByText('Busy (2)')).toBeInTheDocument()
        expect(screen.getByText('Available (3)')).toBeInTheDocument()
        expect(screen.getByText('Unavailable (1)')).toBeInTheDocument()
    })

    it('should take into account the online statuses', () => {
        groupAgentsByStatusMock.mockReturnValue({
            [AgentStatusCategory.Busy]: [{ id: 1, name: 'Agent 1' }],
            [AgentStatusCategory.Available]: [
                { id: 2, name: 'Agent 2' },
                { id: 4, name: 'Agent 4' },
            ],
            [AgentStatusCategory.Unavailable]: [{ id: 3, name: 'Agent 3' }],
        })
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: {}, 4: {} },
        })

        renderComponent([
            {
                id: 1,
                name: 'Agent 1',
                online: true,
                available: true,
                is_available_for_call: false,
                call_statuses: [{ call_sid: 'call1' }],
                voice_queue_ids: [1],
            },
            {
                id: 2,
                name: 'Agent 2',
                online: true,
                available: true,
                is_available_for_call: true,
                forward_when_offline: true,
                forward_calls: true,
                call_statuses: [],
                voice_queue_ids: [2],
            },
            {
                id: 3,
                name: 'Agent 3',
                online: false,
                is_available_for_call: false,
                voice_queue_ids: [],
                call_statuses: [],
                available: true,
            },
            {
                id: 4,
                name: 'Agent 4',
                online: false,
                available: true,
                is_available_for_call: false,
                forward_when_offline: false,
                forward_calls: false,
                call_statuses: [],
                voice_queue_ids: [3],
            },
        ])

        expect(groupAgentsByStatusMock).toHaveBeenCalledWith([
            {
                id: 1,
                name: 'Agent 1',
                online: true,
                available: true,
                is_available_for_call: false,
                call_statuses: [{ call_sid: 'call1' }],
                voice_queue_ids: [1],
            }, // nothing changed here
            {
                id: 2,
                name: 'Agent 2',
                online: false,
                available: true,
                is_available_for_call: true,
                forward_when_offline: true,
                forward_calls: true,
                call_statuses: [],
                voice_queue_ids: [2],
            }, // Agent 2 is offline but available due to forward calls
            {
                id: 3,
                name: 'Agent 3',
                online: false,
                is_available_for_call: false,
                voice_queue_ids: [],
                call_statuses: [],
                available: true,
            }, // Agent 3 is offline and not available
            {
                id: 4,
                name: 'Agent 4',
                online: true,
                available: true,
                is_available_for_call: true,
                forward_when_offline: false,
                forward_calls: false,
                call_statuses: [],
                voice_queue_ids: [3],
            }, // Agent 4 is now online and available
        ])
    })
})
