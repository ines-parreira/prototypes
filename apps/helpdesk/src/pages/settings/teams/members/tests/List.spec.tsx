import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { Set } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter, Route } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toast } from '@gorgias/axiom'

import {
    fetchTeam,
    fetchTeamMembers,
    addTeamMember as mockAddTeamMember,
    deleteTeamMember as mockDeleteTeamMember,
    deleteTeamMembers as mockDeleteTeamMembers,
} from 'models/team/resources'

import { MembersListContainer } from '../List'

jest.mock('models/team/resources', () => ({
    fetchTeam: jest.fn(),
    fetchTeamMembers: jest.fn(),
    deleteTeamMember: jest.fn(),
    deleteTeamMembers: jest.fn(),
    addTeamMember: jest.fn(),
}))
jest.mock('../AddMember', () => ({
    DefaultExportAddMember: ({
        addTeamMember,
    }: {
        addTeamMember: (userId: number) => Promise<void>
    }) => (
        <button type="button" onClick={() => void addTeamMember(42)}>
            Add Member Trigger
        </button>
    ),
}))

const mockFetchTeamSuccess = jest.fn()
const mockFetchTeamMembersSuccess = jest.fn()
const mockDeleteTeamSuccess = jest.fn()
const mockUpdateTeamSuccess = jest.fn()

const mockStore = configureStore([thunk])

function renderComponent({ members, meta }: { members: any[]; meta?: any }) {
    const store = mockStore({
        currentAccount: { user_id: 999 },
    })

    ;(fetchTeam as jest.Mock).mockResolvedValue({ id: 123, name: 'Test Team' })
    ;(fetchTeamMembers as jest.Mock).mockResolvedValue({
        data: { data: members, meta: meta || {} },
    })

    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={['/app/settings/teams/123/members']}>
                <Route path="/app/settings/teams/:id/members">
                    <MembersListContainer
                        match={{
                            params: { id: '123' },
                            path: '/app/settings/teams/:id/members',
                            url: '/app/settings/teams/123/members',
                            isExact: true,
                        }}
                        location={
                            {
                                pathname: '/app/settings/teams/123/members',
                            } as any
                        }
                        history={{} as any}
                        accountOwnerId={999}
                        fetchTeamSuccess={mockFetchTeamSuccess}
                        fetchTeamMembersSuccess={mockFetchTeamMembersSuccess}
                        deleteTeamSuccess={mockDeleteTeamSuccess}
                        updateTeamSuccess={mockUpdateTeamSuccess}
                    />
                </Route>
            </MemoryRouter>
        </Provider>,
    )
}

