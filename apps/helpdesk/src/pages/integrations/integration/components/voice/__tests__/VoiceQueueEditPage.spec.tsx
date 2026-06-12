import { render } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useLocation } from 'react-router-dom'

import {
    mockGetVoiceQueueHandler,
    mockGetVoiceQueueResponse,
    mockUpdateVoiceQueueHandler,
    mockUpdateVoiceQueueResponse,
} from '@gorgias/helpdesk-mocks'

import { voiceQueue } from 'fixtures/voiceQueue'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import { VoiceQueueEditPage } from '../VoiceQueueEditPage'

jest.mock('../VoiceQueueEditOrCreateForm', () => ({
    VoiceQueueEditOrCreateForm: () => (
        <div data-testid="queue-form">VoiceQueueEditOrCreateForm</div>
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
                onSubmit({ name: 'Test Queue', id: '123' })
            }}
        >
            {children}
        </form>
    ),
}))

const mockQueue = voiceQueue
const server = setupServer()

const CurrentPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}

describe('VoiceQueueEditPage', () => {
    const renderComponent = () =>
        render(
            <>
                <VoiceQueueEditPage />
                <CurrentPath />
            </>,
            {
                initialEntries: [
                    `${PHONE_INTEGRATION_BASE_URL}/queues/${mockQueue.id}`,
                ],
                path: `${PHONE_INTEGRATION_BASE_URL}/queues/:id?`,
            },
        )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockGetVoiceQueueHandler(async () =>
                HttpResponse.json(mockGetVoiceQueueResponse(mockQueue)),
            ).handler,
            mockUpdateVoiceQueueHandler(async () =>
                HttpResponse.json(mockUpdateVoiceQueueResponse(mockQueue)),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
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

        const toastEl = await screen.findByRole('status', {
            name: `'${mockQueue.name}' queue was successfully updated.`,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
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

        await waitFor(() => {
            expect(screen.getByTestId('queue-form')).toBeInTheDocument()
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        const toastEl = await screen.findByRole('status', {
            name: "We couldn't save your preferences. Please try again.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })

    it('redirects to the queue list when GET queue fails', async () => {
        server.use(
            mockGetVoiceQueueHandler(async () =>
                HttpResponse.json(mockGetVoiceQueueResponse(), {
                    status: 500,
                }),
            ).handler,
        )

        renderComponent()

        const toastEl = await screen.findByRole('status', {
            name: 'Something went wrong while fetching the queue. Please try again.',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        await waitFor(() => {
            expect(screen.getByLabelText('Current path')).toHaveTextContent(
                `${PHONE_INTEGRATION_BASE_URL}/queues`,
            )
        })
    })
})
