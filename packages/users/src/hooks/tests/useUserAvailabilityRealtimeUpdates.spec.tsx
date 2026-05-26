import { assumeMock, renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { DomainEvent, DomainEventWithURI } from '@gorgias/events'
import {
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'
import { useListAllUserAvailabilities } from '@gorgias/helpdesk-queries'
import { useAccountId, useChannel } from '@gorgias/realtime'

import { useUserAvailabilityRealtimeUpdates } from '../useUserAvailabilityRealtimeUpdates'

vi.mock('@gorgias/realtime', () => ({
    useAccountId: vi.fn(),
    useChannel: vi.fn(),
}))

const useAccountIdMock = assumeMock(useAccountId)
const useChannelMock = assumeMock(useChannel)

const ACCOUNT_ID = 42

const server = setupServer()

let lastOnEvent: ((event: DomainEvent) => void) | undefined

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    lastOnEvent = undefined
    useAccountIdMock.mockReturnValue(ACCOUNT_ID)
    useChannelMock.mockImplementation(
        ({ onEvent }: { onEvent?: (event: DomainEvent) => void }) => {
            lastOnEvent = onEvent
            return {
                channelName: undefined,
                channelPresence: undefined,
                updatePresenceData: vi.fn(),
            }
        },
    )
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const baseEvent = {
    id: 'evt-1',
    type: 'test.event',
    source: '//gorgias/helpdesk',
    subject: 'test',
} satisfies Omit<DomainEvent, 'dataschema' | 'data'>

describe('useUserAvailabilityRealtimeUpdates', () => {
    it('subscribes to the account channel with the current account id', () => {
        renderHook(() => useUserAvailabilityRealtimeUpdates())

        expect(useChannelMock).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: { name: 'account', accountId: ACCOUNT_ID },
                onEvent: expect.any(Function),
            }),
        )
    })

    it('skips the subscription when there is no account id', () => {
        useAccountIdMock.mockReturnValue(undefined)

        renderHook(() => useUserAvailabilityRealtimeUpdates())

        expect(useChannelMock).toHaveBeenCalledWith(
            expect.objectContaining({ channel: undefined }),
        )
    })

    it('patches the matching entry on a user-availability.updated event', async () => {
        const existing = mockUserAvailability({
            user_id: 1,
            user_status: 'available',
        })
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [existing],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )
        server.use(handler)

        const { result } = renderHook(() => {
            useUserAvailabilityRealtimeUpdates()
            return useListAllUserAvailabilities(
                { limit: 100 },
                { exhaustPages: true },
            )
        })

        await waitFor(() => {
            expect(result.current.items).toHaveLength(1)
        })

        const updatedEvent: DomainEventWithURI<'//helpdesk/user-availability.updated/1.0.1'> =
            {
                ...baseEvent,
                dataschema: '//helpdesk/user-availability.updated/1.0.1',
                data: {
                    account_id: ACCOUNT_ID,
                    id: 'availability-1',
                    user_id: 1,
                    user_status: 'unavailable',
                    updated_datetime: '2026-01-01T00:00:00Z',
                    custom_user_availability_status_id: null,
                    custom_user_availability_status_expires_datetime: null,
                    next_user_status: null,
                    next_custom_user_availability_status_id: null,
                    set_by_user_id: 10,
                },
            }
        lastOnEvent?.(updatedEvent)

        await waitFor(() => {
            expect(result.current.items[0]?.user_status).toBe('unavailable')
            expect(result.current.items[0]?.set_by_user_id).toBe(10)
        })
    })

    it('inserts a new entry on a user-availability.created event when no match exists', async () => {
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [
                        mockUserAvailability({
                            user_id: 2,
                            user_status: 'available',
                        }),
                    ],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )
        server.use(handler)

        const { result } = renderHook(() => {
            useUserAvailabilityRealtimeUpdates()
            return useListAllUserAvailabilities(
                { limit: 100 },
                { exhaustPages: true },
            )
        })

        await waitFor(() => {
            expect(result.current.items).toHaveLength(1)
        })

        const createdEvent: DomainEventWithURI<'//helpdesk/user-availability.created/1.0.1'> =
            {
                ...baseEvent,
                dataschema: '//helpdesk/user-availability.created/1.0.1',
                data: {
                    account_id: ACCOUNT_ID,
                    id: 'availability-99',
                    user_id: 99,
                    user_status: 'custom',
                    updated_datetime: '2026-01-01T00:00:00Z',
                    custom_user_availability_status_id: 'lunch',
                    custom_user_availability_status_expires_datetime: null,
                    next_user_status: 'available',
                    next_custom_user_availability_status_id: null,
                    set_by_user_id: null,
                },
            }
        lastOnEvent?.(createdEvent)

        await waitFor(() => {
            const ids = result.current.items.map((item) => item.user_id)
            expect(ids).toContain(99)
        })
    })

    it('ignores unrelated domain events', async () => {
        const existing = mockUserAvailability({
            user_id: 1,
            user_status: 'available',
        })
        const { handler } = mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [existing],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: null,
                    },
                }),
            ),
        )
        server.use(handler)

        const { result } = renderHook(() => {
            useUserAvailabilityRealtimeUpdates()
            return useListAllUserAvailabilities(
                { limit: 100 },
                { exhaustPages: true },
            )
        })

        await waitFor(() => {
            expect(result.current.items).toHaveLength(1)
        })

        const unrelatedEvent: DomainEventWithURI<'//helpdesk/ui.ticket-message.created-signal/1.0.0'> =
            {
                ...baseEvent,
                dataschema: '//helpdesk/ui.ticket-message.created-signal/1.0.0',
                data: {
                    id: 1,
                    ticket_id: 1,
                    user_id: 1,
                },
            }
        lastOnEvent?.(unrelatedEvent)

        expect(result.current.items[0]?.user_status).toBe('available')
    })
})