describe('MembersListContainer - deleteTeamMember', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('deletes a single member successfully', async () => {
        // We have one member to delete
        const members = [{ id: 1, name: 'Member One' }]
        ;(mockDeleteTeamMember as jest.Mock).mockResolvedValue({})

        renderComponent({ members })

        // Wait for the initial fetchTeam/fetchTeamMembers to finish
        await waitFor(() => {
            expect(fetchTeamMembers).toHaveBeenCalled()
            expect(screen.getByText('Member One')).toBeInTheDocument()
        })

        // --- FIX: find the row by text, then the button by name("delete") in that row.
        const row = screen.getByText('Member One').closest('a')!
        const deleteButton = within(row).getByRole('button', {
            name: /delete/i,
        })

        // Click the delete button
        fireEvent.click(deleteButton)

        // This triggers deleteTeamMember(123, 1). Wait for success:
        await waitFor(() => {
            expect(mockDeleteTeamMember).toHaveBeenCalledWith(123, 1)
            expect(fetchTeamMembers).toHaveBeenCalledTimes(2) // re-fetched after deletion
            expect(fetchTeam).toHaveBeenCalledTimes(2) // re-fetched the team
            expect(
                screen.getByRole('status', { name: 'Team member removed' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('handles 422 error when deleting a single member', async () => {
        // 422 error with a custom error msg from server
        ;(mockDeleteTeamMember as jest.Mock).mockRejectedValue({
            response: {
                status: 422,
                data: { error: { msg: 'Custom 422 error' } },
            },
        })

        renderComponent({ members: [{ id: 2, name: 'Member Two' }] })

        await waitFor(() => {
            expect(screen.getByText('Member Two')).toBeInTheDocument()
        })

        // --- FIX: find the row by text, then the button by name("delete") in that row.
        const row = screen.getByText('Member Two').closest('a')!
        const deleteButton = within(row).getByRole('button', {
            name: /delete/i,
        })

        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(mockDeleteTeamMember).toHaveBeenCalledWith(123, 2)
            // Should notify an error w/ the "Custom 422 error"
            expect(
                screen.getByRole('status', { name: 'Custom 422 error' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('handles non-422 error (fallback) when deleting a single member', async () => {
        // Something other than 422
        ;(mockDeleteTeamMember as jest.Mock).mockRejectedValue({
            response: { status: 500 },
        })

        renderComponent({ members: [{ id: 3, name: 'Member Three' }] })

        await waitFor(() => {
            expect(screen.getByText('Member Three')).toBeInTheDocument()
        })

        // --- FIX: find the row by text, then the button by name("delete") in that row.
        const row = screen.getByText('Member Three').closest('a')!
        const deleteButton = within(row).getByRole('button', {
            name: /delete/i,
        })

        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(mockDeleteTeamMember).toHaveBeenCalledWith(123, 3)
            // fallback error msg
            expect(
                screen.getByRole('status', {
                    name: 'Failed to remove team member. Please refresh the page and try again.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})

describe('MembersListContainer - deleteTeamMemberSelection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('deletes selected members successfully', async () => {
        // Mock members
        const members = [
            { id: 10, name: 'User 10' },
            { id: 20, name: 'User 20' },
        ]
        ;(mockDeleteTeamMembers as jest.Mock).mockResolvedValue({})

        renderComponent({ members })

        // Wait until members appear
        await waitFor(() => {
            expect(screen.getByText('User 10')).toBeInTheDocument()
            expect(screen.getByText('User 20')).toBeInTheDocument()
        })

        // The top "Select All" checkbox or individual row checkboxes
        const [selectAllCheckbox] = screen.getAllByRole('checkbox')
        fireEvent.click(selectAllCheckbox)

        // Now click the bulk "Delete" button that calls "deleteTeamMemberSelection"
        const bulkDeleteBtn = screen.getByRole('button', { name: 'Delete' })
        fireEvent.click(bulkDeleteBtn)

        await waitFor(() => {
            // "team.id=123" and "selection=Set([10,20])"
            expect(mockDeleteTeamMembers).toHaveBeenCalledWith(
                123,
                Set([10, 20]),
            )
            // Should also re-fetch members/team
            expect(fetchTeamMembers).toHaveBeenCalledTimes(2)
            expect(fetchTeam).toHaveBeenCalledTimes(2)
        })
    })

    it('handles 422 error in bulk deleteTeamMemberSelection', async () => {
        ;(mockDeleteTeamMembers as jest.Mock).mockRejectedValue({
            response: {
                status: 422,
                data: { error: { msg: 'Bulk 422 error' } },
            },
        })

        renderComponent({ members: [{ id: 999, name: 'BulkGuy' }] })

        await waitFor(() => {
            expect(screen.getByText('BulkGuy')).toBeInTheDocument()
        })

        // Check the row
        const [selectAllCheckbox] = screen.getAllByRole('checkbox')
        fireEvent.click(selectAllCheckbox)

        // Bulk delete
        const bulkDeleteBtn = screen.getByRole('button', { name: 'Delete' })
        fireEvent.click(bulkDeleteBtn)

        await waitFor(() => {
            expect(mockDeleteTeamMembers).toHaveBeenCalledWith(123, Set([999]))
            // 422 error means we show server's error message
            expect(
                screen.getByRole('status', { name: 'Bulk 422 error' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('handles non-422 error (fallback) in deleteTeamMemberSelection', async () => {
        ;(mockDeleteTeamMembers as jest.Mock).mockRejectedValue({
            response: { status: 500 },
        })

        renderComponent({ members: [{ id: 888, name: 'OopsUser' }] })

        await waitFor(() => {
            expect(screen.getByText('OopsUser')).toBeInTheDocument()
        })

        // Check
        const [selectAllCheckbox] = screen.getAllByRole('checkbox')
        fireEvent.click(selectAllCheckbox)

        // Bulk delete
        const bulkDeleteBtn = screen.getByRole('button', { name: 'Delete' })
        fireEvent.click(bulkDeleteBtn)

        await waitFor(() => {
            expect(mockDeleteTeamMembers).toHaveBeenCalledWith(123, Set([888]))
            // fallback error
            expect(
                screen.getByRole('status', {
                    name: 'Failed to remove team members. Please refresh the page and try again.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})

describe('MembersListContainer - fetchTeam error path', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('shows a toast error when fetchTeam rejects on mount', async () => {
        const store = mockStore({
            currentAccount: { user_id: 999 },
        })
        ;(fetchTeam as jest.Mock).mockRejectedValue(new Error('boom'))
        ;(fetchTeamMembers as jest.Mock).mockResolvedValue({
            data: { data: [], meta: {} },
        })

        render(
            <Provider store={store}>
                <MemoryRouter
                    initialEntries={['/app/settings/teams/123/members']}
                >
                    <Route path="/app/settings/teams/:id/members">
                        <MembersListContainer
                            match={{
                                params: { id: '123' },
                                path: '/app/settings/teams/:id/members',
                                url: '/app/settings/teams/123/members',
                                isExact: true,
                            }}
                            location={
                                {
                                    pathname: '/app/settings/teams/123/members',
                                } as any
                            }
                            history={{} as any}
                            accountOwnerId={999}
                            fetchTeamSuccess={mockFetchTeamSuccess}
                            fetchTeamMembersSuccess={
                                mockFetchTeamMembersSuccess
                            }
                            deleteTeamSuccess={mockDeleteTeamSuccess}
                            updateTeamSuccess={mockUpdateTeamSuccess}
                        />
                    </Route>
                </MemoryRouter>
            </Provider>,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Failed to fetch team. Please refresh the page and try again.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})

describe('MembersListContainer - addTeamMember', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('shows success toast when adding a member succeeds', async () => {
        ;(mockAddTeamMember as jest.Mock).mockResolvedValue({})
        renderComponent({ members: [{ id: 1, name: 'Existing Member' }] })

        await waitFor(() => {
            expect(screen.getByText('Existing Member')).toBeInTheDocument()
        })

        fireEvent.click(
            screen.getByRole('button', { name: 'Add Member Trigger' }),
        )

        await waitFor(() => {
            expect(mockAddTeamMember).toHaveBeenCalledWith(123, 42)
            expect(
                screen.getByRole('status', { name: 'Team member added' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('shows error toast when adding a member fails', async () => {
        ;(mockAddTeamMember as jest.Mock).mockRejectedValue(new Error('nope'))
        renderComponent({ members: [{ id: 1, name: 'Existing Member' }] })

        await waitFor(() => {
            expect(screen.getByText('Existing Member')).toBeInTheDocument()
        })

        fireEvent.click(
            screen.getByRole('button', { name: 'Add Member Trigger' }),
        )

        await waitFor(() => {
            expect(mockAddTeamMember).toHaveBeenCalledWith(123, 42)
            expect(
                screen.getByRole('status', {
                    name: 'Failed to add team member. Please refresh the page and try again.',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})
