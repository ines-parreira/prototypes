import { history } from '@repo/routing'
import { assumeMock } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { deleteVoiceQueue } from '@gorgias/helpdesk-client'

import { voiceQueue } from 'fixtures/voiceQueue'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceQueueDelete from '../VoiceQueueDelete'

jest.mock('@gorgias/helpdesk-client', () => ({
    deleteVoiceQueue: jest.fn(() => ({
        mutate: jest.fn(),
        isLoading: false,
        isError: false,
        error: null,
    })),
}))
const deleteVoiceQueueMock = assumeMock(deleteVoiceQueue)

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

describe('VoiceQueueDelete', () => {
    const renderComponent = () => {
        return renderWithQueryClientProvider(
            <VoiceQueueDelete queue={voiceQueue} />,
        )
    }

    it('should render the component', () => {
        renderComponent()

        expect(screen.getByText('Delete queue')).toBeInTheDocument()
        expect(screen.queryByText('Delete call queue?')).toBeNull()
        expect(screen.queryByText('Queue cannot be deleted')).toBeNull()
    })

    it('should show the confirmation modal when the delete button is clicked', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Delete queue'))

        expect(screen.getByText('Delete call queue?')).toBeInTheDocument()
    })

    it('should show the linked integrations error modal when the delete button is clicked and there are linked integrations', async () => {
        deleteVoiceQueueMock.mockRejectedValue({
            status: 400,
        })
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Delete queue'))
        })

        await waitFor(() => {
            screen.findByText('Delete')
        })

        act(() => {
            fireEvent.click(screen.getByText('Delete'))
        })

        expect(mockNotify.error).not.toHaveBeenCalled()

        await waitFor(() => {
            expect(
                screen.getByText('Queue cannot be deleted'),
            ).toBeInTheDocument()
        })
    })

    it('delete api call general error', async () => {
        deleteVoiceQueueMock.mockRejectedValue({
            status: 500,
        })
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Delete queue'))
        })

        await waitFor(() => {
            screen.findByText('Delete')
        })

        act(() => {
            fireEvent.click(screen.getByText('Delete'))
        })

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledWith(
                "We couldn't delete the queue. Please try again.",
            )
        })

        expect(screen.queryByText('Queue cannot be deleted')).toBeNull()

        await waitFor(() => {
            expect(screen.queryByText('Delete call queue?')).toBeNull()
        })
    })

    it('delete api call success', async () => {
        deleteVoiceQueueMock.mockResolvedValue({
            status: 200,
        } as any)
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Delete queue'))
        })

        await waitFor(() => {
            screen.findByText('Delete')
        })

        act(() => {
            fireEvent.click(screen.getByText('Delete'))
        })

        await waitFor(() => {
            expect(mockNotify.success).toHaveBeenCalledWith(
                `${voiceQueue.name} queue was successfully deleted`,
            )
        })

        expect(history.push).toHaveBeenCalledWith(
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })
})
