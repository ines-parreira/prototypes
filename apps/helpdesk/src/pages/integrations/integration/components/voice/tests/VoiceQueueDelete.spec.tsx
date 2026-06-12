import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { act } from 'react-dom/test-utils'
import { useLocation } from 'react-router-dom'

import { mockDeleteVoiceQueueHandler } from '@gorgias/helpdesk-mocks'

import { voiceQueue } from 'fixtures/voiceQueue'

import { PHONE_INTEGRATION_BASE_URL } from '../constants'
import { VoiceQueueDelete } from '../VoiceQueueDelete'

const CurrentPath = () => {
    const location = useLocation()

    return <output aria-label="Current path">{location.pathname}</output>
}

const server = setupServer()

describe('VoiceQueueDelete', () => {
    const renderComponent = () => {
        return render(
            <>
                <VoiceQueueDelete queue={voiceQueue} />
                <CurrentPath />
            </>,
        )
    }

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        server.use(
            mockDeleteVoiceQueueHandler(
                async () => new HttpResponse(null, { status: 204 }),
            ).handler,
        )
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

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
        server.use(
            mockDeleteVoiceQueueHandler(
                async () => new HttpResponse(null, { status: 400 }),
            ).handler,
        )
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

        expect(
            screen
                .queryAllByRole('status')
                .filter((el) => el.hasAttribute('data-intent')),
        ).toEqual([])

        await waitFor(() => {
            expect(
                screen.getByText('Queue cannot be deleted'),
            ).toBeInTheDocument()
        })
    })

    it('delete api call general error', async () => {
        server.use(
            mockDeleteVoiceQueueHandler(
                async () => new HttpResponse(null, { status: 500 }),
            ).handler,
        )
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

        const toastEl = await screen.findByRole('status', {
            name: "We couldn't delete the queue. Please try again.",
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')

        expect(screen.queryByText('Queue cannot be deleted')).toBeNull()

        await waitFor(() => {
            expect(screen.queryByText('Delete call queue?')).toBeNull()
        })
    })

    it('delete api call success', async () => {
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

        const toastEl = await screen.findByRole('status', {
            name: `${voiceQueue.name} queue was successfully deleted`,
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')

        expect(screen.getByLabelText('Current path')).toHaveTextContent(
            `${PHONE_INTEGRATION_BASE_URL}/queues`,
        )
    })
})
