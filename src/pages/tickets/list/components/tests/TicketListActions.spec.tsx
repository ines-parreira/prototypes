import React, {ComponentProps} from 'react'
import {fromJS, Map, List} from 'immutable'
import {
    act,
    fireEvent,
    render,
    RenderResult,
    waitFor,
    within,
} from '@testing-library/react'
import _noop from 'lodash/noop'

import {initialState as currentUser} from '../../../../../state/currentUser/reducers'
import {TicketListActionsContainer} from '../TicketListActions'
import {LITE_AGENT_ROLE, AGENT_ROLE} from '../../../../../config/user'
import * as viewsActions from '../../../../../state/views/actions'
import * as ticketsActions from '../../../../../state/tickets/actions.js'
import {JobType} from '../../../../../models/job/types'
import shortcutManager from '../../../../../services/shortcutManager/shortcutManager'
import history from '../../../../history'

jest.mock('../../../../../services/shortcutManager/shortcutManager')
jest.mock('../../../../../state/views/actions')
jest.mock('../../../../../state/tickets/actions.js')
jest.mock('../../../../history')

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>
const viewsActionsMock = viewsActions as jest.Mocked<typeof viewsActions>
const ticketsActionsMock = ticketsActions as jest.Mocked<typeof ticketsActions>
const shortcutEventMock = ({
    preventDefault: jest.fn(),
} as unknown) as jest.Mocked<Event>
const historyMock = history as jest.Mocked<typeof history>
const fieldEnumSearchCancellableMock = jest.fn()

