import { renderHook } from '@testing-library/react-hooks'
import axios from 'axios'

import { listUsers } from '@gorgias/api-client'
import { useListUsers } from '@gorgias/api-queries'
import {
    ListUsersOrderBy,
    ListUsersRelationshipsItem,
} from '@gorgias/api-types'

import { UserRole } from 'config/types/user'
import { agents } from 'fixtures/agents'

import { STALE_TIME_MS, USERS_PER_PAGE, useUserList } from '../useUserList'

jest.mock('@gorgias/api-queries')
jest.mock('@gorgias/api-client')
const mockedUseListUsers = jest.mocked(useListUsers)
const mockedListUsers = jest.mocked(listUsers)

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

        const { waitForNextUpdate } = renderHook(() => useUserList())
        await waitForNextUpdate()

        expect(mockedUseListUsers).toHaveBeenCalledWith(
            {
                order_by: ListUsersOrderBy.NameAsc,
                relationships: [ListUsersRelationshipsItem.AvailabilityStatus],
                limit: USERS_PER_PAGE,
                cursor: undefined,
            },
            {
                query: { staleTime: STALE_TIME_MS, keepPreviousData: true },
            },
        )
    })

    it('should provide users property', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result, waitForNextUpdate } = renderHook(() => useUserList())
        await waitForNextUpdate()

        expect(result.current).toHaveProperty('users')
    })

    it('should provide pagination functions and state', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result, waitForNextUpdate } = renderHook(() => useUserList())
        await waitForNextUpdate()

        expect(result.current).toHaveProperty('hasPrevItems')
        expect(result.current).toHaveProperty('hasNextItems')
        expect(typeof result.current.fetchPrevItems).toBe('function')
        expect(typeof result.current.fetchNextItems).toBe('function')
    })

    it('should provide ordering function', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result, waitForNextUpdate } = renderHook(() => useUserList())
        await waitForNextUpdate()

        expect(typeof result.current.setOrderBy).toBe('function')
    })

    it('should provide search function', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result, waitForNextUpdate } = renderHook(() => useUserList())
        await waitForNextUpdate()

        expect(typeof result.current.setSearch).toBe('function')
    })

    it('should handle error state', async () => {
        mockedUseListUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as unknown as ReturnType<typeof useListUsers>)

        const { result, waitForNextUpdate } = renderHook(() => useUserList())
        await waitForNextUpdate()

        expect(result.current.isError).toBe(true)
    })

    it('should call listUsers once when we filter out users from page 1, but still have next cursor', async () => {
        const botUser = { ...agents[1] }
        botUser.role.name = UserRole.Bot

        mockedUseListUsers.mockReturnValue({
            data: {
                data: {
                    data: [agents[0], botUser], // Bot user will be filtered out
                    meta: {
                        prev_cursor: null,
                        next_cursor: 'next-cursor', // But we still have next cursor
                    },
                },
            },
            isLoading: false,
            isError: false,
        } as unknown as ReturnType<typeof useListUsers>)

        const { waitForNextUpdate } = renderHook(() => useUserList())
        await waitForNextUpdate()

        expect(mockedListUsers).toHaveBeenNthCalledWith(
            1,
            {
                order_by: ListUsersOrderBy.NameAsc,
                cursor: 'next-cursor',
                limit: USERS_PER_PAGE - 1,
            },
            { cancelToken: expect.any(axios.CancelToken) },
        )
    })
})
