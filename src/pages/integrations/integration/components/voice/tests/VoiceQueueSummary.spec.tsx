import { fireEvent, screen } from '@testing-library/react'

import { useGetTeam, useGetVoiceQueue } from '@gorgias/helpdesk-queries'

import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import VoiceQueueSummary from '../VoiceQueueSummary'

jest.mock('@gorgias/helpdesk-queries')
const useGetVoiceQueueMock = assumeMock(useGetVoiceQueue)
const useGetTeamMock = assumeMock(useGetTeam)

jest.mock('../EditQueueModal', () => ({ isOpen, onClose, queue }: any) => (
    <div
        data-testid="edit-queue-modal"
        data-is-open={isOpen}
        data-queue-id={queue?.id}
    >
        <button onClick={onClose}>Close Modal</button>
    </div>
))

describe('VoiceQueueSummary', () => {
    const queue_id = 1
    const renderComponent = () =>
        renderWithQueryClientProvider(<VoiceQueueSummary queue_id={queue_id} />)

    it('should render loading state initially', () => {
        useGetVoiceQueueMock.mockReturnValue({
            isLoading: true,
            data: null,
        } as any)
        renderComponent()
        expect(screen.queryByText('Show Queue Settings')).toBeNull()
        expect(useGetTeamMock).toHaveBeenCalledWith(0, {
            query: { enabled: false },
        })
    })

    it('should render queue summary data', async () => {
        useGetVoiceQueueMock.mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    target_scope: 'specific',
                    agent_ids: [1, 2],
                    distribution_mode: 'round_robin',
                    ring_time: 30,
                    wait_time: 60,
                    capacity: 10,
                    linked_targets: [],
                },
            },
        } as any)
        useGetTeamMock.mockReturnValue({
            data: { data: { name: 'Support Team' } },
        } as any)

        renderComponent()
        expect(screen.getByText('Show Queue Settings')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Show Queue Settings'))

        expect(screen.getByText('Ring to:')).toBeInTheDocument()
        expect(screen.getByText('Support Team')).toBeInTheDocument()
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
        expect(useGetTeamMock).toHaveBeenCalledWith(0, {
            query: { enabled: false },
        })
    })

    it('should render queue summary data for all agents distribution', async () => {
        useGetVoiceQueueMock.mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    target_scope: 'all_agents',
                    agent_ids: [1, 2, 5, 6],
                    distribution_mode: 'round_robin',
                    ring_time: 30,
                    wait_time: 60,
                    capacity: null,
                    linked_targets: [],
                },
            },
        } as any)
        useGetTeamMock.mockReturnValue({
            data: { data: { name: 'Support Team' } },
        } as any)

        renderComponent()
        expect(screen.getByText('Show Queue Settings')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Show Queue Settings'))

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
        useGetVoiceQueueMock.mockReturnValue({
            isLoading: false,
            data: {
                data: {
                    target_scope: 'specific',
                    agent_ids: [1, 2],
                    distribution_mode: 'broadcast',
                    ring_time: 30,
                    wait_time: 60,
                    capacity: 10,
                    linked_targets: [{ team_id: 1 }],
                },
            },
        } as any)
        useGetTeamMock.mockReturnValue({ data: null } as any)

        renderComponent()

        expect(screen.getByText('Show Queue Settings')).toBeInTheDocument()
        fireEvent.click(screen.getByText('Show Queue Settings'))

        expect(screen.getByText('Ring to:')).toBeInTheDocument()
        expect(screen.getByText('Specific team')).toBeInTheDocument()
        expect(screen.getByText('Number of agents:')).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('Distribution mode:')).toBeInTheDocument()
        expect(screen.getByText('Broadcast')).toBeInTheDocument()
    })

    it('should show edit settings button and open modal when clicked', () => {
        const mockQueue = {
            id: 1,
            target_scope: 'specific',
            agent_ids: [1, 2],
            distribution_mode: 'round_robin',
            ring_time: 30,
            wait_time: 60,
            capacity: 10,
            linked_targets: [],
        }

        useGetVoiceQueueMock.mockReturnValue({
            isLoading: false,
            data: {
                data: mockQueue,
            },
        } as any)

        renderComponent()

        // Open the collapsible details
        fireEvent.click(screen.getByText('Show Queue Settings'))

        // Check edit button exists
        const editButton = screen.getByText('Edit settings')
        expect(editButton).toBeInTheDocument()

        // Click edit button and check modal is shown
        fireEvent.click(editButton)

        const modal = screen.getByTestId('edit-queue-modal')
        expect(modal).toBeInTheDocument()
        expect(modal.getAttribute('data-is-open')).toBe('true')
        expect(modal.getAttribute('data-queue-id')).toBe('1')
    })

    it('should close the edit modal when onClose is triggered', () => {
        const mockQueue = {
            id: 1,
            target_scope: 'specific',
            agent_ids: [1, 2],
            distribution_mode: 'round_robin',
            ring_time: 30,
            wait_time: 60,
            capacity: 10,
            linked_targets: [],
        }

        useGetVoiceQueueMock.mockReturnValue({
            isLoading: false,
            data: {
                data: mockQueue,
            },
        } as any)

        renderComponent()

        // Open the collapsible details
        fireEvent.click(screen.getByText('Show Queue Settings'))

        // Click edit button to open modal
        fireEvent.click(screen.getByText('Edit settings'))

        // Check modal is shown
        expect(screen.getByTestId('edit-queue-modal')).toBeInTheDocument()

        // Click close button in modal
        fireEvent.click(screen.getByText('Close Modal'))

        // Check modal is no longer shown with isOpen=true
        expect(
            screen.getByTestId('edit-queue-modal').getAttribute('data-is-open'),
        ).toBe('false')
    })
})
