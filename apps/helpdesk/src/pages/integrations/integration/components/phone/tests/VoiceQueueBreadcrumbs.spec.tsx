import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetVoiceQueueHandler,
    mockGetVoiceQueueResponse,
} from '@gorgias/helpdesk-mocks'
import { VoiceQueueStatus } from '@gorgias/helpdesk-types'

import { VoiceQueueBreadcrumbs } from '../VoiceQueueBreadcrumbs'

const getVoiceQueueRequests: Request[] = []
const server = setupServer()

describe('<VoiceQueueBreadcrumbs />', () => {
    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    beforeEach(() => {
        getVoiceQueueRequests.length = 0
        server.use(
            mockGetVoiceQueueHandler(async ({ request }) => {
                getVoiceQueueRequests.push(request)

                return HttpResponse.json(
                    mockGetVoiceQueueResponse({
                        name: 'Test Queue',
                        status: VoiceQueueStatus.Enabled,
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

    it('should render Voice link for all cases', () => {
        render(<VoiceQueueBreadcrumbs queueId="123" />)
        expect(screen.getByText('Voice')).toBeInTheDocument()
    })

    it('should render Add call queue for new queue', () => {
        render(<VoiceQueueBreadcrumbs queueId="new" />)
        expect(screen.getByText('Add call queue')).toBeInTheDocument()
        expect(screen.queryByText('Edit queue')).not.toBeInTheDocument()
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('should render queue name and status toggle when queue data is available', async () => {
        render(<VoiceQueueBreadcrumbs queueId="123" />)
        await waitFor(() => {
            expect(screen.getByText('Test Queue')).toBeInTheDocument()
            expect(screen.getByRole('switch')).toBeChecked()
        })
    })

    it('should render Edit queue and not render status toggle when queue data is not available', () => {
        server.use(
            mockGetVoiceQueueHandler(async () =>
                HttpResponse.json(mockGetVoiceQueueResponse(), {
                    status: 500,
                }),
            ).handler,
        )

        render(<VoiceQueueBreadcrumbs queueId="123" />)
        expect(screen.getByText('Edit queue')).toBeInTheDocument()
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('should not fetch queue data or render status toggle when queueId is not a number', () => {
        render(<VoiceQueueBreadcrumbs queueId="abc" />)
        expect(getVoiceQueueRequests).toHaveLength(0)
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })

    it('should not fetch queue data or render status toggle when queueId is new', () => {
        render(<VoiceQueueBreadcrumbs queueId="new" />)
        expect(getVoiceQueueRequests).toHaveLength(0)
        expect(screen.queryByRole('switch')).not.toBeInTheDocument()
    })
})