describe('TicketListActions component', () => {
    const minProps: ComponentProps<typeof TicketListActionsContainer> = {
        currentUser,
        areFiltersValid: true,
        isActiveViewTrashView: false,
        allViewItemsSelected: false,
        activeView: fromJS({}) as Map<any, any>,
        agents: fromJS([]) as List<any>,
        teams: fromJS([]) as List<any>,
        view: fromJS({}) as Map<any, any>,
        selectedItemsIds: fromJS([]) as List<any>,
        getViewCount: jest.fn(),
        openMacroModal: jest.fn(),
        fieldEnumSearchCancellable: fieldEnumSearchCancellableMock,
        cancelFieldEnumSearchCancellable: jest.fn(),
        actions: {
            views: viewsActionsMock,
            tickets: ticketsActionsMock,
        },
    }

    const expectAllActionsToHaveEnabledState = (
        {getAllByRole}: RenderResult,
        isEnabled: boolean
    ) => {
        const buttons = getAllByRole('button')
        for (const button of buttons) {
            if (isEnabled) {
                expect(button.classList).not.toContain('disabled')
            } else {
                expect(button.classList).toContain('disabled')
            }
        }
    }

    const hitShortcut = (shortcutName: string) => {
        const [[, actions]] = shortcutManagerMock.bind.mock.calls
        act(() => {
            ;(actions![shortcutName].action as (event: Event) => void)(
                shortcutEventMock
            )
        })
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render enabled buttons when some tickets are selected', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [
            'nothing is selected',
            {
                ...minProps,
                selectedItemsIds: fromJS([]),
                areFiltersValid: true,
            },
        ],
        [
            'filters are not valid',
            {
                ...minProps,
                selectedItemsIds: fromJS([1, 2, 3, 4, 5]),
                areFiltersValid: false,
            },
        ],
    ])(
        'should render disabled buttons when %s',
        (
            testName,
            props: ComponentProps<typeof TicketListActionsContainer>
        ) => {
            const renderResult = render(
                <TicketListActionsContainer {...props} />
            )

            expectAllActionsToHaveEnabledState(renderResult, false)
        }
    )

    it('should render teams in assign team dropdown', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                teams={fromJS([
                    {id: 4, name: 'foo'},
                    {id: 5, name: 'bar'},
                    {id: 6, name: 'baz'},
                ])}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render agents options in assign agent dropdown', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1, 2, 3, 4, 5])}
                agents={fromJS([
                    {id: 4, name: 'foo'},
                    {id: 5, name: 'bar'},
                    {id: 6, name: 'baz'},
                ])}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render special actions for trash view', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
                isActiveViewTrashView={true}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render export tickets button for agents', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
                currentUser={fromJS({
                    id: 1,
                    name: 'Peter Parker',
                    roles: [{id: 1, name: AGENT_ROLE}],
                })}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not render export tickets button for lite agents', () => {
        const {container} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([])}
                currentUser={fromJS({
                    id: 1,
                    name: 'Peter Parker',
                    roles: [{id: 2, name: LITE_AGENT_ROLE}],
                })}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should bind keyboard shortcuts on mount', () => {
        render(<TicketListActionsContainer {...minProps} />)

        expect(shortcutManagerMock.bind).toHaveBeenCalled()
        const [[component, actions]] = shortcutManagerMock.bind.mock.calls
        expect(component).toBe('TicketListActions')
        expect(Object.keys(actions!)).toMatchSnapshot()
    })

    it('should unbind keyboard shortcuts on mount', () => {
        const {unmount} = render(<TicketListActionsContainer {...minProps} />)

        unmount()

        expect(shortcutManagerMock.unbind).toHaveBeenLastCalledWith(
            'TicketListActions'
        )
    })

    it('should redirect to new ticket page on create ticket shortcut', () => {
        render(<TicketListActionsContainer {...minProps} />)

        hitShortcut('CREATE_TICKET')

        expect(shortcutEventMock.preventDefault).toHaveBeenLastCalledWith()
        expect(historyMock.push).toHaveBeenLastCalledWith('/app/ticket/new')
    })

    it('should open agents dropdown on open assignee shortcut', () => {
        const {getByRole} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1])}
                agents={fromJS([
                    {
                        id: 1,
                        name: 'John Doe',
                    },
                ])}
            />
        )

        hitShortcut('OPEN_ASSIGNEE')

        const expendedMenu = getByRole('menu', {hidden: false})
        expect(within(expendedMenu).queryByText('John Doe')).not.toBe(null)
        expect(shortcutEventMock.preventDefault).toHaveBeenLastCalledWith()
    })

    it('should not open agents dropdown on open assignee shortcut when no selected items', () => {
        const {queryByRole} = render(
            <TicketListActionsContainer {...minProps} />
        )

        hitShortcut('OPEN_ASSIGNEE')

        expect(queryByRole('menu', {hidden: false})).toBe(null)
    })

    it('should close agents dropdown on hide popover shortcut', () => {
        const {queryByRole} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1])}
                agents={fromJS([
                    {
                        id: 1,
                        name: 'John Doe',
                    },
                ])}
            />
        )

        hitShortcut('OPEN_ASSIGNEE')
        hitShortcut('HIDE_POPOVER')

        expect(queryByRole('menu', {hidden: false})).toBe(null)
    })

    it('should open tags dropdown on open tags shortcut', async () => {
        fieldEnumSearchCancellableMock.mockResolvedValue(
            fromJS([
                {
                    id: 1,
                    name: 'refund',
                },
            ])
        )
        const {getByRole} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1])}
            />
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
            <TicketListActionsContainer {...minProps} />
        )

        hitShortcut('OPEN_TAGS')

        expect(queryByRole('menu', {hidden: false})).toBe(null)
    })

    it('should close tags dropdown on hide popover shortcut', async () => {
        fieldEnumSearchCancellableMock.mockResolvedValue(
            fromJS([
                {
                    id: 1,
                    name: 'refund',
                },
            ])
        )
        const {getByRole, queryByRole} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1])}
            />
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
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1])}
            />
        )

        hitShortcut('OPEN_MACRO')

        expect(minProps.openMacroModal).toHaveBeenLastCalledWith()
    })

    it('should not call openMacroModal on open macro shortcut when no selected items', () => {
        render(<TicketListActionsContainer {...minProps} />)

        hitShortcut('OPEN_MACRO')

        expect(minProps.openMacroModal).not.toHaveBeenCalled()
    })

    it('should show delete confirmation on delete ticket shortcut', () => {
        const {queryByText} = render(
            <TicketListActionsContainer
                {...minProps}
                selectedItemsIds={fromJS([1])}
            />
        )

        hitShortcut('DELETE_TICKET')

        expect(queryByText(/Are you sure you want to delete/)).not.toBe(null)
    })

    it('should not show delete confirmation on delete ticket shortcut when no selected items', () => {
        const {queryByText} = render(
            <TicketListActionsContainer {...minProps} />
        )

        hitShortcut('DELETE_TICKET')

        expect(queryByText(/Are you sure you want to delete/)).toBe(null)
    })

    type CreateJobTestSuite = [
        JobType,
        string,
        (
            props: ComponentProps<typeof TicketListActionsContainer>
        ) => ComponentProps<typeof TicketListActionsContainer>,
        (renderResult: RenderResult) => Promise<void>,
        {updates: any}
    ]

    describe.each([
        [
            JobType.UpdateTicket,
            'close button click',
            (props) => props,
            ({getByText}) => {
                fireEvent.click(getByText('Close'))
            },
            {updates: {status: 'closed'}},
        ],
        [
            JobType.UpdateTicket,
            'open dropdown item click',
            (props) => props,
            ({getByText}) => {
                fireEvent.click(getByText('Open'))
            },
            {updates: {status: 'open'}},
        ],
        [
            JobType.UpdateTicket,
            'assign to me button click',
            (props) => ({
                ...props,
                currentUser: fromJS({
                    id: 1,
                    name: 'Foo',
                }),
            }),
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
            (props) => ({
                ...props,
                agents: fromJS([
                    {
                        id: 1,
                        name: 'John Doe',
                    },
                ]),
            }),
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
            'assign to user dropdown item click',
            (props) => ({
                ...props,
                teams: fromJS([
                    {
                        id: 1,
                        name: 'Team Sports',
                    },
                ]),
            }),
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
            (props) => ({
                ...props,
                fieldEnumSearchCancellable: jest.fn().mockResolvedValue(
                    fromJS([
                        {
                            id: 1,
                            name: 'refund',
                        },
                    ])
                ),
            }),
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
            (props) => ({
                ...props,
                isActiveViewTrashView: true,
            }),
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
            (props) => ({
                ...props,
                isActiveViewTrashView: true,
            }),
            ({getByText}) => {
                fireEvent.click(getByText('Delete forever'))
                fireEvent.click(getByText('Confirm'))
            },
            {},
        ],
        [
            JobType.UpdateTicket,
            'delete dropdown item click',
            (props) => ({
                ...props,
                isActiveViewTrashView: false,
            }),
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
            (props) => props,
            () => {
                hitShortcut('CLOSE_TICKET')
            },
            {
                updates: {status: 'closed'},
            },
        ],
    ] as CreateJobTestSuite[])(
        'create %s job on %s',
        (jobType, suiteName, getTestProps, testActions, jobParams) => {
            const suiteProps = {
                ...minProps,
                selectedItemsIds: fromJS([1]),
            }

            it(`should create ${jobType} ticket job`, async () => {
                const props = getTestProps(suiteProps)
                const renderResult = render(
                    <TicketListActionsContainer {...props} />
                )

                await testActions(renderResult)

                expect(ticketsActionsMock.createJob).toHaveBeenLastCalledWith(
                    props.selectedItemsIds,
                    jobType,
                    jobParams
                )
            })

            it(`should create ${jobType} view job when all view items are selected`, async () => {
                const props = getTestProps({
                    ...suiteProps,
                    allViewItemsSelected: true,
                })
                const renderResult = render(
                    <TicketListActionsContainer {...props} />
                )

                await testActions(renderResult)

                expect(viewsActionsMock.createJob).toHaveBeenLastCalledWith(
                    props.activeView,
                    jobType,
                    jobParams
                )
            })

            it('should disable buttons when job is being created', async () => {
                ticketsActionsMock.createJob.mockImplementation(() => {
                    return new Promise(_noop)
                })
                const renderResult = render(
                    <TicketListActionsContainer {...getTestProps(suiteProps)} />
                )

                void testActions(renderResult)

                await waitFor(() => {
                    expectAllActionsToHaveEnabledState(renderResult, false)
                })
            })

            it('should enable buttons when job was created', async () => {
                const renderResult = render(
                    <TicketListActionsContainer {...getTestProps(suiteProps)} />
                )

                await testActions(renderResult)

                await waitFor(() => {
                    expectAllActionsToHaveEnabledState(renderResult, true)
                })
            })

            it('should deselect all items', async () => {
                const renderResult = render(
                    <TicketListActionsContainer {...getTestProps(suiteProps)} />
                )

                await testActions(renderResult)

                expect(
                    viewsActions.updateSelectedItemsIds
                ).toHaveBeenLastCalledWith(fromJS([]))
            })
        }
    )

    it('should call openMacroModal on Apply macro dropdown item click', () => {
        const {getByText} = render(<TicketListActionsContainer {...minProps} />)

        fireEvent.click(getByText('Apply macro'))

        expect(minProps.openMacroModal).toHaveBeenLastCalledWith(
            expect.anything()
        )
    })
})
