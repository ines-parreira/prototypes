import { history } from '@repo/routing'
import { userEvent } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { VoiceQueue, VoiceQueueStatus } from '@gorgias/helpdesk-queries'

import { voiceQueue } from 'fixtures/voiceQueue'
import mockedVirtuoso from 'tests/mockedVirtuoso'
import { renderWithRouter } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceQueueList from '../VoiceQueueList'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Skeleton: () => <div>Skeleton</div>,
}))

jest.mock('react-virtuoso', () => mockedVirtuoso)

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
    const mockOnScroll = jest.fn()

    const renderComponent = (
        props = { queues: mockQueues, onScroll: mockOnScroll },
    ) => {
        return renderWithRouter(<VoiceQueueList {...props} />)
    }

    it('should render the list of queues when not fetching', () => {
        renderComponent()

        expect(screen.getByText('Name')).toBeInTheDocument()
        expect(screen.getByText('Queue 1')).toBeInTheDocument()
        expect(screen.getByText('Queue 2')).toBeInTheDocument()
        expect(screen.getByText('enabled')).toBeInTheDocument()
        expect(screen.getByText('disabled')).toBeInTheDocument()
    })

    it('should display the summary block when hovering over the info icon', async () => {
        renderComponent()

        const infoIcon = screen.getAllByText('info')[0]
        userEvent.hover(infoIcon)

        await waitFor(() => {
            expect(
                screen.getByText('Ring to', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Number of agents', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Distribution mode', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Ring time per agent', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Wait time', { exact: false }),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Queue capacity', { exact: false }),
            ).toBeInTheDocument()
        })
    })

    it('should render skeleton loading state with no queues', () => {
        renderComponent({ queues: [], onScroll: mockOnScroll })

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

    it('should call loadMore when end area is reached', () => {
        const { getByText } = renderComponent()

        const endTrigger = getByText('end area')
        userEvent.click(endTrigger)

        expect(mockOnScroll).toHaveBeenCalled()
    })
})
