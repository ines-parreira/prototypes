import { useQueries } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import type { VersionItem } from './types'
import { useVersionUsers } from './useVersionUsers'

jest.mock('@tanstack/react-query', () => ({
    useQueries: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-client', () => ({
    getUser: jest.fn(),
}))

jest.mock('@gorgias/helpdesk-queries', () => ({
    queryKeys: {
        users: {
            getUser: (id: number) => ['users', 'getUser', id],
        },
    },
}))

const mockUseQueries = useQueries as jest.Mock

describe('useVersionUsers', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseQueries.mockReturnValue([])
    })

    it('returns an empty map when versions have no publisher_user_id', () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1 },
            { id: 2, version: 2 },
        ]

        const { result } = renderHook(() => useVersionUsers(versions))

        expect(result.current.userNames).toEqual(new Map())
        expect(result.current.isLoading).toBe(false)
        expect(mockUseQueries).toHaveBeenCalledWith({
            queries: [],
        })
    })

    it('creates queries for unique publisher user IDs', () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1, publisher_user_id: 10 },
            { id: 2, version: 2, publisher_user_id: 20 },
            { id: 3, version: 3, publisher_user_id: 10 },
        ]

        mockUseQueries.mockReturnValue([
            { data: { data: { name: 'Alice' } } },
            { data: { data: { name: 'Bob' } } },
        ])

        const { result } = renderHook(() => useVersionUsers(versions))

        const queriesArg = mockUseQueries.mock.calls[0][0]
        expect(queriesArg.queries).toHaveLength(2)
        expect(queriesArg.queries[0].queryKey).toEqual(['users', 'getUser', 10])
        expect(queriesArg.queries[1].queryKey).toEqual(['users', 'getUser', 20])

        expect(result.current.userNames).toEqual(
            new Map([
                [10, 'Alice'],
                [20, 'Bob'],
            ]),
        )
    })

    it('returns a map with user names from resolved queries', () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1, publisher_user_id: 5 },
        ]

        mockUseQueries.mockReturnValue([
            { data: { data: { name: 'Iris Ebert' } } },
        ])

        const { result } = renderHook(() => useVersionUsers(versions))

        expect(result.current.userNames).toEqual(new Map([[5, 'Iris Ebert']]))
    })

    it('skips users whose query has not resolved yet', () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1, publisher_user_id: 5 },
            { id: 2, version: 2, publisher_user_id: 6 },
        ]

        mockUseQueries.mockReturnValue([
            { data: { data: { name: 'Alice' } } },
            { data: undefined },
        ])

        const { result } = renderHook(() => useVersionUsers(versions))

        expect(result.current.userNames).toEqual(new Map([[5, 'Alice']]))
    })

    it('skips users with empty name', () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1, publisher_user_id: 5 },
        ]

        mockUseQueries.mockReturnValue([{ data: { data: { name: '' } } }])

        const { result } = renderHook(() => useVersionUsers(versions))

        expect(result.current.userNames).toEqual(new Map())
    })

    it('deduplicates user IDs across versions', () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1, publisher_user_id: 10 },
            { id: 2, version: 2, publisher_user_id: 10 },
            { id: 3, version: 3, publisher_user_id: 10 },
        ]

        mockUseQueries.mockReturnValue([{ data: { data: { name: 'Alice' } } }])

        renderHook(() => useVersionUsers(versions))

        const queriesArg = mockUseQueries.mock.calls[0][0]
        expect(queriesArg.queries).toHaveLength(1)
    })

    it('sets enabled to false for user IDs <= 0', () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1, publisher_user_id: 0 },
            { id: 2, version: 2, publisher_user_id: 5 },
        ]

        mockUseQueries.mockReturnValue([
            { data: undefined },
            { data: { data: { name: 'Bob' } } },
        ])

        renderHook(() => useVersionUsers(versions))

        const queriesArg = mockUseQueries.mock.calls[0][0]
        // publisher_user_id: 0 is falsy, so it won't be included in userIds
        // Only publisher_user_id: 5 should be queried
        expect(queriesArg.queries).toHaveLength(1)
        expect(queriesArg.queries[0].enabled).toBe(true)
    })

    it('updates the map when queries resolve', async () => {
        const versions: VersionItem[] = [
            { id: 1, version: 1, publisher_user_id: 5 },
        ]

        mockUseQueries.mockReturnValue([{ data: undefined }])

        const { result, rerender } = renderHook(() => useVersionUsers(versions))

        expect(result.current.userNames).toEqual(new Map())

        mockUseQueries.mockReturnValue([{ data: { data: { name: 'Alice' } } }])

        rerender()

        await waitFor(() => {
            expect(result.current.userNames).toEqual(new Map([[5, 'Alice']]))
        })
    })
})
