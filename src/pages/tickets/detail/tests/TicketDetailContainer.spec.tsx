import React, {ComponentProps} from 'react'
import {act, waitFor, fireEvent} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS, Map} from 'immutable'
import moment from 'moment'
import {createMemoryHistory} from 'history'
import _noop from 'lodash/noop'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import MockAdapter from 'axios-mock-adapter'
import LD from 'launchdarkly-react-client-sdk'

import useGoToPreviousTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket'
import useGoToNextTicket from 'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
import {logEvent, SegmentEvent} from 'common/segment'
import {MacroActionName} from 'models/macroAction/types'
import client from 'models/api/resources'
import localForageManager from 'services/localForageManager/localForageManager'
import pendingMessageManager from 'services/pendingMessageManager/pendingMessageManager'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {initialState as currentUser} from 'state/currentUser/reducers'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from 'state/newMessage/errors'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {
    assumeMock,
    flushPromises,
    makeExecuteKeyboardAction,
    renderWithRouter,
} from 'utils/testing'

import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import {triggerTicketFieldsErrors} from 'state/ticket/actions'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import * as voiceCallQueries from 'models/voiceCall/queries'
import * as customFieldsUtils from 'utils/customFields'
import * as ticketUtils from 'state/ticket/utils'
import {FeatureFlagKey} from 'config/featureFlags'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import TicketView from '../components/TicketView'
import useTicketActivityTracking from '../hooks/useTicketActivityTracking'
import {TicketDetailContainer} from '../TicketDetailContainer'

const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()
jest.useFakeTimers()

const mockSetItem = jest.fn().mockResolvedValue(true)
const mockGetItem = jest.fn()
const mockGetTableObject = {
    getItem: mockGetItem,
    setItem: mockSetItem,
} as unknown as LocalForage
jest.spyOn(localForageManager, 'getTable').mockReturnValue(mockGetTableObject)
jest.spyOn(localForageManager, 'clearTable')

const voiceCallsSpy = jest.spyOn(voiceCallQueries, 'useListVoiceCalls')

jest.mock('services/shortcutManager/shortcutManager')
jest.mock('../components/TicketView', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {TicketStatus} = require('business/types/ticket')
    return ({submit, setStatus}: ComponentProps<typeof TicketView>) => (
        <div>
            <div
                data-testid="TicketView-submit"
                onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    submit({status: TicketStatus.Closed})
                }}
            />
            <div
                data-testid="TicketView-change-status"
                onClick={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                    setStatus(TicketStatus.Closed)
                }}
            />
        </div>
    )
})

jest.mock('services/pendingMessageManager/pendingMessageManager', () => ({
    sendMessage: jest.fn(),
    skipExistingTimer: jest.fn(),
}))

jest.mock('common/segment')
jest.mock('state/ticket/actions', () => ({
    ...jest.requireActual<Record<string, unknown>>('state/ticket/actions'),
    triggerTicketFieldsErrors: jest.fn(),
}))

const mockStore = configureMockStore([thunk])
let mockedStore = mockStore({
    ticket: fromJS({
        tags: [],
    }),
})

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>

const mockSetRecentItem = jest.fn()
jest.mock('hooks/useRecentItems/useRecentItems', () => () => ({
    setRecentItem: mockSetRecentItem,
}))

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('services/activityTracker')

jest.spyOn(customFieldsUtils, 'mergeFieldsStateWithMacroValues')
const spiedMergeFieldsStateWithMacroValues = assumeMock(
    customFieldsUtils.mergeFieldsStateWithMacroValues
)

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const useSplitTicketViewMock = useSplitTicketView as jest.Mock

const mockGoToPreviousTicket = jest.fn()
jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToPreviousTicket'
)
const mockUseGoToPreviousTicket = useGoToPreviousTicket as jest.Mock

const mockGoToNextTicket = jest.fn()
jest.mock(
    'pages/tickets/detail/components/TicketNavigation/hooks/useGoToNextTicket'
)
const mockUseGoToNextTicket = useGoToNextTicket as jest.Mock

jest.mock('pages/tickets/detail/hooks/useTicketActivityTracking')
const mockUseTicketActivityTracking = useTicketActivityTracking as jest.Mock

