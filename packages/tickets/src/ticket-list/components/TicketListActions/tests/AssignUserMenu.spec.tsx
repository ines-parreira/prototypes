import { screen, waitFor } from '@testing-library/react'

import { mockUser } from '@gorgias/helpdesk-mocks'

import type { NonNullableUser } from '../../../../components/TicketAssignee/hooks/useListUsersSearch'
import { useUserOptions } from '../../../../components/TicketAssignee/hooks/useUserOptions'
import { render } from '../../../../tests/render.utils'
import { AssignUserMenu } from '../AssignUserMenu'

vi.mock('@gorgias/axiom', async (importOriginal) => ({
    ...(await importOriginal()),
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
    TooltipContent: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('../../../../components/TicketAssignee/hooks/useUserOptions', () => ({
    NO_USER_OPTION: { id: 'no_user', label: 'Unassigned' },
    useUserOptions: vi.fn(),
}))

const currentUser = mockUser({
    id: 1,
    name: 'Current User',
    email: 'current@example.com',
})
const user2 = mockUser({ id: 2, name: 'Jane Smith', email: 'jane@example.com' })

const mockUseUserOptions = vi.mocked(useUserOptions)

beforeEach(() => {
    mockUseUserOptions.mockReturnValue({
        usersMap: new Map([
            [1, currentUser],
            [2, user2],
        ]) as Map<number, NonNullableUser>,
        userSections: [
            {
                id: 'self',
                name: '',
                items: [{ id: 1, label: 'Assign yourself' }],
            },
            {
                id: 'others',
                name: 'Assign to others',
                items: [{ id: 2, label: 'Jane Smith' }],
            },
        ],
        selectedOption: { id: 'no_user', label: 'Unassigned' },
        isLoading: false,
        search: '',
        setSearch: vi.fn(),
        onLoad: vi.fn(),
        shouldLoadMore: false,
    })
})

describe('AssignUserMenu', () => {
    it('renders the trigger button', () => {
        render(
            <AssignUserMenu
                value={null}
                isDisabled={false}
                onAssignUser={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('button', { name: /user/i }),
        ).toBeInTheDocument()
    })

    it('disables the trigger button when isDisabled is true', () => {
        render(
            <AssignUserMenu
                value={null}
                isDisabled={true}
                onAssignUser={vi.fn()}
            />,
        )

        expect(screen.getByRole('button', { name: /user/i })).toBeDisabled()
    })

    it('shows a disabled tooltip message when isDisabled is true', () => {
        render(
            <AssignUserMenu
                value={null}
                isDisabled={true}
                onAssignUser={vi.fn()}
            />,
        )

        expect(
            screen.getByText('Select one or more tickets to assign an agent'),
        ).toBeInTheDocument()
    })

    it('shows the default tooltip message when enabled', () => {
        render(
            <AssignUserMenu
                value={null}
                isDisabled={false}
                onAssignUser={vi.fn()}
            />,
        )

        expect(screen.getByText('Assign agent')).toBeInTheDocument()
    })

    it('opens the user dropdown when the button is clicked', async () => {
        const { user } = render(
            <AssignUserMenu
                value={null}
                isDisabled={false}
                onAssignUser={vi.fn()}
            />,
        )

        await user.click(screen.getByRole('button', { name: /user/i }))

        await waitFor(() => {
            expect(screen.getByRole('searchbox')).toBeInTheDocument()
        })
    })

    it('hides the "Unassigned" header item when searching', async () => {
        mockUseUserOptions.mockReturnValue({
            usersMap: new Map([[1, currentUser]]) as Map<
                number,
                NonNullableUser
            >,
            userSections: [],
            selectedOption: { id: 'no_user', label: 'Unassigned' },
            isLoading: false,
            search: 'cur',
            setSearch: vi.fn(),
            onLoad: vi.fn(),
            shouldLoadMore: false,
        })

        const { user } = render(
            <AssignUserMenu
                value={null}
                isDisabled={false}
                onAssignUser={vi.fn()}
            />,
        )

        await user.click(screen.getByRole('button', { name: /assign agent/i }))

        await waitFor(() => {
            expect(
                screen.queryByRole('button', { name: /unassigned/i }),
            ).not.toBeInTheDocument()
        })
    })

    it('shows an "Unassigned" header item when the dropdown is open', async () => {
        const { user } = render(
            <AssignUserMenu
                value={null}
                isDisabled={false}
                onAssignUser={vi.fn()}
            />,
        )

        await user.click(screen.getByRole('button', { name: /assign agent/i }))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /unassigned/i }),
            ).toBeInTheDocument()
        })
    })

    it('calls onAssignUser with null when the "Unassigned" header item is clicked', async () => {
        const onAssignUser = vi.fn()
        const { user } = render(
            <AssignUserMenu
                value={null}
                isDisabled={false}
                onAssignUser={onAssignUser}
            />,
        )

        await user.click(screen.getByRole('button', { name: /assign agent/i }))
        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /unassigned/i }),
            ).toBeInTheDocument()
        })
        await user.click(screen.getByRole('button', { name: /unassigned/i }))

        expect(onAssignUser).toHaveBeenCalledWith(null)
    })

    it('calls onAssignUser with the selected user when a user is picked', async () => {
        const onAssignUser = vi.fn()
        const { user } = render(
            <AssignUserMenu
                value={null}
                isDisabled={false}
                onAssignUser={onAssignUser}
            />,
        )

        await user.click(screen.getByRole('button', { name: /user/i }))

        const janeOptions = await screen.findAllByText('Jane Smith')
        await user.click(janeOptions[janeOptions.length - 1])

        expect(onAssignUser).toHaveBeenCalledWith(
            expect.objectContaining({ id: 2, name: 'Jane Smith' }),
        )
    })
})
