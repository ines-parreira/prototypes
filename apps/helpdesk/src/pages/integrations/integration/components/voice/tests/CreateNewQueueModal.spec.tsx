import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCreateVoiceQueuesHandler,
    mockCreateVoiceQueuesResponse,
} from '@gorgias/helpdesk-mocks'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import { CreateNewQueueModal } from '../CreateNewQueueModal'

jest.mock('../CreateEditQueueModalFormContent', () => ({
    CreateEditQueueModalFormContent: () => (
        <div data-testid="modal-form-content">
            CreateEditQueueModalFormContent
        </div>
    ),
}))

jest.mock('../VoiceFormSubmitButton', () => ({
    VoiceFormSubmitButton: ({ children }: any) => (
        <button type="submit">{children}</button>
    ),
}))

jest.mock('../VoiceQueueSettingsForm', () => ({
    VoiceQueueSettingsForm: ({ children, onSubmit }: any) => (
        <form
            data-testid="settings-form"
            onSubmit={(e) => {
                e.preventDefault()
                onSubmit({ name: 'Test Queue', id: 123 })
            }}
        >
            {children}
        </form>
    ),
}))

const server = setupServer()

describe('CreateNewQueueModal', () => {
    const mockOnClose = jest.fn()
    const mockOnCreateSuccess = jest.fn()

    const renderComponent = (props = {}) =>
        render(
            <CreateNewQueueModal
                isOpen={true}
                onClose={mockOnClose}
                onCreateSuccess={mockOnCreateSuccess}
                {...props}
            />,
        )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockCreateVoiceQueuesHandler(async () =>
                HttpResponse.json(
                    mockCreateVoiceQueuesResponse({
                        id: 123,
                        name: 'Test Queue',
                    }),
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
        const { user } = renderComponent()

        await user.click(screen.getByText('Create queue'))

        const toastEl = await screen.findByRole('status', {
            name: "'Test Queue' queue was successfully created.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
        await waitFor(() => {
            expect(mockOnCreateSuccess).toHaveBeenCalledWith(123)
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('handles form submission error correctly', async () => {
        server.use(
            mockCreateVoiceQueuesHandler(async () =>
                HttpResponse.json(mockCreateVoiceQueuesResponse(), {
                    status: 500,
                }),
            ).handler,
        )

        const { user } = renderComponent()

        await user.click(screen.getByText('Create queue'))

        const toastEl = await screen.findByRole('status', {
            name: "We couldn't save your preferences. Please try again.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('calls onClose when cancel button is clicked', async () => {
        const { user } = renderComponent()

        await user.click(screen.getByText('Cancel'))

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
