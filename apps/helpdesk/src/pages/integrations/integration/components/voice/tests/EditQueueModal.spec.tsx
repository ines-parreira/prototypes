import { render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import fireEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockUpdateVoiceQueueHandler,
    mockUpdateVoiceQueueResponse,
} from '@gorgias/helpdesk-mocks'
import type { VoiceQueue } from '@gorgias/helpdesk-queries'

import { voiceQueue } from 'fixtures/voiceQueue'

import { EditQueueModal } from '../EditQueueModal'

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
                onSubmit({ name: 'Updated Queue', id: '123' })
            }}
        >
            {children}
        </form>
    ),
}))

const updateVoiceQueueRequests: Request[] = []
const server = setupServer()

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
        render(
            <EditQueueModal
                isOpen={true}
                onClose={mockOnClose}
                onUpdateSuccess={mockOnUpdateSuccess}
                queue={mockQueue}
                {...props}
            />,
        )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        jest.clearAllMocks()
        updateVoiceQueueRequests.length = 0
        server.use(
            mockUpdateVoiceQueueHandler(async ({ request }) => {
                updateVoiceQueueRequests.push(request)

                return HttpResponse.json(
                    mockUpdateVoiceQueueResponse({
                        ...mockQueue,
                        name: 'Updated Queue',
                    }),
                )
            }).handler,
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
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        await waitFor(() => {
            expect(updateVoiceQueueRequests).toHaveLength(1)
        })
        await expect(updateVoiceQueueRequests[0].json()).resolves.toEqual({
            name: 'Updated Queue',
            id: '123',
        })
        const toastEl = await screen.findByRole('status', {
            name: "'Updated Queue' queue was successfully updated.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
        await waitFor(() => {
            expect(mockOnUpdateSuccess).toHaveBeenCalled()
            expect(mockOnClose).toHaveBeenCalled()
        })
    })

    it('handles form submission error correctly', async () => {
        server.use(
            mockUpdateVoiceQueueHandler(async () =>
                HttpResponse.json(mockUpdateVoiceQueueResponse(), {
                    status: 500,
                }),
            ).handler,
        )

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        const toastEl = await screen.findByRole('status', {
            name: "We couldn't save your preferences. Please try again.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
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

        expect(
            screen.queryByText(`Edit ${mockQueue.name}`),
        ).not.toBeInTheDocument()
    })
})
