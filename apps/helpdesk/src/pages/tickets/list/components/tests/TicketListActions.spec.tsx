import { ComponentProps } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock } from '@repo/testing'
import {
    act,
    fireEvent,
    render,
    RenderResult,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS, List, Map } from 'immutable'
import _noop from 'lodash/noop'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { UserRole } from 'config/types/user'
import { THEME_NAME, themeTokenMap, useTheme } from 'core/theme'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { Update } from 'jobs'
import { JobType } from 'models/job/types'
import { createJob as createJobTicket } from 'state/tickets/actions'
import { RootState, StoreState } from 'state/types'
import {
    createJob as createJobView,
    updateSelectedItemsIds,
} from 'state/views/actions'
import { TagDropdownMenu } from 'tags'
import { makeExecuteKeyboardAction } from 'utils/testing'

import { TicketListActions } from '../TicketListActions'

jest.mock('@repo/utils', () => {
    const React = jest.requireActual('react')
    const mockBind = jest.fn()
    const mockUnbind = jest.fn()

    return {
        ...jest.requireActual('@repo/utils'),
        shortcutManager: {
            bind: mockBind,
            unbind: mockUnbind,
        },
        useShortcuts: (component: string, actions: Record<string, any>) => {
            React.useEffect(() => {
                mockBind(component, actions)
                return () => {
                    mockUnbind(component)
                }
            }, [actions, component])
        },
    }
})
jest.mock('state/views/actions')
jest.mock('state/tickets/actions')
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('@repo/logging')
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
}))
const useThemeMock = jest.mocked(useTheme)

const logEventMock = assumeMock(logEvent)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockedCreateJobTicket = assumeMock(createJobTicket)
const mockedCreateJobView = assumeMock(createJobView)
const mockedUpdateSelectedItemsIds = assumeMock(updateSelectedItemsIds)

// Get the mocked shortcutManager from the module
const { shortcutManager: shortcutManagerMock } = jest.requireMock('@repo/utils')

const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>

const mockStore = configureMockStore()

jest.mock(
    'tags/TagDropdownMenu',
    () =>
        ({ onClick }: ComponentProps<typeof TagDropdownMenu>) => (
            <div onClick={() => onClick({ name: 'tag added' })}>
                TagDropdownMenuMock
            </div>
        ),
)

jest.mock(
    'ticket-list-view/components/bulk-actions/PriorityDropdownMenu',
    () =>
        ({ onClick }: { onClick: (item: { name: string }) => void }) => (
            <div onClick={() => onClick({ name: 'high' })}>
                PriorityDropdownMenuMock
            </div>
        ),
)

