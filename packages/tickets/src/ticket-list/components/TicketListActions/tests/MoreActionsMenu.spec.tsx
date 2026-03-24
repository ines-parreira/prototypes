import * as React from 'react'

import { UserRole } from '@repo/utils'
import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetCurrentUserHandler,
    mockTag,
    mockTeam,
    mockUser,
} from '@gorgias/helpdesk-mocks'

import { useCreateTicketTag } from '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag'
import { useListTagsSearch } from '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch'
import { useTeamOptions } from '../../../../components/TicketAssignee/hooks/useTeamOptions'
import { render, testAppQueryClient } from '../../../../tests/render.utils'
import { NotificationStatus } from '../../../../utils/LegacyBridge/context'
import { MoreActionsMenu } from '../MoreActionsMenu'

vi.mock('@gorgias/axiom', async (importOriginal) => ({
    ...(await importOriginal()),
    Tooltip: React.forwardRef<
        HTMLElement,
        {
            trigger: React.ReactNode
            children: React.ReactNode
        } & React.HTMLAttributes<HTMLElement>
    >(({ trigger, children, ...props }, ref) => {
        const triggerElement = React.isValidElement(trigger) ? (
            React.cloneElement(trigger as React.ReactElement, {
                ...props,
                ref,
            })
        ) : (
            <span
                ref={ref as React.Ref<HTMLSpanElement>}
                tabIndex={-1}
                {...props}
            >
                {trigger}
            </span>
        )

        return (
            <>
                {triggerElement}
                {children}
            </>
        )
    }),
    TooltipContent: ({ title }: { title: string }) => <div>{title}</div>,
}))

vi.mock('../../../../components/TicketAssignee/hooks/useTeamOptions', () => ({
    NO_TEAM_OPTION: {
        id: 'no_team',
        label: 'No team',
    },
    useTeamOptions: vi.fn(),
}))

vi.mock(
    '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useListTagsSearch',
    () => ({
        useListTagsSearch: vi.fn(),
    }),
)

vi.mock(
    '../../../../components/InfobarTicketDetails/components/InfobarTicketTags/hooks/useCreateTicketTag',
    () => ({
        useCreateTicketTag: vi.fn(),
    }),
)

const agentUser = mockUser({
    id: 1,
    email: 'agent@test.com',
    firstname: 'Test',
    lastname: 'Agent',
    role: { name: UserRole.Agent },
})

const basicAgentUser = mockUser({
    id: 2,
    email: 'basic@test.com',
    firstname: 'Basic',
    lastname: 'Agent',
    role: { name: UserRole.BasicAgent },
})

const mockAgentCurrentUser = mockGetCurrentUserHandler(async () =>
    HttpResponse.json(agentUser),
)

const server = setupServer()
const mockUseTeamOptions = vi.mocked(useTeamOptions)
const mockUseListTagsSearch = vi.mocked(useListTagsSearch)
const mockUseCreateTicketTag = vi.mocked(useCreateTicketTag)
const supportTeam = mockTeam({ id: 1, name: 'Support' })
const salesTeam = mockTeam({ id: 2, name: 'Sales' })
const vipTag = mockTag({ id: 99, name: 'VIP', decoration: null })
const supportTeamId = 1
const supportTeamName = 'Support'
const salesTeamId = 2
const salesTeamName = 'Sales'

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    testAppQueryClient.clear()
    server.use(mockAgentCurrentUser.handler)
    mockUseTeamOptions.mockReturnValue({
        teamsMap: new Map([
            [supportTeamId, supportTeam],
            [salesTeamId, salesTeam],
        ]),
        teamSections: [
            {
                id: 'teams',
                name: '',
                items: [
                    { id: supportTeamId, label: supportTeamName },
                    { id: salesTeamId, label: salesTeamName },
                ],
            },
        ],
        selectedOption: undefined,
        isLoading: false,
        search: '',
        setSearch: vi.fn(),
        onLoad: vi.fn(),
        shouldLoadMore: false,
    })
    mockUseListTagsSearch.mockReturnValue({
        data: {
            pages: [
                {
                    data: {
                        data: [vipTag],
                    },
                },
            ],
        },
        search: '',
        setSearch: vi.fn(),
        isLoading: false,
        shouldLoadMore: false,
        onLoad: vi.fn(),
    } as never)
    mockUseCreateTicketTag.mockReturnValue({
        createTicketTag: vi.fn(),
        isCreating: false,
    })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const defaultProps = {
    isDisabled: false,
    onMarkAsUnread: vi.fn(),
    onMarkAsRead: vi.fn(),
    onAddTag: vi.fn(),
    onAssignTeam: vi.fn(),
    onChangePriority: vi.fn(),
    onExportTickets: vi.fn(),
    onApplyMacro: vi.fn(),
    onMoveToTrash: vi.fn(),
}

