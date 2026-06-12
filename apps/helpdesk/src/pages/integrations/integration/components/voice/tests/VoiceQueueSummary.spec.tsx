import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetTeamHandler,
    mockGetTeamResponse,
    mockGetVoiceQueueHandler,
    mockGetVoiceQueueResponse,
    mockVoiceQueueTarget,
} from '@gorgias/helpdesk-mocks'

import { VoiceQueueSummary } from '../VoiceQueueSummary'

jest.mock('../EditQueueModal', () => ({
    EditQueueModal: ({ isOpen, onClose, queue }: any) => (
        <div
            data-testid="edit-queue-modal"
            data-is-open={isOpen}
            data-queue-id={queue?.id}
        >
            <button onClick={onClose}>Close Modal</button>
        </div>
    ),
}))

const server = setupServer()

describe('VoiceQueueSummary', () => {
    const queue_id = 1
    const renderComponent = () =>
        render(<VoiceQueueSummary queue_id={queue_id} />)

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockGetVoiceQueueHandler(async () =>
                HttpResponse.json(
                    mockGetVoiceQueueResponse({
                        id: 1,
                        target_scope: 'specific',
                        agent_ids: [1, 2],
                        distribution_mode: 'round_robin',
                        ring_time: 30,
                        wait_time: 60,
                        capacity: 10,
                        linked_targets: [mockVoiceQueueTarget({ team_id: 1 })],
                    }),
                ),
            ).handler,
            mockGetTeamHandler(async () =>
                HttpResponse.json(
                    mockGetTeamResponse({ name: 'Support Team' }),
                ),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render loading state initially', () => {
        renderComponent()
        expect(screen.queryByText('Show Queue Settings')).toBeNull()
    })

    it('should render queue summary data', async () => {
        renderComponent()
        fireEvent.click(await screen.findByText('Show Queue Settings'))

        expect(screen.getByText('Ring to:')).toBeInTheDocument()
        expect(await screen.findByText('Support Team')).toBeInTheDocument()
        expect(screen.getByText('Number of agents:')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('Distribution mode:')).toBeInTheDocument()
        expect(screen.getByText('Round-robin')).toBeInTheDocument()
        expect(screen.getByText('Ring time per agent:')).toBeInTheDocument()
        expect(screen.getByText('30 seconds')).toBeInTheDocument()
        expect(screen.getByText('Wait time:')).toBeInTheDocument()
        expect(screen.getByText('60 seconds')).toBeInTheDocument()
        expect(screen.getByText('Queue capacity:')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
    })

    it('should render queue summary data for all agents distribution', async () => {
        server.use(
            mockGetVoiceQueueHandler(async () =>
                HttpResponse.json(
                    mockGetVoiceQueueResponse({
                        target_scope: 'all_agents',
                        agent_ids: [1, 2, 5, 6],
                        distribution_mode: 'round_robin',
                        ring_time: 30,
                        wait_time: 60,
                        capacity: 0,
                        linked_targets: [],
                    }),
                ),
            ).handler,
        )

        renderComponent()
        fireEvent.click(await screen.findByText('Show Queue Settings'))

        expect(screen.getByText('Ring to:')).toBeInTheDocument()
        expect(screen.getByText('All available agents')).toBeInTheDocument()
        expect(screen.getByText('Number of agents:')).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText('Distribution mode:')).toBeInTheDocument()
        expect(screen.getByText('Round-robin')).toBeInTheDocument()
        expect(screen.getByText('Ring time per agent:')).toBeInTheDocument()
        expect(screen.getByText('30 seconds')).toBeInTheDocument()
        expect(screen.getByText('Wait time:')).toBeInTheDocument()
        expect(screen.getByText('60 seconds')).toBeInTheDocument()
        expect(screen.getByText('Queue capacity:')).toBeInTheDocument()
        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('should handle no team data gracefully', async () => {
        server.use(
            mockGetVoiceQueueHandler(async () =>
                HttpResponse.json(
                    mockGetVoiceQueueResponse({
                        target_scope: 'specific',
                        agent_ids: [1, 2],
                        distribution_mode: 'broadcast',
                        ring_time: 30,
                        wait_time: 60,
                        capacity: 10,
                        linked_targets: [mockVoiceQueueTarget({ team_id: 1 })],
                    }),
                ),
            ).handler,
            mockGetTeamHandler(async () =>
                HttpResponse.json(mockGetTeamResponse(), { status: 500 }),
            ).handler,
        )

        renderComponent()

        fireEvent.click(await screen.findByText('Show Queue Settings'))

        expect(screen.getByText('Ring to:')).toBeInTheDocument()
        expect(screen.getByText('Specific team')).toBeInTheDocument()
        expect(screen.getByText('Number of agents:')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('Distribution mode:')).toBeInTheDocument()
        expect(screen.getByText('Broadcast')).toBeInTheDocument()
    })

    it('should show edit settings button and open modal when clicked', async () => {
        renderComponent()

        fireEvent.click(await screen.findByText('Show Queue Settings'))

        const editButton = screen.getByText('Edit settings')
        expect(editButton).toBeInTheDocument()

        fireEvent.click(editButton)

        const modal = screen.getByTestId('edit-queue-modal')
        expect(modal).toBeInTheDocument()
        expect(modal.getAttribute('data-is-open')).toBe('true')
        expect(modal.getAttribute('data-queue-id')).toBe('1')
    })

    it('should close the edit modal when onClose is triggered', async () => {
        renderComponent()

        fireEvent.click(await screen.findByText('Show Queue Settings'))

        fireEvent.click(screen.getByText('Edit settings'))

        expect(screen.getByTestId('edit-queue-modal')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Close Modal'))

        expect(
            screen.getByTestId('edit-queue-modal').getAttribute('data-is-open'),
        ).toBe('false')
    })
})
