import { assumeMock } from '@repo/testing'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

import { useListLiveCallQueueAgents } from '@gorgias/helpdesk-queries'

import LiveVoiceAgentsSection from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsSection'

jest.mock('@gorgias/helpdesk-queries')
jest.mock('hooks/useAppSelector', () => (fn: () => void) => fn())

const useListLiveCallQueueAgentsMock = assumeMock(useListLiveCallQueueAgents)

jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsList',
    () => () => <div>LiveVoiceAgentsList</div>,
)

describe('LiveVoiceAgentsSection', () => {
    const renderComponent = (
        props = {
            params: {
                agent_ids: [1, 2],
                integration_ids: [3, 4],
                voice_queue_ids: [5, 6],
            },
        },
    ) => render(<LiveVoiceAgentsSection {...props} />)

    afterEach(cleanup)

    it('should display loading state', () => {
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as any)

        renderComponent()

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
        expect(
            screen.queryByText('LiveVoiceAgentsList'),
        ).not.toBeInTheDocument()
    })

    it('should display agents list', () => {
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: { data: { data: [{ id: 1, name: 'Agent 1' }] } },
            isLoading: false,
        } as any)

        renderComponent()

        expect(screen.getByText('LiveVoiceAgentsList')).toBeInTheDocument()
    })

    it('should display no data available', () => {
        const refetch = jest.fn()
        useListLiveCallQueueAgentsMock.mockReturnValue({
            data: { data: { data: [] } },
            isLoading: false,
            refetch,
        } as any)

        renderComponent()

        expect(screen.getByText('No data available')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
        expect(refetch).toHaveBeenCalled()
    })

    it('should pass correct filters to useListLiveCallQueueAgents', () => {
        renderComponent()
        expect(useListLiveCallQueueAgentsMock).toHaveBeenCalledWith(
            {
                agent_ids: [1, 2],
                integration_ids: [3, 4],
                voice_queue_ids: [5, 6],
            },
            expect.any(Object),
        )
    })
})
