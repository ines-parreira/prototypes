import { logEvent, SegmentEvent } from '@repo/logging'
import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { mockListUsersHandler } from '@gorgias/helpdesk-mocks'
import {
    ListUsersOrderBy,
    ListUsersRelationshipsItem,
} from '@gorgias/helpdesk-types'

import { UserRole } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import { AI_AGENT_CLIENT_ID } from 'state/agents/constants'

import { USERS_PER_PAGE, useUserList } from '../useUserList'

jest.mock('@repo/logging', () => {
    const segmentTracker: Record<string, unknown> =
        jest.requireActual('@repo/logging')

    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

const server = setupServer()

const mockListUsersResponseBody = (
    data = agents,
    meta: { prev_cursor: string | null; next_cursor: string | null } = {
        prev_cursor: null,
        next_cursor: null,
    },
) =>
    ({
        data,
        meta,
    }) as any

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useUserList', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json(mockListUsersResponseBody()),
            ).handler,
        )
    })

    it('should initialize with default params', () => {
        server.use(
            mockListUsersHandler(async () => new Promise(() => undefined))
                .handler,
        )

        const { result } = renderHook(() => useUserList())

        expect(result.current.params).toEqual({
            order_by: ListUsersOrderBy.NameAsc,
        })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(false)
        expect(result.current.users).toEqual([])
        expect(result.current.hasPrevItems).toBe(false)
        expect(result.current.hasNextItems).toBe(false)
    })

    it('should call useListUsers with correct parameters', async () => {
        const listUsersMock = mockListUsersHandler()
        server.use(listUsersMock.handler)
        const waitForListUsersRequest = listUsersMock.waitForRequest(server)

        renderHook(() => useUserList())

        await waitForListUsersRequest((request) => {
            const url = new URL(request.url)
            expect(url.searchParams.get('order_by')).toBe(
                ListUsersOrderBy.NameAsc,
            )
            expect(url.searchParams.get('limit')).toBe(String(USERS_PER_PAGE))
            expect(url.searchParams.get('cursor')).toBeNull()
            expect(request.url).toContain(
                ListUsersRelationshipsItem.AvailabilityStatus,
            )
        })
    })

    it('should provide users property', async () => {
        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(result.current).toHaveProperty('users')
        })
    })

    it('should provide pagination functions and state', async () => {
        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(result.current).toHaveProperty('hasPrevItems')
            expect(result.current).toHaveProperty('hasNextItems')
            expect(typeof result.current.fetchPrevItems).toBe('function')
            expect(typeof result.current.fetchNextItems).toBe('function')
        })
    })

    it('should provide ordering function', async () => {
        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(typeof result.current.setOrderBy).toBe('function')
        })
    })

    it('should track ordering usage', async () => {
        const { result } = renderHook(() => useUserList())

        act(() => {
            result.current.setOrderBy(
                UserSortableProperties.Email,
                OrderDirection.Asc,
            )
        })
        await waitFor(() => {
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.SettingsUsersSort,
                {
                    orderBy: UserSortableProperties.Email,
                    orderDir: OrderDirection.Asc,
                },
            )
        })
    })

    it('should provide search function', async () => {
        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(typeof result.current.setSearch).toBe('function')
        })
    })

    it('should track sorting usage', async () => {
        const { result } = renderHook(() => useUserList())

        act(() => {
            result.current.setSearch('foo')
        })
        await waitFor(() => {
            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.SettingsUsersSearch,
            )
        })
    })

    it('should handle error state', async () => {
        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json({ error: { msg: 'Failed' } } as any, {
                    status: 500,
                }),
            ).handler,
        )

        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(result.current.isError).toBe(true)
        })
    })

    it('should filter out bot users except AI agents', async () => {
        const botUser = {
            ...agents[1],
            role: { name: UserRole.Bot },
            client_id: 'regular-bot',
        }
        const aiAgentUser = {
            ...agents[2],
            role: { name: UserRole.Bot },
            client_id: AI_AGENT_CLIENT_ID,
        }
        const regularUser = agents[0]

        server.use(
            mockListUsersHandler(async () =>
                HttpResponse.json(
                    mockListUsersResponseBody([
                        regularUser,
                        botUser,
                        aiAgentUser,
                    ]),
                ),
            ).handler,
        )

        const { result } = renderHook(() => useUserList())

        await waitFor(() => {
            expect(result.current.users).toHaveLength(2)
            expect(result.current.users).toContainEqual(regularUser)
            expect(result.current.users).toContainEqual(aiAgentUser)
            expect(result.current.users).not.toContainEqual(botUser)
        })
    })

    it('should update params when fetchNextItems is called', async () => {
        const nextCursor = 'next-cursor'
        const requestedUrls: string[] = []

        server.use(
            mockListUsersHandler(async ({ request }) => {
                requestedUrls.push(request.url)
                return HttpResponse.json(
                    mockListUsersResponseBody(agents, {
                        prev_cursor: null,
                        next_cursor: nextCursor,
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() => useUserList())

        await waitFor(() => {
            expect(result.current.hasNextItems).toBe(true)
        })

        act(() => {
            result.current.fetchNextItems()
        })

        await waitFor(() => {
            expect(
                requestedUrls.some(
                    (url) =>
                        new URL(url).searchParams.get('cursor') === nextCursor,
                ),
            ).toBe(true)
        })
    })

    it('should update params when fetchPrevItems is called', async () => {
        const prevCursor = 'prev-cursor'
        const requestedUrls: string[] = []

        server.use(
            mockListUsersHandler(async ({ request }) => {
                requestedUrls.push(request.url)
                return HttpResponse.json(
                    mockListUsersResponseBody(agents, {
                        prev_cursor: prevCursor,
                        next_cursor: null,
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() => useUserList())

        await waitFor(() => {
            expect(result.current.hasPrevItems).toBe(true)
        })

        act(() => {
            result.current.fetchPrevItems()
        })

        await waitFor(() => {
            expect(
                requestedUrls.some(
                    (url) =>
                        new URL(url).searchParams.get('cursor') === prevCursor,
                ),
            ).toBe(true)
        })
    })

    it('should reset cursor when setOrderBy is called', async () => {
        const nextCursor = 'next-cursor'
        const requestedUrls: string[] = []

        server.use(
            mockListUsersHandler(async ({ request }) => {
                requestedUrls.push(request.url)
                return HttpResponse.json(
                    mockListUsersResponseBody(agents, {
                        prev_cursor: null,
                        next_cursor: nextCursor,
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() => useUserList())

        await waitFor(() => {
            expect(result.current.hasNextItems).toBe(true)
        })

        act(() => {
            result.current.fetchNextItems()
        })

        await waitFor(() => {
            expect(
                requestedUrls.some(
                    (url) =>
                        new URL(url).searchParams.get('cursor') === nextCursor,
                ),
            ).toBe(true)
        })

        act(() => {
            result.current.setOrderBy(
                UserSortableProperties.Email,
                OrderDirection.Desc,
            )
        })

        await waitFor(() => {
            expect(
                requestedUrls.some((url) => {
                    const searchParams = new URL(url).searchParams
                    return (
                        searchParams.get('order_by') ===
                            `${UserSortableProperties.Email}:${OrderDirection.Desc}` &&
                        searchParams.get('cursor') === null
                    )
                }),
            ).toBe(true)
        })
    })

    it('should reset cursor when setSearch is called', async () => {
        const nextCursor = 'next-cursor'
        const requestedUrls: string[] = []

        server.use(
            mockListUsersHandler(async ({ request }) => {
                requestedUrls.push(request.url)
                return HttpResponse.json(
                    mockListUsersResponseBody(agents, {
                        prev_cursor: null,
                        next_cursor: nextCursor,
                    }),
                )
            }).handler,
        )

        const { result } = renderHook(() => useUserList())

        await waitFor(() => {
            expect(result.current.hasNextItems).toBe(true)
        })

        act(() => {
            result.current.fetchNextItems()
        })

        await waitFor(() => {
            expect(
                requestedUrls.some(
                    (url) =>
                        new URL(url).searchParams.get('cursor') === nextCursor,
                ),
            ).toBe(true)
        })

        act(() => {
            result.current.setSearch('test search')
        })

        await waitFor(() => {
            expect(
                requestedUrls.some((url) => {
                    const searchParams = new URL(url).searchParams
                    return (
                        searchParams.get('search') === 'test search' &&
                        searchParams.get('cursor') === null
                    )
                }),
            ).toBe(true)
        })
    })
})
