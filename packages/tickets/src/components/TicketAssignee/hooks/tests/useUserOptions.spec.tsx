import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockListUsersHandler,
    mockTicketUser,
    mockUser,
} from '@gorgias/helpdesk-mocks'
import { ListUsersRolesItem } from '@gorgias/helpdesk-types'

import { renderHook } from '../../../../tests/render.utils'
import { NO_USER_OPTION, useUserOptions } from '../useUserOptions'

const currentUser = mockUser({
    id: 1,
    name: 'Current User',
    email: 'current@example.com',
    role: { name: ListUsersRolesItem.Admin },
})
const user2 = mockUser({
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: { name: ListUsersRolesItem.Agent },
})
const user3 = mockUser({
    id: 3,
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: { name: ListUsersRolesItem.BasicAgent },
})

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
            { id: '1', label: 'Assign yourself' },
        ])
        expect(result.current.userSections[1].id).toBe('others')
        expect(result.current.userSections[1].items).toEqual([
            { id: '2', label: 'Jane Smith' },
            { id: '3', label: 'Bob Johnson' },
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
            id: '2',
            label: 'Jane Smith',
        })
    })

    it('should only show matching other users when searching', async () => {
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
        expect(result.current.userSections[0].items).toEqual([
            { id: '2', label: 'Jane Smith' },
        ])
    })

    it('should fuzzy match other users by name when searching', async () => {
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        act(() => {
            result.current.setSearch('jsm')
        })

        await waitFor(() => {
            expect(result.current.userSections).toHaveLength(1)
        })

        expect(result.current.userSections[0].id).toBe('others')
        expect(result.current.userSections[0].items).toEqual([
            { id: '2', label: 'Jane Smith' },
        ])
    })

    it('should exclude bot users', async () => {
        const botUser = mockUser({
            id: 4,
            name: 'Automation Bot',
            email: 'bot@example.com',
            role: { name: ListUsersRolesItem.Bot },
        })
        const aiAgentBotUser = mockUser({
            id: 5,
            name: 'AI Agent',
            email: 'ai-agent@example.com',
            role: { name: ListUsersRolesItem.Bot },
            client_id: '658d6f54fbff9b7c6f2d0321',
        })

        server.use(
            mockListUsersHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [currentUser, user2, botUser, aiAgentBotUser],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.userSections[1].items).toEqual([
            { id: '2', label: 'Jane Smith' },
        ])
        expect(result.current.usersMap.has('4')).toBe(false)
        expect(result.current.usersMap.has('5')).toBe(false)
    })

    it('should exclude users with other non-assignable roles', async () => {
        const internalUser = mockUser({
            id: 4,
            name: 'Internal Agent',
            email: 'internal@example.com',
            role: { name: ListUsersRolesItem.InternalAgent },
        })

        server.use(
            mockListUsersHandler(async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: [currentUser, user2, internalUser],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                    },
                }),
            ).handler,
        )

        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.userSections[1].items).toEqual([
            { id: '2', label: 'Jane Smith' },
        ])
        expect(result.current.usersMap.has('4')).toBe(false)
    })

    it('should keep the selected current user option available without showing it when searching', async () => {
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: mockTicketUser(currentUser) }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        act(() => {
            result.current.setSearch('jane')
        })

        await waitFor(() => {
            expect(
                result.current.userSections.map((section) => section.id),
            ).toEqual(['others'])
        })

        expect(result.current.userSections[0].items).not.toContainEqual({
            id: currentUser.id?.toString(),
            label: currentUser.name,
        })
        expect(result.current.userSections[0].items).not.toContainEqual({
            id: currentUser.id?.toString(),
            label: 'Assign yourself',
        })
        expect(result.current.selectedOption).toEqual({
            id: currentUser.id?.toString(),
            label: 'Assign yourself',
        })
    })

    it('should keep a selected user separate from unrelated search results', async () => {
        const selectedUser = mockTicketUser({
            id: 123,
            name: 'Selected User',
            email: 'selected@example.com',
            meta: {
                profile_picture_url: 'https://example.com/selected-user.jpg',
            },
        })
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: selectedUser }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        act(() => {
            result.current.setSearch('jane')
        })

        await waitFor(() => {
            expect(
                result.current.userSections.map((section) => section.id),
            ).toEqual(['selected', 'others'])
        })

        expect(result.current.userSections[0]).toEqual({
            id: 'selected',
            name: '',
            items: [
                { id: selectedUser.id.toString(), label: selectedUser.name },
            ],
        })
        expect(result.current.userSections[1].items).not.toContainEqual({
            id: selectedUser.id.toString(),
            label: selectedUser.name,
        })
        expect(result.current.selectedOption).toEqual({
            id: selectedUser.id.toString(),
            label: selectedUser.name,
        })
        expect(
            result.current.usersMap.get(selectedUser.id.toString()),
        ).toMatchObject({
            id: selectedUser.id,
            name: selectedUser.name,
            meta: {
                profile_picture_url: 'https://example.com/selected-user.jpg',
            },
        })
    })

    it('should return a usersMap for user lookup', async () => {
        const { result } = renderHook(() =>
            useUserOptions({ currentAssignee: null }),
        )

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.usersMap.get('1')?.name).toBe('Current User')
        expect(result.current.usersMap.get('2')?.name).toBe('Jane Smith')
        expect(result.current.usersMap.get('3')?.name).toBe('Bob Johnson')
        expect(result.current.usersMap.size).toBe(3)
    })
})
