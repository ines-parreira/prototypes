import React, {ComponentProps} from 'react'
import {fromJS, List, Map} from 'immutable'
import {
    fireEvent,
    render,
    RenderResult,
    waitFor,
    within,
} from '@testing-library/react'
import _noop from 'lodash/noop'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import {logEvent, SegmentEvent} from 'common/segment'
import {UserRole} from 'config/types/user'
import {ticket} from 'fixtures/ticket'
import {user} from 'fixtures/users'
import {JobType} from 'models/job/types'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {createJob as createJobTicket} from 'state/tickets/actions'
import {
    createJob as createJobView,
    fieldEnumSearch,
    updateSelectedItemsIds,
} from 'state/views/actions'
import {RootState, StoreState} from 'state/types'
import {assumeMock, makeExecuteKeyboardAction} from 'utils/testing'

import {
    SHORTCUT_MANAGER_COMPONENT_NAME,
    TicketListActions,
} from '../TicketListActions'

jest.mock('services/shortcutManager/shortcutManager')
jest.mock('state/views/actions')
jest.mock('state/tickets/actions')
jest.mock('pages/history')
jest.mock('common/segment')

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockedCreateJobTicket = assumeMock(createJobTicket)
const mockedCreateJobView = assumeMock(createJobView)
const mockedFieldEnumSearch = assumeMock(fieldEnumSearch)
const mockedUpdateSelectedItemsIds = assumeMock(updateSelectedItemsIds)

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>
const shortcutEventMock = {
    preventDefault: jest.fn(),
} as unknown as jest.Mocked<Event>
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

const mockStore = configureMockStore()

