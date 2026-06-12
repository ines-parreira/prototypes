import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListLiveCallQueueAgentsHandler,
    mockListLiveCallQueueAgentsResponse,
    mockLiveCallQueueAgent,
} from '@gorgias/helpdesk-mocks'

import { LiveVoiceAgentsSection } from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsSection'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('hooks/useAppSelector', () => ({
    useAppSelector: (fn: () => void) => fn(),
}))

jest.mock(
    'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceAgentsList',
    () => ({ LiveVoiceAgentsList: () => <div>LiveVoiceAgentsList</div> }),
)

const server = setupServer()
let queryClient = mockQueryClient()

const params = {
    agent_ids: [1, 2],
    integration_ids: [3, 4],
    voice_queue_ids: [5, 6],
}

const renderComponent = (props = { params }) => {
    queryClient = mockQueryClient()

    return render(
        <QueryClientProvider client={queryClient}>
            <LiveVoiceAgentsSection {...props} />
        </QueryClientProvider>,
    )
}

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    cleanup()
    server.resetHandlers()
    queryClient.clear()
})

afterAll(() => {
    server.close()
})

describe('LiveVoiceAgentsSection', () => {
    it('should display loading state', () => {
        server.use(
            mockListLiveCallQueueAgentsHandler(async () => {
                await new Promise(() => undefined)

                return HttpResponse.json(
                    mockListLiveCallQueueAgentsResponse({ data: [] }),
                )
            }).handler,
        )

        renderComponent()

        expect(screen.getAllByLabelText('Loading').length).toBeGreaterThan(0)
        expect(
            screen.queryByText('LiveVoiceAgentsList'),
        ).not.toBeInTheDocument()
    })

    it('should display agents list', async () => {
        server.use(
            mockListLiveCallQueueAgentsHandler(async () =>
                HttpResponse.json(
                    mockListLiveCallQueueAgentsResponse({
                        data: [
                            mockLiveCallQueueAgent({ id: 1, name: 'Agent 1' }),
                        ],
                    }),
                ),
            ).handler,
        )

        renderComponent()

        expect(
            await screen.findByText('LiveVoiceAgentsList'),
        ).toBeInTheDocument()
    })

    it('should display no data available and refetch on retry', async () => {
        const requests: Request[] = []
        server.use(
            mockListLiveCallQueueAgentsHandler(async ({ request }) => {
                requests.push(request)

                return HttpResponse.json(
                    mockListLiveCallQueueAgentsResponse({ data: [] }),
                )
            }).handler,
        )

        renderComponent()

        expect(await screen.findByText('No data available')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

        await waitFor(() => expect(requests.length).toBeGreaterThan(1))
    })

    it('should pass correct filters to useListLiveCallQueueAgents', async () => {
        const listAgentsMock = mockListLiveCallQueueAgentsHandler(async () =>
            HttpResponse.json(
                mockListLiveCallQueueAgentsResponse({ data: [] }),
            ),
        )
        const waitForListAgentsRequest = listAgentsMock.waitForRequest(server)
        server.use(listAgentsMock.handler)

        renderComponent()

        await waitForListAgentsRequest((request) => {
            const searchParams = new URL(request.url).searchParams

            expect(searchParams.getAll('agent_ids')).toEqual(['1', '2'])
            expect(searchParams.getAll('integration_ids')).toEqual(['3', '4'])
            expect(searchParams.getAll('voice_queue_ids')).toEqual(['5', '6'])
        })
    })
})
