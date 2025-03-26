import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { VoiceQueue, VoiceQueueStatus } from '@gorgias/api-queries'

import { voiceQueue } from 'fixtures/voiceQueue'
import history from 'pages/history'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceQueueList from '../VoiceQueueList'

jest.mock('pages/history')

jest.mock('@gorgias/merchant-ui-kit', () => ({
    ...jest.requireActual('@gorgias/merchant-ui-kit'),
    Skeleton: () => <div>Skeleton</div>,
}))

describe('VoiceQueueList', () => {
    const mockQueues: VoiceQueue[] = [
        {
            ...voiceQueue,
            id: 1,
            name: 'Queue 1',
            status: VoiceQueueStatus.Enabled,
        },
        {
            ...voiceQueue,
            id: 2,
            name: 'Queue 2',
            status: VoiceQueueStatus.Disabled,
        },
    ]

    const renderComponent = (
        props = { queues: mockQueues, isFetching: false },
    ) => {
        return render(<VoiceQueueList {...props} />)
    }

    it('should render the list of queues when not fetching', () => {
        renderComponent()

        expect(screen.getByText('Queue 1')).toBeInTheDocument()
        expect(screen.getByText('Queue 2')).toBeInTheDocument()
        expect(screen.getByText('enabled')).toBeInTheDocument()
        expect(screen.getByText('disabled')).toBeInTheDocument()
    })

    it('should render skeleton loading state when fetching', () => {
        renderComponent({ queues: [], isFetching: true })

        const skeletons = screen.getAllByText('Skeleton')
        expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should navigate to queue details when clicking a row', async () => {
        renderComponent()

        const firstQueueRow = screen
            .getByText('Queue 1')
            .closest('tr') as HTMLElement
        fireEvent.click(firstQueueRow)

        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith(
                `${PHONE_INTEGRATION_BASE_URL}/queues/1`,
            )
        })
    })
})
