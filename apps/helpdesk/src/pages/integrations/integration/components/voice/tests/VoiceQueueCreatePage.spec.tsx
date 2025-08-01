import { assumeMock } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import fireEvent from '@testing-library/user-event'

import { createVoiceQueues } from '@gorgias/helpdesk-client'

import history from 'pages/history'
import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import VoiceQueueCreatePage from '../VoiceQueueCreatePage'

jest.mock('@gorgias/helpdesk-client')
const createVoiceQueuesMock = assumeMock(createVoiceQueues)

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

jest.mock('pages/history')

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

describe('VoiceQueueCreatePage', () => {
    const renderComponent = () =>
        renderWithQueryClientAndRouter(<VoiceQueueCreatePage />)

    it('renders the create queue form with all necessary components', () => {
        renderComponent()

        expect(screen.getByTestId('queue-form')).toBeInTheDocument()
        expect(screen.getByTestId('settings-form')).toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('handles form submission success correctly', async () => {
        createVoiceQueuesMock.mockResolvedValue({
            data: { name: 'Test Queue' },
        } as any)

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        await waitFor(() => {
            expect(mockNotify.success).toHaveBeenCalledWith(
                "'Test Queue' queue was successfully created.",
            )
        })

        expect(history.push).toHaveBeenCalledWith(
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })

    it('handles form submission error correctly', async () => {
        createVoiceQueuesMock.mockRejectedValue(new Error('Error'))

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledWith(
                "We couldn't save your preferences. Please try again.",
            )
        })
    })

    it('navigates to queue list on cancel', async () => {
        renderComponent()

        expect(screen.getByText('Cancel').closest('a')).toHaveAttribute(
            'to',
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })
})