describe('TicketDetailContainer component', () => {
    const prepareTicketMessageMock = jest.fn()
    const newTicket = fromJS({
        messages: [],
        custom_fields: {},
    }) as Map<any, any>
    const existingTicket = fromJS({
        id: 1,
        messages: [],
        custom_fields: {},
    }) as Map<any, any>
    const setStatusMock = jest.fn() as jest.Mock<unknown, [string, () => void]>
    const minProps = {
        activeCustomer: fromJS({}),
        activeView: fromJS({}),
        canSendMessage: false,
        clearTicket: jest.fn(),
        customers: fromJS({}),
        fetchCustomer: jest.fn(),
        fetchCustomerHistory: jest.fn(),
        fetchTags: jest.fn(),
        fetchTicket: jest.fn(),
        findAndSetCustomer: jest.fn(),
        goToNextTicket: jest.fn(),
        goToPrevTicket: jest.fn(),
        newMessage: fromJS({
            newMessage: {
                source: {
                    to: [],
                },
            },
        }),
        newMessageSource: fromJS({}),
        prepareTicketMessage: prepareTicketMessageMock,
        sendTicketMessage: jest.fn(),
        setCustomer: jest.fn().mockResolvedValue(undefined),
        setReceivers: jest.fn(),
        setStatus: setStatusMock,
        submitTicket: jest.fn(),
        ticket: newTicket,
        updateCursor: jest.fn(),
        currentUser: fromJS({}),
        prepare: jest.fn(),
    } as unknown as ComponentProps<typeof TicketDetailContainer>
    const preparedData = {
        messageId: 1,
        messageToSend: {
            attachments: [],
            body_html: '<div>foo</div>',
            body_text: 'foo',
            channel: 'email',
            from_agent: true,
            macros: [],
            mention_ids: [],
            public: true,
            sender: {},
            source: {
                type: 'email',
                extra: {},
                from: {},
                to: [{}],
            },
            subject: '',
            via: 'helpdesk',
        },
        type: 'foo',
    }
    const newMessageState = fromJS({
        newMessage: {
            body_text: 'foobar',
            source: {
                cc: [
                    {
                        name: 'cc',
                        address: 'cc@gorgias.io',
                    },
                ],
                bcc: [
                    {
                        name: 'bcc',
                        address: 'bcc@gorgias.io',
                    },
                ],
                type: 'email',
            },
        },
    })

    beforeEach(() => {
        mockedServer.reset()
        mockedStore = mockStore({
            ticket: fromJS({
                tags: [],
            }),
        })
        mockedStore.dispatch = jest.fn()
        prepareTicketMessageMock.mockReturnValue(preparedData)
        setStatusMock.mockImplementation((status, callback) => {
            act(callback)
        })
        jest.spyOn(LD, 'useFlags').mockReturnValue({
            [FeatureFlagKey.SplitTicketView]: false,
        })
        useSplitTicketViewMock.mockReturnValue({isEnabled: false})
        mockUseGoToPreviousTicket.mockReturnValue({
            goToTicket: mockGoToPreviousTicket,
            isDisabled: false,
        })
        mockUseGoToNextTicket.mockReturnValue({
            goToTicket: mockGoToNextTicket,
            isDisabled: false,
        })
    })

    it('should render container for new ticket', () => {
        const {container} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have new ticket title', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        expect(document.title).toEqual('New ticket')
    })

    it('should fetch customer details from url', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )

        expect(minProps.fetchCustomer).toBeCalledWith('1')
    })

    it('should set activeCustomer as customer', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        }) as Map<any, any>

        const {rerender} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )

        rerender(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        activeCustomer={activeCustomer}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(minProps.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email'))
        )
    })

    it('should not go to next ticket when setting status closed and history is open', () => {
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        currentUser={currentUser}
                        canSendMessage
                        ticket={existingTicket.setIn(
                            ['_internal', 'displayHistory'],
                            true
                        )}
                        newMessage={fromJS({
                            newMessage: {
                                source: {
                                    to: [],
                                },
                            },
                        })}
                        submitTicket={() => Promise.resolve()}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: `/foo/${existingTicket.get('id') as string}`,
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        expect(minProps.goToNextTicket).not.toHaveBeenCalled()
    })

    it('should go to next ticket when setting status closed and history is closed', async () => {
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        currentUser={currentUser}
                        canSendMessage
                        ticket={existingTicket.setIn(
                            ['_internal', 'displayHistory'],
                            false
                        )}
                        newMessage={fromJS({
                            newMessage: {
                                source: {
                                    to: [],
                                },
                            },
                        })}
                        submitTicket={() => Promise.resolve()}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: `/foo/${existingTicket.get('id') as string}`,
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() => expect(minProps.goToNextTicket).toHaveBeenCalled())
    })

    it('should use the close callback prop when setting status closed and history is closed', async () => {
        const mockCallback = jest.fn()
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        currentUser={currentUser}
                        canSendMessage
                        ticket={existingTicket.setIn(
                            ['_internal', 'displayHistory'],
                            false
                        )}
                        newMessage={fromJS({
                            newMessage: {
                                source: {
                                    to: [],
                                },
                            },
                        })}
                        submitTicket={() => Promise.resolve()}
                        onGoToNextTicket={mockCallback}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: `/foo/${existingTicket.get('id') as string}`,
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() => expect(mockCallback).toHaveBeenCalled())
    })

    it('should set activeCustomer as receiver when receiver is in the location state', () => {
        const expectedReceiver = {
            name: 'Pizza Pepperoni',
            address: '+12345',
        }

        const route = '/foo/new?customer=1'
        const history = createMemoryHistory({initialEntries: [route]})
        history.location.state = {
            receiver: expectedReceiver,
        }
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route,
                history,
            }
        )

        expect(minProps.setReceivers).toBeCalledWith(
            {
                to: [expectedReceiver],
            },
            false
        )
    })

    it('should update cursor of the view when the id of the ticket changes', () => {
        const activeView = fromJS({order_by: 'updated_datetime'}) as Map<
            any,
            any
        >
        const newTicket = fromJS({
            id: 9999,
            updated_datetime: '2018-12-20',
        }) as Map<any, any>
        const {rerender} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )

        rerender(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        activeView={activeView}
                        ticket={newTicket}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(minProps.updateCursor).toBeCalledWith(
            newTicket.get(activeView.get('order_by'))
        )
    })

    it("should NOT update the cursor of the view when ticket's attributes change", () => {
        const activeView = fromJS({order_by: 'updated_datetime'})
        const props = {
            ...minProps,
            activeView,
        }
        const {rerender} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...props} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )
        rerender(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...props}
                        ticket={minProps.ticket.set(
                            'updated_datetime',
                            moment()
                        )}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(minProps.updateCursor).not.toHaveBeenCalled()
    })

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from no recipients to one recipient',
        () => {
            const id = 80
            const {rerender} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...minProps}
                            newMessageSource={fromJS({
                                to: [
                                    {
                                        name: 'foo',
                                        address: 'foo@gorgias.io',
                                        id,
                                    },
                                ],
                            })}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            expect(minProps.findAndSetCustomer).toBeCalledWith(id)
        }
    )

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from multiple recipients to one recipient',
        () => {
            const id = 80
            const props = {
                ...minProps,
                newMessageSource: fromJS({
                    to: [
                        {
                            name: 'foo',
                            address: 'foo@gorgias.io',
                        },
                        {
                            name: 'bar',
                            address: 'bar@gorgias.io',
                        },
                    ],
                }),
                ticket: fromJS({
                    messages: [],
                }),
                newMessage: newMessageState,
            }
            const {rerender} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer {...props} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...props}
                            newMessageSource={fromJS({
                                to: [
                                    {
                                        name: 'foo',
                                        address: 'foo@gorgias.io',
                                        id,
                                    },
                                ],
                            })}
                        />
                    </Provider>
                </QueryClientProvider>
            )
            expect(minProps.findAndSetCustomer).toBeCalledWith(id)
        }
    )

    it(
        'should not try to set the first recipient as customer because event though this ticket is new and the ' +
            'recipients have changed from multiple recipients to one recipient, this is the same customer',
        () => {
            const props = {
                ...minProps,
                ticket: fromJS({
                    messages: [],
                    customer: {
                        name: 'foo',
                        email: 'foo@gorgias.io',
                        channels: [
                            {
                                type: 'email',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    },
                }),
                newMessage: newMessageState,
            }
            const {rerender} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer {...props} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...props}
                            newMessageSource={fromJS({
                                to: [
                                    {
                                        name: 'foo',
                                        address: 'foo@gorgias.io',
                                    },
                                ],
                            })}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            expect(minProps.findAndSetCustomer).not.toHaveBeenCalled()
        }
    )

    it('should restore the original customer of the ticket', () => {
        const activeCustomer = {
            id: 1,
            name: 'foo',
            email: 'foo@gorgias.io',
            channels: [
                {
                    type: 'email',
                    address: 'foo@gorgias.io',
                },
            ],
        }
        const customer = {
            id: 2,
            name: 'bar',
            email: 'bar@gorgias.io',
            address: 'bar@gorgias.io',
            channels: [
                {
                    type: 'email',
                    address: 'bar@gorgias.io',
                },
            ],
        }
        const newRecipient = {
            name: 'another recipient',
            address: 'another@gorgias.io',
        }
        const props = {
            ...minProps,
            ticket: fromJS({
                messages: [],
                customer,
            }),
            activeCustomer: fromJS(activeCustomer),
            newMessageSource: fromJS({
                to: [newRecipient],
            }),
        }

        const {rerender} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...props} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )
        expect(minProps.setCustomer).not.toHaveBeenCalled()

        rerender(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...props}
                        ticket={fromJS({
                            messages: [],
                            customer,
                        })}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(minProps.setCustomer).toHaveBeenCalledWith(
            fromJS({
                ...activeCustomer,
                address: activeCustomer.email,
            })
        )
    })

    it(
        'should not try to set the first recipient as customer because the only recipient is in the `cc` field, and ' +
            'not in the `to` field',
        () => {
            const props = {
                ...minProps,
                ticket: fromJS({
                    messages: [],
                    customer: {
                        name: 'foo',
                        email: 'foo@gorgias.io',
                        channels: [
                            {
                                type: 'email',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    },
                }),
                newMessage: newMessageState,
            }

            const {rerender} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer {...props} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...props}
                            newMessageSource={fromJS({
                                cc: [
                                    {
                                        name: 'bar',
                                        address: 'bar@gorgias.io',
                                    },
                                ],
                            })}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            expect(minProps.findAndSetCustomer).not.toHaveBeenCalled()
        }
    )

    it('should set the customer to null because the ticket is new and the recipients have been removed', () => {
        const props = {
            ...minProps,
            ticket: fromJS({
                messages: [],
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        to: [
                            {
                                name: 'foo',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    },
                },
            }),
            newMessageSource: fromJS({
                to: [
                    {
                        name: 'foo',
                        address: 'foo@gorgias.io',
                    },
                ],
            }),
        }
        const {rerender} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...props} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )
        rerender(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...props}
                        newMessageSource={fromJS({to: []})}
                    />
                </Provider>
            </QueryClientProvider>
        )

        expect(minProps.setCustomer).toBeCalledWith(null)
    })

    it('should not unset the customer because the ticket is new and the new message is an internal note', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        ticket={fromJS({
                            messages: [],
                        })}
                        newMessage={fromJS({
                            newMessage: {
                                source: {
                                    type: 'internal-note',
                                    to: [],
                                },
                            },
                        })}
                        newMessageSource={fromJS({
                            to: [],
                            type: 'internal-note',
                        })}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        expect(minProps.setCustomer).not.toBeCalled()
    })

    it('should not set customer when ticket created has internal note action', async () => {
        const submitMock = jest.fn()

        const ticket = newTicket.setIn(
            ['state', 'appliedMacro', 'actions'],
            fromJS([{name: MacroActionName.AddInternalNote}])
        )

        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        canSendMessage={true}
                        ticket={ticket}
                        submitTicket={submitMock}
                        newMessage={fromJS({
                            newMessage: {
                                receiver: {
                                    name: 'foo',
                                },
                            },
                        })}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            expect(submitMock.mock.calls[0][0].get('customer')).toBeUndefined()
        )
    })

    it('should defer sending new message when new message is of type email', async () => {
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        ticket={existingTicket}
                        newMessage={newMessageState}
                        canSendMessage
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            expect(pendingMessageManager.sendMessage).toHaveBeenNthCalledWith(
                1,
                {
                    action: undefined,
                    messageId: 1,
                    messageToSend: preparedData.messageToSend,
                    replyAreaState: undefined,
                    resetMessage: true,
                    ticketId: '1',
                }
            )
        )
    })

    it('should NOT defer sending new message when new message is NOT of type email', async () => {
        const preparedFacebookData = {
            messageId: 1,
            messageToSend: {
                attachments: [],
                body_html: '<div>foo</div>',
                body_text: 'foo',
                channel: 'email',
                from_agent: true,
                macros: [],
                mention_ids: [],
                public: true,
                sender: {},
                source: {
                    type: 'facebook',
                    extra: {},
                    from: {},
                    to: [{}],
                },
                subject: '',
                via: 'helpdesk',
            },
            type: 'foo',
        }
        prepareTicketMessageMock.mockResolvedValue(preparedFacebookData)
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        ticket={existingTicket}
                        newMessage={newMessageState}
                        canSendMessage
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            expect(minProps.sendTicketMessage).toHaveBeenNthCalledWith(
                1,
                1,
                preparedFacebookData.messageToSend,
                undefined,
                true
            )
        )
    })

    it('should send a deferred message when sending a new deferred message', async () => {
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        ticket={existingTicket}
                        newMessage={newMessageState}
                        canSendMessage
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        userEvent.click(getByTestId('TicketView-submit'))
        await waitFor(() =>
            expect(pendingMessageManager.sendMessage).toHaveBeenNthCalledWith(
                1,
                {
                    action: undefined,
                    messageId: 1,
                    messageToSend: preparedData.messageToSend,
                    replyAreaState: undefined,
                    resetMessage: true,
                    ticketId: '1',
                }
            )
        )
    })

    it.each([
        ['new ticket', newTicket],
        ['existing ticket', existingTicket],
    ])(
        'should close the ticket and redirect to the next ticket on %s submit success',
        async (testName, ticket) => {
            let resolveSubmit: (value?: unknown) => void
            const submitMock = jest.fn().mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveSubmit = resolve
                    })
            )
            const history = createMemoryHistory({
                initialEntries: [
                    `/foo/${(ticket.get('id') as string) || 'new'}`,
                ],
            })
            const {getByTestId} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...minProps}
                            currentUser={currentUser}
                            canSendMessage
                            ticket={ticket}
                            submitTicket={submitMock}
                            sendTicketMessage={submitMock}
                        />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/foo/:ticketId',
                    history,
                }
            )

            userEvent.click(getByTestId('TicketView-submit'))
            act(() => {
                history.push('/foo/123')
                resolveSubmit?.()
            })

            await waitFor(() => {
                expect(minProps.goToNextTicket).toHaveBeenLastCalledWith(
                    123,
                    expect.any(Promise)
                )
            })
        }
    )

    it.each<[string, Error]>([
        [
            'TicketMessageInvalidSendDataError',
            new TicketMessageInvalidSendDataError(),
        ],
        [
            'TicketMessageActionValidationError',
            new TicketMessageActionValidationError('Test error'),
        ],
    ])('should not throw %s', async (testName, error) => {
        prepareTicketMessageMock.mockRejectedValue(error)
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        ticket={existingTicket}
                        newMessage={newMessageState}
                        canSendMessage
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await flushPromises()
    })

    it.each<[string, string, boolean, () => jest.Mock, SegmentEvent, boolean]>([
        [
            'next',
            'GO_FORWARD',
            true,
            () => {
                return (minProps.goToNextTicket as jest.Mock).mockReturnValue(
                    new Promise(_noop)
                )
            },
            SegmentEvent.TicketKeyboardShortcutsNextNavigation,
            false,
        ],
        [
            'next',
            'GO_FORWARD',
            false,
            () => {
                return (minProps.goToNextTicket as jest.Mock).mockReturnValue(
                    new Promise(_noop)
                )
            },
            SegmentEvent.TicketKeyboardShortcutsNextNavigation,
            false,
        ],
        [
            'next',
            'GO_FORWARD',
            true,
            () => mockGoToNextTicket,
            SegmentEvent.TicketKeyboardShortcutsNextNavigation,
            true,
        ],
        [
            'prev',
            'GO_BACK',
            true,
            () => {
                return (minProps.goToPrevTicket as jest.Mock).mockReturnValue(
                    new Promise(_noop)
                )
            },
            SegmentEvent.TicketKeyboardShortcutsPreviousNavigation,
            false,
        ],
        [
            'prev',
            'GO_BACK',
            false,
            () => {
                return (minProps.goToPrevTicket as jest.Mock).mockReturnValue(
                    new Promise(_noop)
                )
            },
            SegmentEvent.TicketKeyboardShortcutsPreviousNavigation,
            false,
        ],
        [
            'prev',
            'GO_BACK',
            true,
            () => mockGoToPreviousTicket,
            SegmentEvent.TicketKeyboardShortcutsPreviousNavigation,
            true,
        ],
    ])(
        'should debounce %s ticket calls while call is already pending',
        (
            testName,
            actionName,
            isTicketNavigationAvailable,
            testSetup,
            trackedEvent,
            isSplitTicketViewEnabled
        ) => {
            jest.spyOn(LD, 'useFlags').mockReturnValue({
                [FeatureFlagKey.SplitTicketView]: isSplitTicketViewEnabled,
            })
            useSplitTicketViewMock.mockReturnValue({
                isEnabled: isSplitTicketViewEnabled,
            })
            mockedDispatch.mockReturnValue(isTicketNavigationAvailable)

            const execKeyboardAction =
                makeExecuteKeyboardAction(shortcutManagerMock)
            const callMock = testSetup()

            renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer {...minProps} />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/1',
                }
            )

            execKeyboardAction(actionName)
            execKeyboardAction(actionName)

            expect(callMock).toHaveBeenCalledTimes(
                isTicketNavigationAvailable
                    ? isSplitTicketViewEnabled
                        ? 2
                        : 1
                    : 0
            )

            expect(logEvent).toHaveBeenCalledWith(trackedEvent)
        }
    )

    it('should track the control / cmd + f combo', () => {
        const {container} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        fireEvent.keyDown(container.firstChild!, {key: 'f', ctrlKey: true})
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.TicketMessageSearchKeyPressed
        )
    })

    it('should not track the control / cmd + f combo if on a new ticket', () => {
        const {container} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        fireEvent.keyDown(container.firstChild!, {key: 'f', ctrlKey: true})
        expect(logEvent).not.toHaveBeenCalled()
    })

    it('should call ticket submit if can send message', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        canSendMessage={true}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        makeExecuteKeyboardAction(shortcutManagerMock)('SUBMIT_TICKET')

        expect(minProps.submitTicket).toHaveBeenCalled()
    })

    it("should not call ticket submit if can't send message", () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        canSendMessage={false}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        makeExecuteKeyboardAction(shortcutManagerMock)('SUBMIT_TICKET')

        expect(minProps.submitTicket).not.toHaveBeenCalled()
    })

    it('should call setRecentItem on mount', () => {
        const mockCustomer = {
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        }
        const ticket = existingTicket.set('customer', fromJS(mockCustomer))

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} ticket={ticket} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        expect(mockSetRecentItem).toHaveBeenCalledWith(
            expect.objectContaining({
                id: existingTicket.get('id'),
                customer: mockCustomer,
            })
        )
    })

    it('should clear ticket draft stored in local forage when current ticket is new and successfully created', async () => {
        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        canSendMessage={true}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await flushPromises()
        expect(localForageManager.clearTable).toHaveBeenCalled()
    })

    it('should not clear ticket draft stored in local forage when current ticket is new but sending has failed', async () => {
        const error = new Error('ticket not created')

        const {getByTestId} = renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        canSendMessage={true}
                        submitTicket={() => {
                            return Promise.resolve({error})
                        }}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        userEvent.click(getByTestId('TicketView-submit'))
        await flushPromises()
        expect(localForageManager.clearTable).not.toHaveBeenCalled()
    })

    describe('ticket fields', () => {
        it('should not allow ticket to be set to close if errored', async () => {
            mockedServer.onGet('/api/custom-fields/').reply(200, {
                data: [
                    ticketDropdownFieldDefinition,
                    {...ticketInputFieldDefinition, required: true},
                ],
            })
            const {getByTestId} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...{
                                ...minProps,
                                canSendMessage: true,
                                fieldsState: {},
                            }}
                        />
                    </Provider>
                </QueryClientProvider>,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )
            await waitFor(() => {
                expect(queryClient.isFetching()).toBe(0)
            })
            userEvent.click(getByTestId('TicketView-submit'))
            expect(triggerTicketFieldsErrors).toHaveBeenNthCalledWith(1, [
                ticketInputFieldDefinition.id,
            ])
            userEvent.click(getByTestId('TicketView-change-status'))
            expect(triggerTicketFieldsErrors).toHaveBeenNthCalledWith(2, [
                ticketInputFieldDefinition.id,
            ])
            expect(spiedMergeFieldsStateWithMacroValues).toHaveBeenCalledTimes(
                1
            )
            makeExecuteKeyboardAction(shortcutManagerMock)(
                'SUBMIT_CLOSE_TICKET'
            )
            expect(triggerTicketFieldsErrors).toHaveBeenNthCalledWith(3, [
                ticketInputFieldDefinition.id,
            ])
            expect(spiedMergeFieldsStateWithMacroValues).toHaveBeenCalledTimes(
                2
            )
        })
    })

    describe('ticket voice calls', () => {
        it('should show loading spinner until voice calls are loaded when the ticket channel is Voice', () => {
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: true,
            })) as jest.MockedFn<any>)
            const {getByText} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...{
                                ...minProps,
                                ticket: existingTicket.set(
                                    'channel',
                                    TicketChannel.Phone
                                ),
                            }}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            expect(getByText('Loading ticket...')).toBeInTheDocument()
        })

        it('should not show loading spinner when voice calls are not loaded and ticket channel is not Voice', () => {
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: true,
            })) as jest.MockedFn<any>)
            const {queryByText} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...{
                                ...minProps,
                                ticket: existingTicket.set(
                                    'channel',
                                    TicketChannel.Email
                                ),
                            }}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            expect(queryByText('Loading ticket...')).not.toBeInTheDocument()
        })

        it('should not show loading spinner and prepare message when voice calls are loaded and ticket channel is Voice', () => {
            voiceCallsSpy.mockImplementation((() => ({
                isLoading: false,
                data: {data: [{}]},
            })) as jest.MockedFn<any>)
            jest.spyOn(
                ticketUtils,
                'getSourceTypeOfResponse'
            ).mockReturnValueOnce(TicketMessageSourceType.Phone)
            const {queryByText} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockedStore}>
                        <TicketDetailContainer
                            {...{
                                ...minProps,
                                ticket: existingTicket.set(
                                    'channel',
                                    TicketChannel.Phone
                                ),
                            }}
                        />
                    </Provider>
                </QueryClientProvider>
            )

            expect(queryByText('Loading ticket...')).not.toBeInTheDocument()
            expect(minProps.prepare).toHaveBeenCalledWith(
                TicketMessageSourceType.Phone
            )
        })
    })

    it('should use ticket activity tracking', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        ticket={existingTicket}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        expect(mockUseTicketActivityTracking).toHaveBeenCalledWith(1)
    })

    it('should not use ticket activity tracking when the ticket is new', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer {...minProps} ticket={newTicket} />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        expect(mockUseTicketActivityTracking).toHaveBeenCalledWith(undefined)
    })

    it('should not use ticket activity tracking when ticket is closed', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockedStore}>
                    <TicketDetailContainer
                        {...minProps}
                        ticket={existingTicket.set('status', 'closed')}
                    />
                </Provider>
            </QueryClientProvider>,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        expect(mockUseTicketActivityTracking).toHaveBeenCalledWith(undefined)
    })
})
