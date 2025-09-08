import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { useListUsers } from '@gorgias/helpdesk-queries'
import {
    ListUsersOrderBy,
    ListUsersRelationshipsItem,
} from '@gorgias/helpdesk-types'

import { logEvent, SegmentEvent } from 'common/segment'
import { UserRole } from 'config/types/user'
import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'
import { UserSortableProperties } from 'models/user/types'
import { AI_AGENT_CLIENT_ID } from 'state/agents/constants'

import { STALE_TIME_MS, USERS_PER_PAGE, useUserList } from '../useUserList'

jest.mock('@gorgias/helpdesk-queries')
const mockedUseListUsers = jest.mocked(useListUsers)

jest.mock('common/segment', () => {
    const segmentTracker: Record<string, unknown> =
        jest.requireActual('common/segment')

    return {
        ...segmentTracker,
        logEvent: jest.fn(),
    }
})

describe('useUserList', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should initialize with default params', () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

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
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        renderHook(() => useUserList())

        await waitFor(() => {
            expect(mockedUseListUsers).toHaveBeenCalledWith(
                {
                    order_by: ListUsersOrderBy.NameAsc,
                    relationships: [
                        ListUsersRelationshipsItem.AvailabilityStatus,
                    ],
                    limit: USERS_PER_PAGE,
                    cursor: undefined,
                },
                {
                    query: {
                        staleTime: STALE_TIME_MS,
                        keepPreviousData: true,
                        select: expect.any(Function),
                    },
                },
            )
        })
    })

    it('should provide users property', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(result.current).toHaveProperty('users')
        })
    })

    it('should provide pagination functions and state', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(result.current).toHaveProperty('hasPrevItems')
            expect(result.current).toHaveProperty('hasNextItems')
            expect(typeof result.current.fetchPrevItems).toBe('function')
            expect(typeof result.current.fetchNextItems).toBe('function')
        })
    })

    it('should provide ordering function', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(typeof result.current.setOrderBy).toBe('function')
        })
    })

    it('should track ordering usage', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

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
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result } = renderHook(() => useUserList())
        await waitFor(() => {
            expect(typeof result.current.setSearch).toBe('function')
        })
    })

    it('should track sorting usage', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

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
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useListUsers>)

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

        // Mock the select function to test the filtering logic
        let selectFunction: any
        mockedUseListUsers.mockImplementation((params, options) => {
            selectFunction = options?.query?.select
            // Return data after applying the select function
            const rawData = {
                data: {
                    data: [regularUser, botUser, aiAgentUser],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                },
            }
            return {
                data: selectFunction ? selectFunction(rawData) : rawData,
                isLoading: false,
                isError: false,
            } as unknown as ReturnType<typeof useListUsers>
        })

        const { result } = renderHook(() => useUserList())

        await waitFor(() => {
            // Should filter out regular bot but keep AI agent and regular user
            expect(result.current.users).toHaveLength(2)
            expect(result.current.users).toContainEqual(regularUser)
            expect(result.current.users).toContainEqual(aiAgentUser)
            expect(result.current.users).not.toContainEqual(botUser)
        })
    })

    it('should update params when fetchNextItems is called', async () => {
        const nextCursor = 'next-cursor'

        // Mock the select function behavior
        let selectFunction: any
        mockedUseListUsers.mockImplementation((params, options) => {
            selectFunction = options?.query?.select
            const rawData = {
                data: {
                    data: agents,
                    meta: {
                        prev_cursor: null,
                        next_cursor: nextCursor,
                    },
                },
            }
            return {
                data: selectFunction ? selectFunction(rawData) : rawData,
                isLoading: false,
                isError: false,
            } as unknown as ReturnType<typeof useListUsers>
        })

        const { result } = renderHook(() => useUserList())

        // Wait for initial render
        await waitFor(() => {
            expect(result.current.hasNextItems).toBe(true)
        })

        act(() => {
            result.current.fetchNextItems()
        })

        await waitFor(() => {
            // Check that useListUsers was called with the next cursor
            expect(mockedUseListUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    cursor: nextCursor,
                }),
                expect.any(Object),
            )
        })
    })

    it('should update params when fetchPrevItems is called', async () => {
        const prevCursor = 'prev-cursor'

        // Mock the select function behavior
        let selectFunction: any
        mockedUseListUsers.mockImplementation((params, options) => {
            selectFunction = options?.query?.select
            const rawData = {
                data: {
                    data: agents,
                    meta: {
                        prev_cursor: prevCursor,
                        next_cursor: null,
                    },
                },
            }
            return {
                data: selectFunction ? selectFunction(rawData) : rawData,
                isLoading: false,
                isError: false,
            } as unknown as ReturnType<typeof useListUsers>
        })

        const { result } = renderHook(() => useUserList())

        // Wait for initial render
        await waitFor(() => {
            expect(result.current.hasPrevItems).toBe(true)
        })

        act(() => {
            result.current.fetchPrevItems()
        })

        await waitFor(() => {
            // Check that useListUsers was called with the prev cursor
            expect(mockedUseListUsers).toHaveBeenCalledWith(
                expect.objectContaining({
                    cursor: prevCursor,
                }),
                expect.any(Object),
            )
        })
    })

    it('should reset cursor when setOrderBy is called', async () => {
        mockedUseListUsers.mockReturnValue({
            data: {
                data: {
                    data: agents,
                    meta: {
                        prev_cursor: 'prev',
                        next_cursor: 'next',
                    },
                },
            },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result, rerender } = renderHook(() => useUserList())

        act(() => {
            result.current.setOrderBy(
                UserSortableProperties.Email,
                OrderDirection.Desc,
            )
        })

        rerender()

        await waitFor(() => {
            expect(mockedUseListUsers).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    order_by: `${UserSortableProperties.Email}:${OrderDirection.Desc}`,
                    cursor: undefined,
                }),
                expect.any(Object),
            )
        })
    })

    it('should reset cursor when setSearch is called', async () => {
        mockedUseListUsers.mockReturnValue({
            data: {
                data: {
                    data: agents,
                    meta: {
                        prev_cursor: 'prev',
                        next_cursor: 'next',
                    },
                },
            },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result, rerender } = renderHook(() => useUserList())

        act(() => {
            result.current.setSearch('test search')
        })

        rerender()

        await waitFor(() => {
            expect(mockedUseListUsers).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    search: 'test search',
                    cursor: undefined,
                }),
                expect.any(Object),
            )
        })
    })
})