describe('TicketListActions component', () => {
    const state = {
        agents: fromJS({ all: [] }),
        currentUser: fromJS(user),
        teams: fromJS({ all: [] }),
        tickets: fromJS({ items: [] }),
        views: fromJS({
            active: { id: 888, filters: '' },
        }),
    }
    const store = mockStore(state)
    const props = {
        selectedItemsIds: fromJS([]) as List<any>,
        openMacroModal: jest.fn(),
    }

    const expectAllActionsToHaveEnabledState = async (
        { getAllByRole }: RenderResult,
        isEnabled: boolean,
    ) => {
        const buttons = getAllByRole('button')
        for (const button of buttons) {
            await waitFor(() => {
                if (isEnabled) {
                    expect(button).toBeAriaEnabled()
                } else {
                    expect(button).toBeAriaDisabled()
                }
            })
        }
    }

    const hitShortcut = makeExecuteKeyboardAction(
        shortcutManagerMock,
        shortcutEventMock,
    )

    beforeEach(() => {
        jest.resetAllMocks()
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: themeTokenMap[THEME_NAME.Light],
        })
    })

    it('should render enabled buttons when some tickets are selected', async () => {
        const renderResult = render(
            <Provider store={store}>
                <TicketListActions
                    {...props}
                    selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                />
            </Provider>,
        )

        await expectAllActionsToHaveEnabledState(renderResult, true)
    })

    it.each([
        [
            'nothing is selected',
            {},
            {
                ...props,
                selectedItemsIds: fromJS([]),
            },
        ],
        [
            'filters are not valid',
            { views: fromJS({ active: { id: 111, filters: ", '')" } }) },
            {
                ...props,
                selectedItemsIds: fromJS([1, 2, 3, 4, 5]),
            },
        ],
    ])(
        'should render disabled buttons when %s',
        async (
            testName,
            customState,
            props: ComponentProps<typeof TicketListActions>,
        ) => {
            const renderResult = render(
                <Provider store={mockStore({ ...state, ...customState })}>
                    <TicketListActions {...props} />
                </Provider>,
            )

            await expectAllActionsToHaveEnabledState(renderResult, false)
        },
    )

    it('should render teams in assign team dropdown', () => {
        const teams = [
            { id: 4, name: 'foo' },
            { id: 5, name: 'bar' },
            { id: 6, name: 'baz' },
        ]
        render(
            <Provider
                store={mockStore({
                    ...state,
                    teams: fromJS({
                        all: teams,
                    }),
                })}
            >
                <TicketListActions
                    {...props}
                    selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                />
            </Provider>,
        )

        expect(screen.getByText('Assign to team')).toBeInTheDocument()
        expect(screen.getByText('Could not find any agent')).toBeInTheDocument()
        expect(screen.getByText(teams[0].name)).toBeInTheDocument()
        expect(screen.getByText(teams[1].name)).toBeInTheDocument()
        expect(screen.getByText(teams[2].name)).toBeInTheDocument()
        expect(screen.getAllByText('Clear assignee')).toHaveLength(2)
    })

    it('should render agents options in assign agent dropdown', () => {
        const agents = [
            { id: 4, name: 'foo' },
            { id: 5, name: 'bar' },
            { id: 6, name: 'baz' },
        ]
        render(
            <Provider
                store={mockStore({
                    ...state,
                    agents: fromJS({
                        all: agents,
                    }),
                })}
            >
                <TicketListActions
                    {...props}
                    selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                />
            </Provider>,
        )

        expect(screen.getByText('Assign to me')).toBeInTheDocument()
        expect(screen.getByText('Could not find any team')).toBeInTheDocument()
        expect(screen.getByText(agents[0].name)).toBeInTheDocument()
        expect(screen.getByText(agents[1].name)).toBeInTheDocument()
        expect(screen.getByText(agents[2].name)).toBeInTheDocument()
        expect(screen.getAllByText('Clear assignee')).toHaveLength(2)
    })

    it('should render the delete action for lead and admin agents', async () => {
        const user = userEvent.setup()
        render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: { id: 1, name: UserRole.Agent },
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        await act(async () => {
            await user.click(screen.getByText('More'))
        })

        expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should render the special actions for lead and admin agents', async () => {
        const user = userEvent.setup()

        render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: { id: 1, name: UserRole.Agent },
                    }),
                    views: fromJS({
                        active: {
                            id: 888,
                            filters: 'isNotEmpty(ticket.trashed_datetime)',
                        },
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        await act(async () => {
            await user.click(screen.getByText('More'))
        })

        expect(screen.getByText('Export tickets')).toBeInTheDocument()
        expect(screen.getByText('Delete forever')).toBeInTheDocument()
        expect(screen.getByText('Undelete')).toBeInTheDocument()
    })

    it('should not render the delete and export buttons for user below agent role', () => {
        render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: { id: 1, name: UserRole.LiteAgent },
                    }),
                })}
            >
                <TicketListActions {...props} />
            </Provider>,
        )

        expect(screen.queryByText('Delete')).not.toBeInTheDocument()
        expect(screen.queryByText('Export tickets')).not.toBeInTheDocument()
    })

    it('should send event to segment on click export tickets button', async () => {
        const user = userEvent.setup()

        render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: { id: 1, name: UserRole.Agent },
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        await act(async () => {
            await user.click(screen.getByText('More'))
        })

        await act(async () => {
            await user.click(screen.getByText(/Export tickets/))
        })

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TicketExport,
            expect.objectContaining({
                type: 'bulk-action-export',
            }),
        )
    })

    it('should bind keyboard shortcuts on mount', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>,
        )

        expect(shortcutManagerMock.bind).toHaveBeenCalled()
        const [[component, actions]] = shortcutManagerMock.bind.mock.calls
        expect(component).toBe('TicketListActions')
        expect(Object.keys(actions!)).toEqual([
            'OPEN_TICKET',
            'CLOSE_TICKET',
            'OPEN_ASSIGNEE',
            'OPEN_TAGS',
            'OPEN_MACRO',
            'DELETE_TICKET',
            'HIDE_POPOVER',
            'MARK_TICKET_READ',
            'MARK_TICKET_UNREAD',
        ])
    })

    it('should unbind keyboard shortcuts on mount', () => {
        const { unmount } = render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>,
        )

        unmount()

        expect(shortcutManagerMock.unbind).toHaveBeenLastCalledWith(
            'TicketListActions',
        )
    })

    it('should open agents dropdown on open assignee shortcut', () => {
        const { getByRole } = render(
            <Provider
                store={mockStore({
                    ...state,
                    agents: fromJS({
                        all: [
                            {
                                id: 1,
                                name: 'John Doe',
                            },
                        ],
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        hitShortcut('OPEN_ASSIGNEE')

        const expendedMenu = getByRole('menu', { hidden: false })
        expect(within(expendedMenu).queryByText('John Doe')).not.toBe(null)
        expect(shortcutEventMock.preventDefault).toHaveBeenLastCalledWith()
    })

    it('should not open agents dropdown on open assignee shortcut when no selected items', () => {
        const { queryByRole } = render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>,
        )

        hitShortcut('OPEN_ASSIGNEE')

        expect(queryByRole('menu', { hidden: false })).toBe(null)
    })

    it('should close agents dropdown on hide popover shortcut', () => {
        const { queryByRole } = render(
            <Provider
                store={mockStore({
                    ...state,
                    agents: fromJS({
                        all: [
                            {
                                id: 1,
                                name: 'John Doe',
                            },
                        ],
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        hitShortcut('OPEN_ASSIGNEE')
        hitShortcut('HIDE_POPOVER')

        expect(queryByRole('menu', { hidden: false })).toBe(null)
    })

    it('should open and close tags dropdown on keyboard shortcut', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        hitShortcut('OPEN_TAGS')
        expect(screen.getByText('TagDropdownMenuMock')).toBeInTheDocument()
        expect(shortcutEventMock.preventDefault).toHaveBeenLastCalledWith()

        hitShortcut('HIDE_POPOVER')
        expect(
            screen.queryByText('TagDropdownMenuMock'),
        ).not.toBeInTheDocument()
    })

    it('should not open tags dropdown on open tags shortcut when no selected items', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>,
        )

        hitShortcut('OPEN_TAGS')
        expect(
            screen.queryByText('TagDropdownMenuMock'),
        ).not.toBeInTheDocument()
    })

    it('should call openMacroModal on open macro shortcut', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        hitShortcut('OPEN_MACRO')

        expect(props.openMacroModal).toHaveBeenLastCalledWith()
    })

    it('should not call openMacroModal on open macro shortcut when no selected items', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>,
        )

        hitShortcut('OPEN_MACRO')

        expect(props.openMacroModal).not.toHaveBeenCalled()
    })

    it('should show delete confirmation on delete ticket shortcut', async () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        hitShortcut('DELETE_TICKET')

        await waitFor(() => {
            expect(
                screen.queryByText(/Are you sure you want to delete/),
            ).not.toBe(null)
        })
    })

    it('should not show delete confirmation on delete ticket shortcut when no selected items', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>,
        )

        hitShortcut('DELETE_TICKET')

        expect(screen.queryByText(/Are you sure you want to delete/)).toBe(null)
    })

    it("should not show delete confirmation on delete ticket shortcut when the user's role is basic, lite or observer", () => {
        render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: { id: 1, name: UserRole.LiteAgent },
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        hitShortcut('DELETE_TICKET')

        expect(screen.queryByText(/Are you sure you want to delete/)).toBe(null)
    })

    it('should delete forever tickets', async () => {
        const user = userEvent.setup()

        render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: { id: 1, name: UserRole.Agent },
                    }),
                    views: fromJS({
                        active: {
                            id: 888,
                            filters: 'isNotEmpty(ticket.trashed_datetime)',
                        },
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        await user.click(screen.getByText('More'))
        await user.click(screen.getByText('Delete forever'))

        await waitFor(() => {
            expect(screen.getByText('Are you sure?')).toBeInTheDocument()
            expect(
                screen.getByText(
                    /Are you sure you want to delete 1 ticket forever\?/,
                ),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByText('Confirm'))
        expect(mockedCreateJobTicket).toHaveBeenCalledWith(
            fromJS([1]),
            JobType.DeleteTicket,
            {},
        )
    })

    describe('search functionality', () => {
        it('should filter teams when searching', async () => {
            const user = userEvent.setup()
            const teams = [
                { id: 1, name: 'Team Alpha' },
                { id: 2, name: 'Team Beta' },
                { id: 3, name: 'Team Gamma' },
            ]

            render(
                <Provider
                    store={mockStore({
                        ...state,
                        teams: fromJS({
                            all: teams,
                        }),
                    })}
                >
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            // Open teams dropdown
            await user.click(screen.getByText('Assign to team'))

            // Type in search
            const searchInput = screen.getByPlaceholderText('Search teams...')
            await user.type(searchInput, 'Alpha')

            // Should only show Team Alpha
            expect(screen.getByText('Team Alpha')).toBeInTheDocument()
            expect(screen.queryByText('Team Beta')).not.toBeInTheDocument()
            expect(screen.queryByText('Team Gamma')).not.toBeInTheDocument()
        })

        it('should filter agents when searching', async () => {
            const user = userEvent.setup()
            const agents = [
                { id: 1, name: 'John Doe' },
                { id: 2, name: 'Jane Smith' },
                { id: 3, name: 'Bob Johnson' },
            ]

            render(
                <Provider
                    store={mockStore({
                        ...state,
                        agents: fromJS({
                            all: agents,
                        }),
                    })}
                >
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            // Open agents dropdown
            await user.click(screen.getByText('Assign to me'))

            // Type in search
            const searchInput = screen.getByPlaceholderText('Search agents...')
            await user.type(searchInput, 'John')

            // Should only show John Doe and Bob Johnson
            expect(screen.getByText('John Doe')).toBeInTheDocument()
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
            expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
        })

        it('should show "Could not find any team" when no teams match search', async () => {
            const user = userEvent.setup()
            const teams = [
                { id: 1, name: 'Team Alpha' },
                { id: 2, name: 'Team Beta' },
            ]

            render(
                <Provider
                    store={mockStore({
                        ...state,
                        teams: fromJS({
                            all: teams,
                        }),
                    })}
                >
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            // Open teams dropdown
            await user.click(screen.getByText('Assign to team'))

            // Type in search
            const searchInput = screen.getByPlaceholderText('Search teams...')
            await user.type(searchInput, 'NonExistent')

            // Should show no results message
            expect(
                screen.getByText('Could not find any team'),
            ).toBeInTheDocument()
        })

        it('should show "Could not find any agent" when no agents match search', async () => {
            const user = userEvent.setup()
            const agents = [
                { id: 1, name: 'John Doe' },
                { id: 2, name: 'Jane Smith' },
            ]

            render(
                <Provider
                    store={mockStore({
                        ...state,
                        agents: fromJS({
                            all: agents,
                        }),
                    })}
                >
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            // Open agents dropdown
            await user.click(screen.getByText('Assign to me'))

            // Type in search
            const searchInput = screen.getByPlaceholderText('Search agents...')
            await user.type(searchInput, 'NonExistent')

            // Should show no results message
            expect(
                screen.getByText('Could not find any agent'),
            ).toBeInTheDocument()
        })
    })

    describe('priority dropdown functionality', () => {
        it('should open priority dropdown when clicking change priority', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={store}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            await user.click(screen.getByText('More'))
            await user.click(screen.getByText('Change priority'))

            expect(
                screen.getByText('PriorityDropdownMenuMock'),
            ).toBeInTheDocument()
        })

        it('should go back to more dropdown when clicking back in priority dropdown', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={store}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            await user.click(screen.getByText('More'))
            await user.click(screen.getByText('Change priority'))
            await user.click(screen.getByText('Back'))

            // Should be back in more dropdown
            expect(screen.getByText('Change priority')).toBeInTheDocument()
            expect(
                screen.queryByText('PriorityDropdownMenuMock'),
            ).not.toBeInTheDocument()
        })

        it('should create job when selecting priority', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={store}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            await user.click(screen.getByText('More'))
            await user.click(screen.getByText('Change priority'))
            await user.click(screen.getByText('PriorityDropdownMenuMock'))

            expect(mockedCreateJobTicket).toHaveBeenCalledWith(
                fromJS([1]),
                JobType.UpdateTicket,
                { updates: { priority: 'high' } },
            )
        })
    })

    type CreateJobTestSuite = [
        JobType,
        string,
        (state: StoreState) => StoreState,
        (
            props: ComponentProps<typeof TicketListActions>,
        ) => ComponentProps<typeof TicketListActions>,
        (renderResult: RenderResult) => void | Promise<void>,
        { updates: XOR<Update> },
        string,
    ]

    // TODO(React18): Fix this test
    describe.skip.each([
        [
            JobType.UpdateTicket,
            'close button click',
            (state) => state,
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Close'))
            },
            { updates: { status: 'closed' } },
            'status',
        ],
        [
            JobType.UpdateTicket,
            'open dropdown item click',
            (state) => state,
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Open'))
            },
            { updates: { status: 'open' } },
            'status',
        ],
        [
            JobType.UpdateTicket,
            'assign to me button click',
            (state) => ({
                ...state,
                currentUser: fromJS({
                    id: 1,
                    name: 'Foo',
                }),
            }),
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Assign to me'))
            },
            {
                updates: {
                    assignee_user: {
                        id: 1,
                        name: 'Foo',
                    },
                },
            },
            'assignee_user',
        ],
        [
            JobType.UpdateTicket,
            'assign to user dropdown item click',
            (state) => ({
                ...state,
                agents: fromJS({
                    all: [
                        {
                            id: 1,
                            name: 'John Doe',
                        },
                    ],
                }),
            }),
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('John Doe'))
            },
            {
                updates: {
                    assignee_user: {
                        id: 1,
                        name: 'John Doe',
                    },
                },
            },
            'assignee_user',
        ],
        [
            JobType.UpdateTicket,
            'clear assignee dropdown item click',
            (state) => state,
            (props) => props,
            ({ getAllByText }) => {
                fireEvent.click(getAllByText('Clear assignee')[0])
            },
            {
                updates: {
                    assignee_user: null,
                },
            },
            'assignee_user',
        ],
        [
            JobType.UpdateTicket,
            'assign to team dropdown item click',
            (state) => ({
                ...state,
                teams: fromJS({
                    all: [
                        {
                            id: 1,
                            name: 'Team Sports',
                        },
                    ],
                }),
            }),
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Team Sports'))
            },
            {
                updates: {
                    assignee_team_id: 1,
                },
            },
            'assignee_team_id',
        ],
        [
            JobType.UpdateTicket,
            'clear team assignee dropdown item click',
            (state) => state,
            (props) => props,
            ({ getAllByText }) => {
                fireEvent.click(getAllByText('Clear assignee')[1])
            },
            {
                updates: {
                    assignee_team_id: null,
                },
            },
            'assignee_team_id',
        ],
        [
            JobType.UpdateTicket,
            'add tag dropdown item click',
            (state) => state,
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Add tag'))
                fireEvent.click(getByText('TagDropdownMenuMock'))
            },
            {
                updates: {
                    tags: ['tag added'],
                },
            },
            'tags',
        ],
        [
            JobType.UpdateTicket,
            'undelete dropdown item click',
            (state) => ({
                ...state,
                views: fromJS({
                    active: (state.views.get('active') as Map<any, any>).merge({
                        filters: 'isNotEmpty(ticket.trashed_datetime)',
                    }),
                }),
            }),
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Undelete'))
            },
            {
                updates: {
                    trashed_datetime: null,
                },
            },
            'untrash',
        ],
        [
            JobType.DeleteTicket,
            'delete forever dropdown item click',
            (state) => ({
                ...state,
                views: fromJS({
                    active: (state.views.get('active') as Map<any, any>).merge({
                        filters: 'isNotEmpty(ticket.trashed_datetime)',
                    }),
                }),
            }),
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Delete forever'))
                fireEvent.click(getByText('Confirm'))
            },
            {},
            'delete',
        ],
        [
            JobType.UpdateTicket,
            'delete dropdown item click',
            (state) => state,
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Delete'))
                fireEvent.click(getByText('Confirm'))
            },
            {
                updates: {
                    trashed_datetime: expect.anything(),
                },
            },
            'trash',
        ],
        [
            JobType.UpdateTicket,
            'open ticket shortcut',
            (state) => state,
            (props) => props,
            () => {
                hitShortcut('OPEN_TICKET')
            },
            {
                updates: { status: 'open' },
            },
            'status',
        ],
        [
            JobType.UpdateTicket,
            'close ticket shortcut',
            (state) => state,
            (props) => props,
            () => {
                hitShortcut('CLOSE_TICKET')
            },
            {
                updates: { status: 'closed' },
            },
            'status',
        ],
        [
            JobType.UpdateTicket,
            'mark as read dropdown item click',
            (state) => ({
                ...state,
                tickets: fromJS({
                    items: [
                        {
                            ...ticket,
                            id: 1,
                            is_unread: true,
                        },
                    ],
                }),
            }),
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Mark as read'))
            },
            {
                updates: {
                    is_unread: false,
                },
            },
            'is_unread',
        ],
        [
            JobType.UpdateTicket,
            'mark as unread dropdown item click',
            (state) => ({
                ...state,
                tickets: fromJS({
                    items: [
                        {
                            ...ticket,
                            id: 1,
                            is_unread: false,
                        },
                    ],
                }),
            }),
            (props) => props,
            ({ getByText }) => {
                fireEvent.click(getByText('Mark as unread'))
            },
            {
                updates: {
                    is_unread: true,
                },
            },
            'is_unread',
        ],
        [
            JobType.UpdateTicket,
            'mark tickets read shortcut',
            (state) => ({
                ...state,
                tickets: fromJS({
                    items: [
                        {
                            ...ticket,
                            id: 1,
                            is_unread: true,
                        },
                    ],
                }),
            }),
            (props) => props,
            () => {
                hitShortcut('MARK_TICKET_READ')
            },
            {
                updates: {
                    is_unread: false,
                },
            },
            'is_unread',
        ],
        [
            JobType.UpdateTicket,
            'mark tickets unread shortcut',
            (state) => ({
                ...state,
                tickets: fromJS({
                    items: [
                        {
                            ...ticket,
                            id: 1,
                            is_unread: false,
                        },
                    ],
                }),
            }),
            (props) => props,
            () => {
                hitShortcut('MARK_TICKET_UNREAD')
            },
            {
                updates: {
                    is_unread: true,
                },
            },
            'is_unread',
        ],
    ] as CreateJobTestSuite[])(
        'create %s job on %s',
        (
            jobType,
            suiteName,
            getState,
            getTestProps,
            testActions,
            jobParams,
            eventName,
        ) => {
            const suiteProps = getTestProps({
                ...props,
                selectedItemsIds: fromJS([1]),
            })
            const store = mockStore(getState(state as RootState))

            it(`should create ${jobType} ticket job`, async () => {
                const renderResult = render(
                    <Provider store={store}>
                        <TicketListActions {...suiteProps} />
                    </Provider>,
                )

                await testActions(renderResult)

                expect(mockedCreateJobTicket).toHaveBeenLastCalledWith(
                    suiteProps.selectedItemsIds,
                    jobType,
                    jobParams,
                )
                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.BulkAction,
                    {
                        type: eventName,
                        location: 'full-width-mode',
                        ...('is_unread' === eventName || 'status' === eventName
                            ? { value: jobParams.updates[eventName] }
                            : {}),
                    },
                )
            })

            it(`should create ${jobType} view job when all view items are selected`, async () => {
                const newState = getState({
                    ...(state as RootState),
                    views: fromJS({
                        active: (
                            (state as RootState).views.get('active') as Map<
                                any,
                                any
                            >
                        ).merge({
                            allItemsSelected: true,
                        }),
                    }),
                })

                const renderResult = render(
                    <Provider store={mockStore(newState)}>
                        <TicketListActions {...suiteProps} />
                    </Provider>,
                )

                await testActions(renderResult)

                expect(mockedCreateJobView).toHaveBeenLastCalledWith(
                    newState.views.get('active'),
                    jobType,
                    jobParams,
                )
            })

            it('should disable buttons when job is being created', async () => {
                mockedCreateJobTicket.mockImplementation((() => {
                    return new Promise(_noop)
                }) as any)
                const renderResult = render(
                    <Provider store={store}>
                        <TicketListActions {...suiteProps} />
                    </Provider>,
                )

                void testActions(renderResult)

                await waitFor(() => {
                    void expectAllActionsToHaveEnabledState(renderResult, false)
                })
            })

            it('should enable buttons when job was created', async () => {
                const renderResult = render(
                    <Provider store={store}>
                        <TicketListActions {...suiteProps} />
                    </Provider>,
                )

                await testActions(renderResult)

                await waitFor(() => {
                    void expectAllActionsToHaveEnabledState(renderResult, true)
                })
            })

            it('should deselect all items', async () => {
                mockedCreateJobTicket.mockImplementation((() => {
                    return new Promise(_noop)
                }) as any)

                const renderResult = render(
                    <Provider store={store}>
                        <TicketListActions {...suiteProps} />
                    </Provider>,
                )

                await testActions(renderResult)

                expect(mockedUpdateSelectedItemsIds).toHaveBeenLastCalledWith(
                    fromJS([]),
                )
            })
        },
    )

    it('should call openMacroModal on Apply macro dropdown item click', async () => {
        const user = userEvent.setup()

        render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        await act(async () => {
            await user.click(screen.getByText('More'))
        })

        fireEvent.click(screen.getByText('Apply macro'))

        expect(props.openMacroModal).toHaveBeenLastCalledWith(expect.anything())
    })

    describe('read and unread tickets selected', () => {
        const newState = {
            ...state,
            tickets: fromJS({
                items: [
                    {
                        ...ticket,
                        id: 1,
                        is_unread: true,
                    },
                    {
                        ...ticket,
                        id: 2,
                        is_unread: false,
                    },
                ],
            }),
        }

        it('should render mark as read and mark as unread dropdown items', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1, 2])}
                    />
                </Provider>,
            )

            await act(async () => {
                await user.click(screen.getByText('More'))
            })

            expect(screen.queryByText('Mark as read')).not.toBe(null)
            expect(screen.queryByText('Mark as unread')).not.toBe(null)
        })

        it('should render mark as read and mark as unread dropdown items when all view items selected', async () => {
            const user = userEvent.setup()

            render(
                <Provider
                    store={mockStore({
                        ...newState,
                        views: fromJS({
                            active: {
                                id: 888,
                                allItemsSelected: true,
                                filters: '',
                            },
                        }),
                    })}
                >
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1, 2])}
                    />
                </Provider>,
            )

            await act(async () => {
                await user.click(screen.getByText('More'))
            })

            expect(screen.queryByText('Mark as read')).not.toBe(null)
            expect(screen.queryByText('Mark as unread')).not.toBe(null)
        })

        it('should create a job on mark as read shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1, 2])}
                    />
                </Provider>,
            )

            hitShortcut('MARK_TICKET_READ')

            expect(shortcutEventMock.preventDefault).toHaveBeenCalled()
            expect(mockedCreateJobTicket).toHaveBeenCalled()
        })

        it('should create a job on mark as unread shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1, 2])}
                    />
                </Provider>,
            )

            hitShortcut('MARK_TICKET_UNREAD')

            expect(shortcutEventMock.preventDefault).toHaveBeenCalled()
            expect(mockedCreateJobTicket).toHaveBeenCalled()
        })
    })

    describe('only unread tickets selected', () => {
        const newState = {
            ...state,
            tickets: fromJS({
                items: [
                    {
                        ...ticket,
                        id: 1,
                        is_unread: true,
                    },
                ],
            }),
        }

        it('should render mark as read dropdown item', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            await act(async () => {
                await user.click(screen.getByText('More'))
            })

            expect(screen.queryByText('Mark as read')).not.toBe(null)
            expect(screen.queryByText('Mark as unread')).toBe(null)
        })

        it('should render mark as read and mark as unread dropdown items when all view items selected', async () => {
            const user = userEvent.setup()

            render(
                <Provider
                    store={mockStore({
                        ...newState,
                        views: fromJS({
                            active: {
                                id: 888,
                                allItemsSelected: true,
                                filters: '',
                            },
                        }),
                    })}
                >
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            await act(async () => {
                await user.click(screen.getByText('More'))
            })

            expect(screen.queryByText('Mark as read')).not.toBe(null)
            expect(screen.queryByText('Mark as unread')).not.toBe(null)
        })

        it('should create a job on mark as read shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            hitShortcut('MARK_TICKET_READ')

            expect(shortcutEventMock.preventDefault).toHaveBeenCalled()
            expect(mockedCreateJobTicket).toHaveBeenCalled()
        })

        it('should not create a job on mark as unread shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            hitShortcut('MARK_TICKET_UNREAD')

            expect(shortcutEventMock.preventDefault).not.toHaveBeenCalled()
            expect(mockedCreateJobTicket).not.toHaveBeenCalled()
        })
    })

    describe('only read tickets selected', () => {
        const newState = {
            ...state,
            tickets: fromJS({
                items: [
                    {
                        ...ticket,
                        id: 1,
                        is_unread: false,
                    },
                ],
            }),
        }

        it('should render mark as read dropdown item', async () => {
            const user = userEvent.setup()

            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            await act(async () => {
                await user.click(screen.getByText('More'))
            })

            expect(screen.queryByText('Mark as read')).toBe(null)
            expect(screen.queryByText('Mark as unread')).not.toBe(null)
        })

        it('should render mark as read and mark as unread dropdown items when all view items selected', async () => {
            const user = userEvent.setup()

            render(
                <Provider
                    store={mockStore({
                        ...newState,
                        views: fromJS({
                            active: {
                                id: 888,
                                allItemsSelected: true,
                                filters: '',
                            },
                        }),
                    })}
                >
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            await act(async () => {
                await user.click(screen.getByText('More'))
            })

            expect(screen.queryByText('Mark as read')).not.toBe(null)
            expect(screen.queryByText('Mark as unread')).not.toBe(null)
        })

        it('should not create a job on mark as read shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions {...props} />
                </Provider>,
            )

            hitShortcut('MARK_TICKET_READ')

            expect(shortcutEventMock.preventDefault).not.toHaveBeenCalled()
            expect(mockedCreateJobTicket).not.toHaveBeenCalled()
        })

        it('should create a job on mark as unread shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>,
            )

            hitShortcut('MARK_TICKET_UNREAD')

            expect(shortcutEventMock.preventDefault).toHaveBeenCalled()
            expect(mockedCreateJobTicket).toHaveBeenCalled()
        })
    })

    it('should render mark as read dropdown item when only unread tickets are selected', async () => {
        const user = userEvent.setup()

        render(
            <Provider
                store={mockStore({
                    ...state,
                    tickets: fromJS({
                        items: [
                            {
                                ...ticket,
                                id: 1,
                                is_unread: true,
                            },
                        ],
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        await act(async () => {
            await user.click(screen.getByText('More'))
        })

        expect(screen.queryByText('Mark as read')).not.toBe(null)
        expect(screen.queryByText('Mark as unread')).toBe(null)
    })

    it('should render mark as unread dropdown item when only read tickets are selected', async () => {
        const user = userEvent.setup()

        render(
            <Provider
                store={mockStore({
                    ...state,
                    tickets: fromJS({
                        items: [
                            {
                                ...ticket,
                                id: 1,
                                is_unread: false,
                            },
                        ],
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>,
        )

        await act(async () => {
            await user.click(screen.getByText('More'))
        })

        expect(screen.queryByText('Mark as read')).toBe(null)
        expect(screen.queryByText('Mark as unread')).not.toBe(null)
    })
})
