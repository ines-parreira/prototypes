import { act, screen, waitFor } from '@testing-library/react'
import fireEvent from '@testing-library/user-event'

import { createVoiceQueues } from '@gorgias/helpdesk-client'

import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import CreateNewQueueModal from '../CreateNewQueueModal'

jest.mock('@gorgias/helpdesk-client')
const createVoiceQueuesMock = assumeMock(createVoiceQueues)

const mockNotify = {
    success: jest.fn(),
    error: jest.fn(),
}
jest.mock('hooks/useNotify', () => ({
    useNotify: () => mockNotify,
}))

jest.mock('../CreateEditQueueModalFormContent', () => () => (
    <div data-testid="modal-form-content">CreateEditQueueModalFormContent</div>
))

jest.mock('../VoiceFormSubmitButton', () => ({ children }: any) => (
    <button type="submit">{children}</button>
))

jest.mock('../VoiceQueueSettingsForm', () => ({ children, onSubmit }: any) => (
    <form
        data-testid="settings-form"
        onSubmit={(e) => {
            e.preventDefault()
            onSubmit({ name: 'Test Queue', id: 123 })
        }}
    >
        {children}
    </form>
))

describe('CreateNewQueueModal', () => {
    const mockOnClose = jest.fn()
    const mockOnCreateSuccess = jest.fn()

    const renderComponent = (props = {}) =>
        renderWithQueryClientAndRouter(
            <CreateNewQueueModal
                isOpen={true}
                onClose={mockOnClose}
                onCreateSuccess={mockOnCreateSuccess}
                {...props}
            />,
        )

    it('renders the modal with all necessary components', () => {
        renderComponent()

        expect(screen.getByText('Create new queue')).toBeInTheDocument()
        expect(screen.getByTestId('modal-form-content')).toBeInTheDocument()
        expect(screen.getByTestId('settings-form')).toBeInTheDocument()
        expect(screen.getByText('Create queue')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
        expect(screen.getByText('Queues settings')).toBeInTheDocument()
        expect(
            screen.getByText('How to setup a call queue'),
        ).toBeInTheDocument()
    })

    it('handles form submission success correctly', async () => {
        createVoiceQueuesMock.mockResolvedValue({
            data: { name: 'Test Queue', id: 123 },
        } as any)

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Create queue'))
        })

        await waitFor(() => {
            expect(mockNotify.success).toHaveBeenCalledWith(
                "'Test Queue' queue was successfully created.",
            )
            expect(mockOnCreateSuccess).toHaveBeenCalledWith(123)
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('handles form submission error correctly', async () => {
        createVoiceQueuesMock.mockRejectedValue(new Error('Test error'))

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Create queue'))
        })

        await waitFor(() => {
            expect(mockNotify.error).toHaveBeenCalledWith(
                "We couldn't save your preferences. Please try again.",
            )
        })
    })

    it('calls onClose when cancel button is clicked', async () => {
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('does not render when isOpen is false', () => {
        renderComponent({ isOpen: false })

        expect(screen.queryByText('Create new queue')).not.toBeInTheDocument()
    })

    it('renders correct link to queues settings', () => {
        renderComponent()

        const link = screen.getByText('Queues settings').closest('a')
        expect(link).toHaveAttribute(
            'href',
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })
})
