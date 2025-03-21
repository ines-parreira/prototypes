import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { getVoiceQueue, updateVoiceQueue } from '@gorgias/api-client'

import { voiceQueue } from 'fixtures/voiceQueue'
import history from 'pages/history'
import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceQueueEditPage from '../VoiceQueueEditPage'

jest.mock('@gorgias/api-client', () => ({
    getVoiceQueue: jest.fn(),
    updateVoiceQueue: jest.fn(),
}))

const getVoiceQueueMock = assumeMock(getVoiceQueue)
const updateVoiceQueueMock = assumeMock(updateVoiceQueue)

jest.mock('pages/history', () => ({
    push: jest.fn(),
}))

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

jest.mock('../VoiceQueueEditOrCreateForm', () => () => (
    <div data-testid="queue-form">VoiceQueueEditOrCreateForm</div>
))

jest.mock('../VoiceFormSubmitButton', () => ({ children }: any) => (
    <button type="submit">{children}</button>
))

jest.mock('../VoiceQueueSettingsForm', () => ({ children, onSubmit }: any) => (
    <form
        data-testid="settings-form"
        onSubmit={(e) => {
            e.preventDefault()
            onSubmit({ name: 'Test Queue', id: '123' })
        }}
    >
        {children}
    </form>
))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn().mockReturnValue({ id: '123' }),
}))

const mockQueue = voiceQueue

describe('VoiceQueueEditPage', () => {
    const renderComponent = () =>
        renderWithQueryClientAndRouter(
            <VoiceQueueEditPage />,
            `${PHONE_INTEGRATION_BASE_URL}/queues/${mockQueue.id}`,
        )

    beforeEach(() => {
        getVoiceQueueMock.mockResolvedValue({ data: mockQueue } as any)
        updateVoiceQueueMock.mockResolvedValue({ data: mockQueue } as any)
    })

    it('renders the edit queue form with all necessary components', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByTestId('queue-form')).toBeInTheDocument()
            expect(screen.getByTestId('settings-form')).toBeInTheDocument()
            expect(screen.getByText('Save changes')).toBeInTheDocument()
            expect(screen.getByText('Cancel')).toBeInTheDocument()
            expect(screen.getByText('Delete queue')).toBeInTheDocument()
        })
    })

    it('handles form submission success correctly', async () => {
        renderComponent()

        await waitFor(() => {
            expect(screen.getByTestId('queue-form')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Save changes'))

        await waitFor(() => {
            expect(mockNotify.success).toHaveBeenCalledWith(
                `'${mockQueue.name}' queue was successfully updated.`,
            )
        })

        expect(history.push).toHaveBeenCalledWith(
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })

    it('handles form submission error correctly', async () => {
        updateVoiceQueueMock.mockRejectedValue(new Error('Test error'))

        renderComponent()

        await waitFor(() => {
            expect(screen.getByTestId('queue-form')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledWith(
                "We couldn't save your preferences. Please try again.",
            )
        })
    })

    it('redirects to the queue list when GET queue fails', async () => {
        getVoiceQueueMock.mockRejectedValue(new Error('Test error'))

        renderComponent()

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledWith(
                'Something went wrong while fetching the queue. Please try again.',
            )
            expect(history.push).toHaveBeenCalledWith(
                `${PHONE_INTEGRATION_BASE_URL}/queues`,
            )
        })
    })
})
