import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockListUsersHandler,
    mockTicketUser,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { renderHook, testAppQueryClient } from '../../../../tests/render.utils'
import { NO_USER_OPTION, useUserOptions } from '../useUserOptions'

const currentUser = mockUser({
    id: 1,
    name: 'Current User',
    email: 'current@example.com',
})
const user2 = mockUser({ id: 2, name: 'Jane Smith', email: 'jane@example.com' })
const user3 = mockUser({ id: 3, name: 'Bob Johnson', email: 'bob@example.com' })

const mockGetCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(currentUser),
)

const mockListUsers = mockListUsersHandler(async ({ data }) =>
    HttpResponse.json({
        ...data,
        data: [currentUser, user2, user3],
        meta: {
            prev_cursor: null,
            next_cursor: null,
        },
    }),
)

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockGetCurrentUser.handler, mockListUsers.handler)
    testAppQueryClient.clear()
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useUserOptions', () => {
    it('should return user sections with "Assign yourself" and "Assign to others" when no user is assigned', async () => {
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.userSections).toHaveLength(2)
        expect(result.current.userSections[0].id).toBe('self')
        expect(result.current.userSections[0].items).toEqual([
            { id: 1, label: 'Assign yourself' },
        ])
        expect(result.current.userSections[1].id).toBe('others')
        expect(result.current.userSections[1].items).toEqual([
            { id: 2, label: 'Jane Smith' },
            { id: 3, label: 'Bob Johnson' },
        ])
        expect(result.current.selectedOption).toEqual(NO_USER_OPTION)
    })

    it('should include "Unassigned" section when a user is assigned', async () => {
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: mockTicketUser(user2) }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.userSections).toHaveLength(3)
        expect(result.current.userSections[0].id).toBe('unassigned')
        expect(result.current.userSections[0].items).toEqual([NO_USER_OPTION])
        expect(result.current.userSections[1].id).toBe('self')
        expect(result.current.userSections[2].id).toBe('others')
        expect(result.current.selectedOption).toEqual({
            id: 2,
            label: 'Jane Smith',
        })
    })

    it('should exclude other users sections when searching', async () => {
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        act(() => {
            result.current.setSearch('jane')
        })

        await waitFor(() => {
            expect(result.current.userSections).toHaveLength(1)
        })

        expect(result.current.userSections[0].id).toBe('others')
    })

    it('should return a usersMap for user lookup', async () => {
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.usersMap.get(1)?.name).toBe('Current User')
        expect(result.current.usersMap.get(2)?.name).toBe('Jane Smith')
        expect(result.current.usersMap.get(3)?.name).toBe('Bob Johnson')
        expect(result.current.usersMap.size).toBe(3)
    })
})
