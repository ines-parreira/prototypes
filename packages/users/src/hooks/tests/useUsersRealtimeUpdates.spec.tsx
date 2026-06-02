import { assumeMock, renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import type { DomainEvent, DomainEventWithURI } from '@gorgias/events'
import {
    mockGetUserHandler,
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockListUsersHandler,
    mockListUsersResponse,
    mockUser,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'
import { useListAllUserAvailabilities } from '@gorgias/helpdesk-queries'
import { useAccountId, useChannel } from '@gorgias/realtime'

import { useAllUsers } from '../useAllUsers'
import { useUsersRealtimeUpdates } from '../useUsersRealtimeUpdates'

vi.mock('@gorgias/realtime', () => ({
    useAccountId: vi.fn(),
    useChannel: vi.fn(),
}))

const useAccountIdMock = assumeMock(useAccountId)
const useChannelMock = assumeMock(useChannel)

const ACCOUNT_ID = 42

type RealtimeMessage = { name?: string; data: unknown }

const server = setupServer()

let lastOnEvent: ((event: DomainEvent) => void) | undefined
let lastOnMessage: ((message: RealtimeMessage) => void) | undefined

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    lastOnEvent = undefined
    lastOnMessage = undefined
    useAccountIdMock.mockReturnValue(ACCOUNT_ID)
    useChannelMock.mockImplementation(
        ({
            onEvent,
            onMessage,
        }: {
            onEvent?: (event: DomainEvent) => void
            onMessage?: (message: RealtimeMessage) => void
        }) => {
            lastOnEvent = onEvent
            lastOnMessage = onMessage
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

const noCursorMeta = {
    prev_cursor: null,
    next_cursor: null,
    total_resources: null,
}

const baseEvent = {
    id: 'evt-1',
    type: 'test.event',
    source: '//gorgias/helpdesk',
    subject: 'test',
} satisfies Omit<DomainEvent, 'dataschema' | 'data'>

describe('useUsersRealtimeUpdates', () => {
    it('subscribes to the account channel with the current account id', () => {
        renderHook(() => useUsersRealtimeUpdates())

        expect(useChannelMock).toHaveBeenCalledWith(
            expect.objectContaining({
                channel: { name: 'account', accountId: ACCOUNT_ID },
                onEvent: expect.any(Function),
                onMessage: expect.any(Function),
            }),
        )
    })

    it('skips the subscription when there is no account id', () => {
        useAccountIdMock.mockReturnValue(undefined)

        renderHook(() => useUsersRealtimeUpdates())

        expect(useChannelMock).toHaveBeenCalledWith(
            expect.objectContaining({ channel: undefined }),
        )
    })

    describe('user lifecycle events', () => {
        it('inserts the created user into the list cache on a user.created event', async () => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [mockUser({ id: 1, name: 'Alice' })],
                            meta: noCursorMeta,
                        }),
                    ),
                ).handler,
                mockGetUserHandler(async () =>
                    HttpResponse.json(
                        mockUser({
                            id: 2,
                            name: 'Bob',
                            email: 'bob@example.com',
                        }),
                    ),
                ).handler,
            )

            const { result } = renderHook(() => {
                useUsersRealtimeUpdates()
                return useAllUsers()
            })

            await waitFor(() => {
                expect(result.current).toHaveLength(1)
            })

            lastOnMessage?.({
                name: 'user.created',
                data: {
                    id: 2,
                    account_id: ACCOUNT_ID,
                    email: 'bob@example.com',
                    name: 'Bob',
                    role: 'agent',
                },
            })

            await waitFor(() => {
                expect(result.current.map((user) => user.id)).toEqual([2, 1])
            })
        })

        it('parses a stringified payload on a user.created event', async () => {
            server.use(
                mockListUsersHandler(async () =>
                    HttpResponse.json(
                        mockListUsersResponse({
                            data: [mockUser({ id: 1 })],
                            meta: noCursorMeta,
                        }),
                    ),
                ).handler,
                mockGetUserHandler(async () =>
                    HttpResponse.json(
                        mockUser({ id: 2, email: 'bob@example.com' }),
                    ),
                ).handler,
            )

            const { result } = renderHook(() => {
                useUsersRealtimeUpdates()
                return useAllUsers()
            })

            await waitFor(() => {
                expect(result.current).toHaveLength(1)
            })

            lastOnMessage?.({
                name: 'user.created',
                data: JSON.stringify({
                    id: 2,
                    account_id: ACCOUNT_ID,
                    email: 'bob@example.com',
                    name: 'Bob',
                    role: 'agent',
                }),
            })

            await waitFor(() => {
                const ids = result.current.map((user) => user.id)
                expect(ids).toContain(2)
            })
        })

        it('does not fetch the created user when the list is not cached', async () => {
            let getUserFetchCount = 0
            const { handler } = mockGetUserHandler(async () => {
                getUserFetchCount += 1
                return HttpResponse.json(mockUser({ id: 2 }))
            })
            server.use(handler)

            renderHook(() => useUsersRealtimeUpdates())

            lastOnMessage?.({
                name: 'user.created',
                data: {
                    id: 2,
                    account_id: ACCOUNT_ID,
                    email: 'bob@example.com',
                    name: 'Bob',
                    role: 'agent',
                },
            })

            await waitFor(() => {
                expect(useChannelMock).toHaveBeenCalled()
            })
            expect(getUserFetchCount).toBe(0)
        })

        it('removes the deleted user from the list cache on a user.deleted event', async () => {
            const { handler } = mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponse({
                        data: [
                            mockUser({ id: 1, name: 'Alice' }),
                            mockUser({ id: 2, name: 'Bob' }),
                        ],
                        meta: noCursorMeta,
                    }),
                ),
            )
            server.use(handler)

            const { result } = renderHook(() => {
                useUsersRealtimeUpdates()
                return useAllUsers()
            })

            await waitFor(() => {
                expect(result.current).toHaveLength(2)
            })

            lastOnMessage?.({
                name: 'user.deleted',
                data: {
                    id: 2,
                    account_id: ACCOUNT_ID,
                    deleted_datetime: '2026-01-01T00:00:00Z',
                },
            })

            await waitFor(() => {
                expect(result.current.map((user) => user.id)).toEqual([1])
            })
        })

        it('ignores unrelated realtime messages', async () => {
            const { handler } = mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponse({
                        data: [mockUser({ id: 1, name: 'Alice' })],
                        meta: noCursorMeta,
                    }),
                ),
            )
            server.use(handler)

            const { result } = renderHook(() => {
                useUsersRealtimeUpdates()
                return useAllUsers()
            })

            await waitFor(() => {
                expect(result.current).toHaveLength(1)
            })

            lastOnMessage?.({
                name: 'some-other.event',
                data: { id: 999 },
            })

            expect(result.current.map((user) => user.id)).toEqual([1])
        })
    })

    describe('user availability events', () => {
        it('patches the matching entry on a user-availability.updated event', async () => {
            const existing = mockUserAvailability({
                user_id: 1,
                user_status: 'available',
            })
            const { handler } = mockListUserAvailabilitiesHandler(async () =>
                HttpResponse.json(
                    mockListUserAvailabilitiesResponse({
                        data: [existing],
                        meta: noCursorMeta,
                    }),
                ),
            )
            server.use(handler)

            const { result } = renderHook(() => {
                useUsersRealtimeUpdates()
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
                        meta: noCursorMeta,
                    }),
                ),
            )
            server.use(handler)

            const { result } = renderHook(() => {
                useUsersRealtimeUpdates()
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
                        meta: noCursorMeta,
                    }),
                ),
            )
            server.use(handler)

            const { result } = renderHook(() => {
                useUsersRealtimeUpdates()
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
                    dataschema:
                        '//helpdesk/ui.ticket-message.created-signal/1.0.0',
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
})
