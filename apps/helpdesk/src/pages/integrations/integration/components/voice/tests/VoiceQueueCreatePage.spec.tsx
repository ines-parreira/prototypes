import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
import fireEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { useLocation } from 'react-router-dom'

import {
    mockCreateVoiceQueuesHandler,
    mockCreateVoiceQueuesResponse,
} from '@gorgias/helpdesk-mocks'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import { VoiceQueueCreatePage } from '../VoiceQueueCreatePage'

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

const CurrentPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}

const server = setupServer()

describe('VoiceQueueCreatePage', () => {
    const renderComponent = () =>
        render(
            <>
                <VoiceQueueCreatePage />
                <CurrentPath />
            </>,
        )

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockCreateVoiceQueuesHandler(async () =>
                HttpResponse.json(
                    mockCreateVoiceQueuesResponse({
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

    it('renders the create queue form with all necessary components', () => {
        renderComponent()

        expect(screen.getByTestId('queue-form')).toBeInTheDocument()
        expect(screen.getByTestId('settings-form')).toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('handles form submission success correctly', async () => {
        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        const toastEl = await screen.findByRole('status', {
            name: "'Test Queue' queue was successfully created.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })

    it('handles form submission error correctly', async () => {
        server.use(
            mockCreateVoiceQueuesHandler(async () =>
                HttpResponse.json(mockCreateVoiceQueuesResponse(), {
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

    it('navigates to queue list on cancel', async () => {
        renderComponent()

        expect(screen.getByText('Cancel').closest('a')).toHaveAttribute(
            'href',
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })
})
