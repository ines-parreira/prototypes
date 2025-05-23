import { act, screen, waitFor } from '@testing-library/react'
import fireEvent from '@testing-library/user-event'

import { updateVoiceQueue } from '@gorgias/helpdesk-client'
import { VoiceQueue } from '@gorgias/helpdesk-queries'

import { voiceQueue } from 'fixtures/voiceQueue'
import { renderWithQueryClientAndRouter } from 'tests/renderWIthQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import EditQueueModal from '../EditQueueModal'

jest.mock('@gorgias/helpdesk-client')
const updateVoiceQueueMock = assumeMock(updateVoiceQueue)

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
            onSubmit({ name: 'Updated Queue', id: '123' })
        }}
    >
        {children}
    </form>
))

describe('EditQueueModal', () => {
    const mockOnClose = jest.fn()
    const mockOnUpdateSuccess = jest.fn()
    const mockQueue: VoiceQueue = {
        ...voiceQueue,
        id: 123,
        name: 'Test Queue',
        integrations: [],
    }

    const renderComponent = (props = {}) =>
        renderWithQueryClientAndRouter(
            <EditQueueModal
                isOpen={true}
                onClose={mockOnClose}
                onUpdateSuccess={mockOnUpdateSuccess}
                queue={mockQueue}
                {...props}
            />,
        )

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the modal with all necessary components', () => {
        renderComponent()

        expect(screen.getByText(`Edit ${mockQueue.name}`)).toBeInTheDocument()
        expect(screen.getByTestId('modal-form-content')).toBeInTheDocument()
        expect(screen.getByTestId('settings-form')).toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('shows warning banner when queue has integrations', () => {
        const queueWithIntegrations = {
            ...mockQueue,
            integrations: [{ id: 1, name: 'Integration 1' }],
        }

        renderComponent({ queue: queueWithIntegrations })

        expect(
            screen.getByText(
                /This queue is linked to one or more phone integrations/,
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(/will also affect those integrations/),
        ).toBeInTheDocument()
    })

    it('handles form submission success correctly', async () => {
        updateVoiceQueueMock.mockResolvedValue({
            data: { name: 'Updated Queue' },
        } as any)

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        await waitFor(() => {
            expect(updateVoiceQueueMock).toHaveBeenCalledWith(
                123,
                {
                    name: 'Updated Queue',
                    id: '123',
                },
                undefined,
            )
            expect(mockNotify.success).toHaveBeenCalledWith(
                "'Updated Queue' queue was successfully updated.",
            )
            expect(mockOnUpdateSuccess).toHaveBeenCalled()
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('handles form submission error correctly', async () => {
        updateVoiceQueueMock.mockRejectedValue(new Error('Test error'))

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

    it('calls onClose when cancel button is clicked', () => {
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(mockOnClose).toHaveBeenCalled()
    })

    it('does not render when isOpen is false', () => {
        renderComponent({ isOpen: false })

        expect(
            screen.queryByText(`Edit ${mockQueue.name}`),
        ).not.toBeInTheDocument()
    })
})