async function openMenu(user: ReturnType<typeof render>['user']) {
    await user.click(screen.getByRole('button', { name: /more actions/i }))
    await waitFor(() => {
        expect(
            screen.getByRole('menuitem', { name: /mark as unread/i }),
        ).toBeInTheDocument()
    })
}

describe('MoreActionsMenu', () => {
    it('renders the trigger button', () => {
        render(<MoreActionsMenu {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: /more actions/i }),
        ).toBeInTheDocument()
    })

    it('disables the trigger button when isDisabled is true', () => {
        render(<MoreActionsMenu {...defaultProps} isDisabled />)

        expect(
            screen.getByRole('button', { name: /more actions/i }),
        ).toBeDisabled()
    })

    it('shows a disabled tooltip message when isDisabled is true', () => {
        render(<MoreActionsMenu {...defaultProps} isDisabled />)

        expect(
            screen.getByText('Select one or more tickets to perform actions'),
        ).toBeInTheDocument()
    })

    it('shows the default tooltip message when enabled', () => {
        render(<MoreActionsMenu {...defaultProps} />)

        expect(screen.getByText('More actions')).toBeInTheDocument()
    })

    describe('menu items', () => {
        it('renders standard items when opened', async () => {
            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)

            expect(
                screen.getByRole('menuitem', { name: /mark as read/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /add tag/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /apply macro/i }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('menuitem', { name: /move to trash/i }),
            ).toBeInTheDocument()
        }, 10000)

        it('shows export tickets for an agent', async () => {
            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)

            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: /export tickets/i }),
                ).toBeInTheDocument()
            })
        })

        it('hides export tickets for a user below agent level', async () => {
            server.use(
                mockGetCurrentUserHandler(async () =>
                    HttpResponse.json(basicAgentUser),
                ).handler,
            )

            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)

            await waitFor(() => {
                expect(
                    screen.queryByRole('menuitem', { name: /export tickets/i }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('handler callbacks', () => {
        it('calls onMarkAsUnread when that item is activated', async () => {
            const onMarkAsUnread = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onMarkAsUnread={onMarkAsUnread}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /mark as unread/i }),
            )

            expect(onMarkAsUnread).toHaveBeenCalledTimes(1)
        })

        it('calls onMarkAsRead when that item is activated', async () => {
            const onMarkAsRead = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onMarkAsRead={onMarkAsRead}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /mark as read/i }),
            )

            expect(onMarkAsRead).toHaveBeenCalledTimes(1)
        })

        it('calls onMoveToTrash when that item is activated', async () => {
            const onMoveToTrash = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onMoveToTrash={onMoveToTrash}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /move to trash/i }),
            )

            expect(onMoveToTrash).toHaveBeenCalledTimes(1)
        })

        it('calls onAddTag when a tag option is activated', async () => {
            const onAddTag = vi.fn()
            const { user } = render(
                <MoreActionsMenu {...defaultProps} onAddTag={onAddTag} />,
            )
            await openMenu(user)
            await user.click(screen.getByRole('menuitem', { name: /add tag/i }))
            await user.click(screen.getByRole('menuitem', { name: /vip/i }))

            expect(onAddTag).toHaveBeenCalledWith(vipTag)
        })

        it('shows a create tag action when the search has no exact match', async () => {
            mockUseListTagsSearch.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [],
                            },
                        },
                    ],
                },
                search: 'new tag',
                setSearch: vi.fn(),
                isLoading: false,
                shouldLoadMore: false,
                onLoad: vi.fn(),
            } as never)

            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)
            await user.click(screen.getByRole('menuitem', { name: /add tag/i }))

            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', {
                        name: /create tag:\s*new tag/i,
                    }),
                ).toBeInTheDocument()
            })
        }, 10000)

        it('creates a tag and adds it when the create action is activated', async () => {
            const createdTag = mockTag({
                id: 101,
                name: 'new tag',
                decoration: null,
            })
            const setSearch = vi.fn()
            const createTicketTag = vi.fn().mockResolvedValue(createdTag)
            const onAddTag = vi.fn()

            mockUseListTagsSearch.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [],
                            },
                        },
                    ],
                },
                search: ' new tag ',
                setSearch,
                isLoading: false,
                shouldLoadMore: false,
                onLoad: vi.fn(),
            } as never)
            mockUseCreateTicketTag.mockReturnValue({
                createTicketTag,
                isCreating: false,
            })

            const { user } = render(
                <MoreActionsMenu {...defaultProps} onAddTag={onAddTag} />,
            )
            await openMenu(user)
            await user.click(screen.getByRole('menuitem', { name: /add tag/i }))
            await user.click(
                screen.getByRole('menuitem', {
                    name: /create tag:\s*new tag/i,
                }),
            )

            await waitFor(() => {
                expect(createTicketTag).toHaveBeenCalledWith('new tag')
            })
            expect(onAddTag).toHaveBeenCalledWith(createdTag)
            expect(setSearch).toHaveBeenCalledWith('')
        })

        it('does not show a create tag action when the search exactly matches an existing tag', async () => {
            mockUseListTagsSearch.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [vipTag],
                            },
                        },
                    ],
                },
                search: ' VIP ',
                setSearch: vi.fn(),
                isLoading: false,
                shouldLoadMore: false,
                onLoad: vi.fn(),
            } as never)

            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)
            await user.click(screen.getByRole('menuitem', { name: /add tag/i }))

            expect(
                screen.queryByRole('menuitem', {
                    name: /create tag:/i,
                }),
            ).not.toBeInTheDocument()
        })

        it('dispatches an error notification when creating a tag fails', async () => {
            const setSearch = vi.fn()
            const createTicketTag = vi.fn().mockRejectedValue(new Error('boom'))

            mockUseListTagsSearch.mockReturnValue({
                data: {
                    pages: [
                        {
                            data: {
                                data: [],
                            },
                        },
                    ],
                },
                search: 'new tag',
                setSearch,
                isLoading: false,
                shouldLoadMore: false,
                onLoad: vi.fn(),
            } as never)
            mockUseCreateTicketTag.mockReturnValue({
                createTicketTag,
                isCreating: false,
            })

            const { user, mocks } = render(
                <MoreActionsMenu {...defaultProps} />,
            )
            await openMenu(user)
            await user.click(screen.getByRole('menuitem', { name: /add tag/i }))
            await user.click(
                screen.getByRole('menuitem', {
                    name: /create tag:\s*new tag/i,
                }),
            )

            await waitFor(() => {
                expect(mocks.dispatchNotification).toHaveBeenCalledWith({
                    status: NotificationStatus.Error,
                    message: 'Failed to create new tag',
                })
            })
            expect(createTicketTag).toHaveBeenCalledWith('new tag')
            expect(defaultProps.onAddTag).not.toHaveBeenCalled()
        })

        it('filters team options based on search input', async () => {
            mockUseTeamOptions.mockReturnValue({
                teamsMap: new Map([
                    [supportTeamId, supportTeam],
                    [salesTeamId, salesTeam],
                ]),
                teamSections: [
                    {
                        id: 'teams',
                        name: '',
                        items: [{ id: supportTeamId, label: supportTeamName }],
                    },
                ],
                selectedOption: undefined,
                isLoading: false,
                search: 'sup',
                setSearch: vi.fn(),
                onLoad: vi.fn(),
                shouldLoadMore: false,
            })

            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /assign to team/i }),
            )

            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', {
                        name: new RegExp(supportTeamName, 'i'),
                    }),
                ).toBeInTheDocument()
                expect(
                    screen.queryByRole('menuitem', {
                        name: new RegExp(salesTeamName, 'i'),
                    }),
                ).not.toBeInTheDocument()
            })
        })

        it('calls onAssignTeam when a team option is activated', async () => {
            const onAssignTeam = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onAssignTeam={onAssignTeam}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /assign to team/i }),
            )
            await user.click(screen.getByRole('menuitem', { name: /support/i }))

            expect(onAssignTeam).toHaveBeenCalledWith(supportTeam)
        })

        it('calls onChangePriority with the correct value when a priority item is activated', async () => {
            const onChangePriority = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onChangePriority={onChangePriority}
                />,
            )
            await openMenu(user)

            await user.click(
                screen.getByRole('menuitem', { name: /change priority/i }),
            )
            const criticalPriorityOption = await screen.findByRole('menuitem', {
                name: /critical/i,
            })
            await user.click(criticalPriorityOption)

            expect(onChangePriority).toHaveBeenCalledWith('critical')
        })

        it('calls onApplyMacro when that item is activated', async () => {
            const onApplyMacro = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onApplyMacro={onApplyMacro}
                />,
            )
            await openMenu(user)
            await user.click(
                screen.getByRole('menuitem', { name: /apply macro/i }),
            )

            expect(onApplyMacro).toHaveBeenCalledTimes(1)
        })

        it('calls onExportTickets when that item is activated', async () => {
            const onExportTickets = vi.fn()
            const { user } = render(
                <MoreActionsMenu
                    {...defaultProps}
                    onExportTickets={onExportTickets}
                />,
            )
            await openMenu(user)
            await waitFor(() => {
                expect(
                    screen.getByRole('menuitem', { name: /export tickets/i }),
                ).toBeInTheDocument()
            })
            await user.click(
                screen.getByRole('menuitem', { name: /export tickets/i }),
            )

            expect(onExportTickets).toHaveBeenCalledTimes(1)
        })
    })

    describe('search reset', () => {
        it('resets team search when the menu is closed by the user', async () => {
            const setSearch = vi.fn()
            mockUseTeamOptions.mockReturnValue({
                teamsMap: new Map([
                    [supportTeamId, supportTeam],
                    [salesTeamId, salesTeam],
                ]),
                teamSections: [
                    {
                        id: 'teams',
                        name: '',
                        items: [
                            { id: supportTeamId, label: supportTeamName },
                            { id: salesTeamId, label: salesTeamName },
                        ],
                    },
                ],
                selectedOption: undefined,
                isLoading: false,
                search: 'sup',
                setSearch,
                onLoad: vi.fn(),
                shouldLoadMore: false,
            })

            const { user } = render(<MoreActionsMenu {...defaultProps} />)
            await openMenu(user)
            await user.keyboard('{Escape}')

            await waitFor(() => {
                expect(setSearch).toHaveBeenCalledWith('')
            })
        })

        it('resets team search when the menu is force-closed because isDisabled becomes true', async () => {
            const setSearch = vi.fn()
            mockUseTeamOptions.mockReturnValue({
                teamsMap: new Map([
                    [supportTeamId, supportTeam],
                    [salesTeamId, salesTeam],
                ]),
                teamSections: [
                    {
                        id: 'teams',
                        name: '',
                        items: [
                            { id: supportTeamId, label: supportTeamName },
                            { id: salesTeamId, label: salesTeamName },
                        ],
                    },
                ],
                selectedOption: undefined,
                isLoading: false,
                search: 'sup',
                setSearch,
                onLoad: vi.fn(),
                shouldLoadMore: false,
            })

            const { user, rerender } = render(
                <MoreActionsMenu {...defaultProps} isDisabled={false} />,
            )
            await openMenu(user)

            rerender(<MoreActionsMenu {...defaultProps} isDisabled={true} />)

            await waitFor(() => {
                expect(setSearch).toHaveBeenCalledWith('')
            })
        })
    })
})
