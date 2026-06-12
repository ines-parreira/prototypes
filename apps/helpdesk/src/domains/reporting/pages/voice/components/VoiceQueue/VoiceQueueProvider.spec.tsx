import { useContext } from 'react'

import { render } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockListVoiceQueuesHandler,
    mockListVoiceQueuesResponse,
    mockVoiceQueue,
} from '@gorgias/helpdesk-mocks'

import { VoiceQueueContext } from 'domains/reporting/pages/voice/components/VoiceQueue/VoiceQueueContext'
import { VoiceQueueProvider } from 'domains/reporting/pages/voice/components/VoiceQueue/VoiceQueueProvider'

const server = setupServer()

const getRequestedQueueIds = (request: Request) =>
    Array.from(new URL(request.url).searchParams.entries())
        .filter(([key]) => key === 'id' || key.startsWith('id['))
        .flatMap(([, value]) => value.split(','))
        .filter(Boolean)
        .map(Number)

describe('VoiceQueueProvider', () => {
    const mockVoiceQueues = [
        mockVoiceQueue({ id: 1, name: 'Queue 1' }),
        mockVoiceQueue({ id: 2, name: 'Queue 2' }),
    ]

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should fetch and provide voice queues', async () => {
        const listVoiceQueuesMock = mockListVoiceQueuesHandler(
            async ({ request }) =>
                HttpResponse.json(
                    mockListVoiceQueuesResponse({
                        data: mockVoiceQueues.filter((queue) =>
                            getRequestedQueueIds(request).includes(queue.id),
                        ),
                    }),
                ),
        )
        const waitForListVoiceQueuesRequest =
            listVoiceQueuesMock.waitForRequest(server)
        server.use(listVoiceQueuesMock.handler)

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        render(
            <VoiceQueueProvider queueIds={[1, 2]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(1)).toEqual(mockVoiceQueues[0])
            expect(contextValue.getQueueFromId(2)).toEqual(mockVoiceQueues[1])
        })
        await waitForListVoiceQueuesRequest((request) => {
            expect(getRequestedQueueIds(request)).toEqual([1, 2])
        })
    })

    it('should return undefined for a queue ID if not ready', () => {
        server.use(
            mockListVoiceQueuesHandler(async () => {
                await new Promise(() => undefined)

                return HttpResponse.json(
                    mockListVoiceQueuesResponse({ data: [] }),
                )
            }).handler,
        )

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        render(
            <VoiceQueueProvider queueIds={[1]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        expect(contextValue.getQueueFromId(1)).toBeUndefined()
    })

    it('should return null for a queue ID if ready but queue not found', async () => {
        const listVoiceQueuesMock = mockListVoiceQueuesHandler(async () =>
            HttpResponse.json(mockListVoiceQueuesResponse({ data: [] })),
        )
        const waitForListVoiceQueuesRequest =
            listVoiceQueuesMock.waitForRequest(server)
        server.use(listVoiceQueuesMock.handler)

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        render(
            <VoiceQueueProvider queueIds={[3]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(3)).toBeNull()
        })
        await waitForListVoiceQueuesRequest((request) => {
            expect(getRequestedQueueIds(request)).toEqual([3])
        })
    })

    it('should fetch and provide only voice queues for which we do not yet have data', async () => {
        const requestedQueueIds: number[][] = []
        server.use(
            mockListVoiceQueuesHandler(async ({ request }) => {
                const queueIds = getRequestedQueueIds(request)
                requestedQueueIds.push(queueIds)

                return HttpResponse.json(
                    mockListVoiceQueuesResponse({
                        data: mockVoiceQueues.filter((queue) =>
                            queueIds.includes(queue.id),
                        ),
                    }),
                )
            }).handler,
        )

        let contextValue: any
        const TestComponent = () => {
            contextValue = useContext(VoiceQueueContext)
            return null
        }

        const { rerender } = render(
            <VoiceQueueProvider queueIds={[1]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(1)).toEqual(mockVoiceQueues[0])
            expect(contextValue.getQueueFromId(2)).toEqual(null)
        })
        expect(requestedQueueIds).toEqual([[1]])

        rerender(
            <VoiceQueueProvider queueIds={[1, 2]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(contextValue.getQueueFromId(2)).toEqual(mockVoiceQueues[1])
        })
        expect(requestedQueueIds).toEqual([[1], [2]])

        rerender(
            <VoiceQueueProvider queueIds={[1, 2]}>
                <TestComponent />
            </VoiceQueueProvider>,
        )

        await waitFor(() => {
            expect(requestedQueueIds).toEqual([[1], [2]])
        })
    })
})
