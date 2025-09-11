import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetVoiceQueueHandler,
    mockVoiceQueue,
} from '@gorgias/helpdesk-mocks'
import { VoiceQueue } from '@gorgias/helpdesk-types'

import { VoiceCallQueueLabel } from './VoiceCallQueueLabel'

const server = setupServer()
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
})

beforeAll(() => {
    server.listen()
})

afterEach(() => {
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

const renderComponent = (queueId: number) => {
    return render(
        <QueryClientProvider client={queryClient}>
            <VoiceCallQueueLabel queueId={queueId} />
        </QueryClientProvider>,
    )
}

describe('VoiceCallQueueLabel', () => {
    it('should display queue name when data loads successfully', async () => {
        const mockQueue = mockVoiceQueue()
        const mockGetVoiceQueue = mockGetVoiceQueueHandler()
        server.use(mockGetVoiceQueue.handler)

        renderComponent(mockQueue.id)

        await waitFor(() => {
            expect(screen.getByText(mockQueue.name)).toBeInTheDocument()
        })
    })

    it('should display loading skeleton while fetching data', () => {
        const { container } = renderComponent(1)

        const skeleton = container.querySelector('.react-loading-skeleton')
        expect(skeleton).toBeInTheDocument()
    })

    it('should display fallback when queue data is not found', async () => {
        const mockGetVoiceQueue = mockGetVoiceQueueHandler(async () => {
            return HttpResponse.json(
                { error: { msg: 'Server error' } } as unknown as VoiceQueue,
                { status: 404 },
            )
        })
        server.use(mockGetVoiceQueue.handler)

        renderComponent(42)

        await waitFor(() => {
            expect(screen.getByText('Queue 42')).toBeInTheDocument()
        })
    })
})