describe('TicketListActions component', () => {
    const state = {
        agents: fromJS({all: []}),
        currentUser: fromJS(user),
        teams: fromJS({all: []}),
        tickets: fromJS({items: []}),
        views: fromJS({
            active: {id: 888, filters: ''},
        }),
    }
    const store = mockStore(state)
    const props = {
        selectedItemsIds: fromJS([]) as List<any>,
        openMacroModal: jest.fn(),
    }

    const expectAllActionsToHaveEnabledState = async (
        {getAllByRole}: RenderResult,
        isEnabled: boolean
    ) => {
        const buttons = getAllByRole('button')
        for (const button of buttons) {
            if (isEnabled) {
                expect(button).toHaveAttribute('aria-disabled', 'false')
            } else {
                await waitFor(() =>
                    expect(button).toHaveAttribute('aria-disabled', 'true')
                )
            }
        }
    }

    const hitShortcut = makeExecuteKeyboardAction(
        shortcutManagerMock,
        shortcutEventMock
    )

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render enabled buttons when some tickets are selected', async () => {
        const renderResult = render(
            <Provider store={store}>
                <TicketListActions
                    {...props}
                    selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                />
            </Provider>
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
            {views: fromJS({active: {id: 111, filters: ", '')"}})},
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
            props: ComponentProps<typeof TicketListActions>
        ) => {
            const renderResult = render(
                <Provider store={mockStore({...state, ...customState})}>
                    <TicketListActions {...props} />
                </Provider>
            )

            await expectAllActionsToHaveEnabledState(renderResult, false)
        }
    )

    it('should render teams in assign team dropdown', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...state,
                    teams: fromJS({
                        all: [
                            {id: 4, name: 'foo'},
                            {id: 5, name: 'bar'},
                            {id: 6, name: 'baz'},
                        ],
                    }),
                })}
            >
                <TicketListActions
                    {...props}
                    selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render agents options in assign agent dropdown', () => {
        const {container} = render(
            <Provider
                store={mockStore({
                    ...state,
                    agents: fromJS({
                        all: [
                            {id: 4, name: 'foo'},
                            {id: 5, name: 'bar'},
                            {id: 6, name: 'baz'},
                        ],
                    }),
                })}
            >
                <TicketListActions
                    {...props}
                    selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the delete action for lead and admin agents', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.Agent},
                    }),
                })}
            >
                <TicketListActions {...props} />
            </Provider>
        )

        expect(getByText('Delete')).toBeInTheDocument()
    })

    it('should render the special actions for lead and admin agents', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.Agent},
                    }),
                    views: fromJS({
                        active: {
                            id: 888,
                            filters: 'isNotEmpty(ticket.trashed_datetime)',
                        },
                    }),
                })}
            >
                <TicketListActions {...props} />
            </Provider>
        )

        expect(getByText('Delete forever')).toBeInTheDocument()
        expect(getByText('Undelete')).toBeInTheDocument()
    })

    it('should not render the delete button for basic, lite and observer agents', () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.LiteAgent},
                    }),
                })}
            >
                <TicketListActions {...props} />
            </Provider>
        )

        expect(queryByText('Delete')).not.toBeInTheDocument()
    })

    it('should render export tickets button for agents', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.Agent},
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([])} />
            </Provider>
        )

        expect(getByText('Export tickets')).toBeInTheDocument()
    })

    it('should not render export tickets button for lite agents', () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.LiteAgent},
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([])} />
            </Provider>
        )

        expect(queryByText('Export tickets')).not.toBeInTheDocument()
    })

    it('should send event to segment on click export tickets button', () => {
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.Agent},
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([])} />
            </Provider>
        )

        fireEvent.click(getByText(/Export tickets/))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TicketExport,
            expect.objectContaining({
                type: 'bulk-action-export',
            })
        )
    })

    it('should bind keyboard shortcuts on mount', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>
        )

        expect(shortcutManagerMock.bind).toHaveBeenCalled()
        const [[component, actions]] = shortcutManagerMock.bind.mock.calls
        expect(component).toBe(SHORTCUT_MANAGER_COMPONENT_NAME)
        expect(Object.keys(actions!)).toMatchSnapshot()
    })

    it('should unbind keyboard shortcuts on mount', () => {
        const {unmount} = render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>
        )

        unmount()

        expect(shortcutManagerMock.unbind).toHaveBeenLastCalledWith(
            SHORTCUT_MANAGER_COMPONENT_NAME
        )
    })

    it('should open agents dropdown on open assignee shortcut', () => {
        const {getByRole} = render(
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
            </Provider>
        )

        hitShortcut('OPEN_ASSIGNEE')

        const expendedMenu = getByRole('menu', {hidden: false})
        expect(within(expendedMenu).queryByText('John Doe')).not.toBe(null)
        expect(shortcutEventMock.preventDefault).toHaveBeenLastCalledWith()
    })

    it('should not open agents dropdown on open assignee shortcut when no selected items', () => {
        const {queryByRole} = render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>
        )

        hitShortcut('OPEN_ASSIGNEE')

        expect(queryByRole('menu', {hidden: false})).toBe(null)
    })

    it('should close agents dropdown on hide popover shortcut', () => {
        const {queryByRole} = render(
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
            </Provider>
        )

        hitShortcut('OPEN_ASSIGNEE')
        hitShortcut('HIDE_POPOVER')

        expect(queryByRole('menu', {hidden: false})).toBe(null)
    })

    it('should open tags dropdown on open tags shortcut', async () => {
        mockedFieldEnumSearch.mockReturnValue(() =>
            Promise.resolve(
                fromJS([
                    {
                        id: 1,
                        name: 'refund',
                    },
                ]) as List<any>
            )
        )
        const {getByRole} = render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>
        )

        hitShortcut('OPEN_TAGS')
        const expendedMenu = getByRole('menu', {hidden: false})
        await waitFor(() => {
            expect(within(expendedMenu).queryByText('refund')).not.toBe(null)
        })

        expect(shortcutEventMock.preventDefault).toHaveBeenLastCalledWith()
    })

    it('should not open tags dropdown on open tags shortcut when no selected items', () => {
        const {queryByRole} = render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>
        )

        hitShortcut('OPEN_TAGS')

        expect(queryByRole('menu', {hidden: false})).toBe(null)
    })

    it('should close tags dropdown on hide popover shortcut', async () => {
        mockedFieldEnumSearch.mockReturnValue(() =>
            Promise.resolve(
                fromJS([
                    {
                        id: 1,
                        name: 'refund',
                    },
                ]) as List<any>
            )
        )
        const {getByRole, queryByRole} = render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>
        )

        hitShortcut('OPEN_TAGS')
        const expendedMenu = getByRole('menu', {hidden: false})
        await waitFor(() => {
            expect(within(expendedMenu).queryByText('refund')).not.toBe(null)
        })
        hitShortcut('HIDE_POPOVER')

        expect(queryByRole('menu', {hidden: false})).toBe(null)
    })

    it('should call openMacroModal on open macro shortcut', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>
        )

        hitShortcut('OPEN_MACRO')

        expect(props.openMacroModal).toHaveBeenLastCalledWith()
    })

    it('should not call openMacroModal on open macro shortcut when no selected items', () => {
        render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>
        )

        hitShortcut('OPEN_MACRO')

        expect(props.openMacroModal).not.toHaveBeenCalled()
    })

    it('should show delete confirmation on delete ticket shortcut', () => {
        const {queryByText} = render(
            <Provider store={store}>
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>
        )

        hitShortcut('DELETE_TICKET')

        expect(queryByText(/Are you sure you want to delete/)).not.toBe(null)
    })

    it('should not show delete confirmation on delete ticket shortcut when no selected items', () => {
        const {queryByText} = render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>
        )

        hitShortcut('DELETE_TICKET')

        expect(queryByText(/Are you sure you want to delete/)).toBe(null)
    })

    it("should not show delete confirmation on delete ticket shortcut when the user's role is basic, lite or observer", () => {
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.LiteAgent},
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>
        )

        hitShortcut('DELETE_TICKET')

        expect(queryByText(/Are you sure you want to delete/)).toBe(null)
    })

    type CreateJobTestSuite = [
        JobType,
        string,
        (state: StoreState) => StoreState,
        (
            props: ComponentProps<typeof TicketListActions>
        ) => ComponentProps<typeof TicketListActions>,
        (renderResult: RenderResult) => void | Promise<void>,
        {updates: any}
    ]

    describe.each([
        [
            JobType.UpdateTicket,
            'close button click',
            (state) => state,
            (props) => props,
            ({getByText}) => {
                fireEvent.click(getByText('Close'))
            },
            {updates: {status: 'closed'}},
        ],
        [
            JobType.UpdateTicket,
            'open dropdown item click',
            (state) => state,
            (props) => props,
            ({getByText}) => {
                fireEvent.click(getByText('Open'))
            },
            {updates: {status: 'open'}},
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
            ({getByText}) => {
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
            ({getByText}) => {
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
        ],
        [
            JobType.UpdateTicket,
            'clear assignee dropdown item click',
            (state) => state,
            (props) => props,
            ({getAllByText}) => {
                fireEvent.click(getAllByText('Clear assignee')[0])
            },
            {
                updates: {
                    assignee_user: null,
                },
            },
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
            ({getByText}) => {
                fireEvent.click(getByText('Team Sports'))
            },
            {
                updates: {
                    assignee_team_id: 1,
                },
            },
        ],
        [
            JobType.UpdateTicket,
            'clear team assignee dropdown item click',
            (state) => state,
            (props) => props,
            ({getAllByText}) => {
                fireEvent.click(getAllByText('Clear assignee')[1])
            },
            {
                updates: {
                    assignee_team_id: null,
                },
            },
        ],
        [
            JobType.UpdateTicket,
            'add tag dropdown item click',
            (state) => state,
            (props) => props,
            async ({getByText}) => {
                fireEvent.click(getByText('Add tag'))
                await waitFor(() => getByText('refund'))
                fireEvent.click(getByText('refund'))
            },
            {
                updates: {
                    tags: ['refund'],
                },
            },
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
            ({getByText}) => {
                fireEvent.click(getByText('Undelete'))
            },
            {
                updates: {
                    trashed_datetime: null,
                },
            },
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
            ({getByText}) => {
                fireEvent.click(getByText('Delete forever'))
                fireEvent.click(getByText('Confirm'))
            },
            {},
        ],
        [
            JobType.UpdateTicket,
            'delete dropdown item click',
            (state) => state,
            (props) => props,
            ({getByText}) => {
                fireEvent.click(getByText('Delete'))
                fireEvent.click(getByText('Confirm'))
            },
            {
                updates: {
                    trashed_datetime: expect.anything(),
                },
            },
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
                updates: {status: 'open'},
            },
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
                updates: {status: 'closed'},
            },
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
            ({getByText}) => {
                fireEvent.click(getByText('Mark as read'))
            },
            {
                updates: {
                    is_unread: false,
                },
            },
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
            ({getByText}) => {
                fireEvent.click(getByText('Mark as unread'))
            },
            {
                updates: {
                    is_unread: true,
                },
            },
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
        ],
    ] as CreateJobTestSuite[])(
        'create %s job on %s',
        (
            jobType,
            suiteName,
            getState,
            getTestProps,
            testActions,
            jobParams
        ) => {
            const suiteProps = getTestProps({
                ...props,
                selectedItemsIds: fromJS([1]),
            })
            const store = mockStore(getState(state as RootState))

            beforeEach(() => {
                mockedFieldEnumSearch.mockReturnValue(() =>
                    Promise.resolve(
                        fromJS([
                            {
                                id: 1,
                                name: 'refund',
                            },
                        ]) as List<any>
                    )
                )
            })

            it(`should create ${jobType} ticket job`, async () => {
                const renderResult = render(
                    <Provider store={store}>
                        <TicketListActions {...suiteProps} />
                    </Provider>
                )

                await testActions(renderResult)

                expect(mockedCreateJobTicket).toHaveBeenLastCalledWith(
                    suiteProps.selectedItemsIds,
                    jobType,
                    jobParams
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
                    </Provider>
                )

                await testActions(renderResult)

                expect(mockedCreateJobView).toHaveBeenLastCalledWith(
                    newState.views.get('active'),
                    jobType,
                    jobParams
                )
            })

            it('should disable buttons when job is being created', async () => {
                mockedCreateJobTicket.mockImplementation((() => {
                    return new Promise(_noop)
                }) as any)
                const renderResult = render(
                    <Provider store={store}>
                        <TicketListActions {...suiteProps} />
                    </Provider>
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
                    </Provider>
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
                    </Provider>
                )

                await testActions(renderResult)

                expect(mockedUpdateSelectedItemsIds).toHaveBeenLastCalledWith(
                    fromJS([])
                )
            })
        }
    )

    it('should call openMacroModal on Apply macro dropdown item click', () => {
        const {getByText} = render(
            <Provider store={store}>
                <TicketListActions {...props} />
            </Provider>
        )

        fireEvent.click(getByText('Apply macro'))

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

        it('should render mark as read and mark as unread dropdown items', () => {
            const {queryByText} = render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1, 2])}
                    />
                </Provider>
            )

            expect(queryByText('Mark as read')).not.toBe(null)
            expect(queryByText('Mark as unread')).not.toBe(null)
        })

        it('should render mark as read and mark as unread dropdown items when all view items selected', () => {
            const {queryByText} = render(
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
                </Provider>
            )

            expect(queryByText('Mark as read')).not.toBe(null)
            expect(queryByText('Mark as unread')).not.toBe(null)
        })

        it('should create a job on mark as read shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1, 2])}
                    />
                </Provider>
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
                </Provider>
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

        it('should render mark as read dropdown item', () => {
            const {queryByText} = render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>
            )

            expect(queryByText('Mark as read')).not.toBe(null)
            expect(queryByText('Mark as unread')).toBe(null)
        })

        it('should render mark as read and mark as unread dropdown items when all view items selected', () => {
            const {queryByText} = render(
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
                </Provider>
            )

            expect(queryByText('Mark as read')).not.toBe(null)
            expect(queryByText('Mark as unread')).not.toBe(null)
        })

        it('should create a job on mark as read shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>
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
                </Provider>
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

        it('should render mark as read dropdown item', () => {
            const {queryByText} = render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions
                        {...props}
                        selectedItemsIds={fromJS([1])}
                    />
                </Provider>
            )

            expect(queryByText('Mark as read')).toBe(null)
            expect(queryByText('Mark as unread')).not.toBe(null)
        })

        it('should render mark as read and mark as unread dropdown items when all view items selected', () => {
            const {queryByText} = render(
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
                    <TicketListActions {...props} />
                </Provider>
            )

            expect(queryByText('Mark as read')).not.toBe(null)
            expect(queryByText('Mark as unread')).not.toBe(null)
        })

        it('should not create a job on mark as read shortcut', () => {
            render(
                <Provider store={mockStore(newState)}>
                    <TicketListActions {...props} />
                </Provider>
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
                </Provider>
            )

            hitShortcut('MARK_TICKET_UNREAD')

            expect(shortcutEventMock.preventDefault).toHaveBeenCalled()
            expect(mockedCreateJobTicket).toHaveBeenCalled()
        })
    })

    it('should render mark as read dropdown item when only unread tickets are selected', () => {
        const {queryByText} = render(
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
            </Provider>
        )

        expect(queryByText('Mark as read')).not.toBe(null)
        expect(queryByText('Mark as unread')).toBe(null)
    })

    it('should render mark as unread dropdown item when only read tickets are selected', () => {
        const {queryByText} = render(
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
            </Provider>
        )

        expect(queryByText('Mark as read')).toBe(null)
        expect(queryByText('Mark as unread')).not.toBe(null)
    })

    it('should allow tag creation for lead and admin agents', async () => {
        mockedFieldEnumSearch.mockReturnValue(() =>
            Promise.resolve(fromJS([]) as List<any>)
        )
        const {getByText, getByPlaceholderText, findByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.Agent},
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>
        )

        fireEvent.click(getByText('Add tag'))
        fireEvent.change(getByPlaceholderText(/Search tags/i), {
            target: {value: 'Foo'},
        })
        expect(await findByText(/Create/i)).toBeTruthy()
    })

    it('should prevent tag creation for low-level agents', async () => {
        mockedFieldEnumSearch.mockReturnValue(() =>
            Promise.resolve(fromJS([]) as List<any>)
        )

        const {getByText, getByPlaceholderText, findByText} = render(
            <Provider
                store={mockStore({
                    ...state,
                    currentUser: fromJS({
                        id: 1,
                        name: 'Peter Parker',
                        role: {id: 1, name: UserRole.BasicAgent},
                    }),
                })}
            >
                <TicketListActions {...props} selectedItemsIds={fromJS([1])} />
            </Provider>
        )

        fireEvent.click(getByText('Add tag'))
        fireEvent.change(getByPlaceholderText(/Search tags/i), {
            target: {value: 'Foo'},
        })

        expect(await findByText(/Couldn't find the tag: Foo/i)).toBeTruthy()
    })
})
