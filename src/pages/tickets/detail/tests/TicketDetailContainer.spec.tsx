import React, {ComponentProps} from 'react'
import {act, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'
import moment from 'moment'
import {createMemoryHistory} from 'history'
import _noop from 'lodash/noop'

import {
    flushPromises,
    makeExecuteKeyboardAction,
    renderWithRouter,
} from '../../../../utils/testing'
import {initialState as currentUser} from '../../../../state/currentUser/reducers'
import pendingMessageManager from '../../../../services/pendingMessageManager/pendingMessageManager'
import {
    TicketMessageActionValidationError,
    TicketMessageInvalidSendDataError,
} from '../../../../state/newMessage/errors'
import shortcutManager from '../../../../services/shortcutManager/shortcutManager'
import {TicketDetailContainer} from '../TicketDetailContainer'
import TicketView from '../components/TicketView'

jest.useFakeTimers()

jest.mock('../../../../services/shortcutManager/shortcutManager')
jest.mock(
    '../components/TicketView',
    () => ({submit}: ComponentProps<typeof TicketView>) => (
        <div
            data-testid="TicketView-close"
            onClick={() => {
                submit({status: 'closed'})
            }}
        />
    )
)

jest.mock(
    '../../../../services/pendingMessageManager/pendingMessageManager',
    () => ({
        sendMessage: jest.fn(),
        skipExistingTimer: jest.fn(),
    })
)

const shortcutManagerMock = shortcutManager as jest.Mocked<
    typeof shortcutManager
>

describe('TicketDetailContainer component', () => {
    const prepareTicketMessageMock = jest.fn()
    const minProps = ({
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
        setStatus: jest.fn(),
        submitTicket: jest.fn(),
        ticket: fromJS({
            messages: [],
        }),
        updateCursor: jest.fn(),
    } as unknown) as ComponentProps<typeof TicketDetailContainer>
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
        jest.clearAllMocks()
    })

    it('should render container for new ticket', () => {
        const {container} = renderWithRouter(
            <TicketDetailContainer {...minProps} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should have new ticket title', () => {
        renderWithRouter(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            route: '/foo/new',
        })

        expect(document.title).toEqual('New ticket')
    })

    it('should fetch customer details from url', () => {
        renderWithRouter(<TicketDetailContainer {...minProps} />, {
            path: '/foo/:ticketId',
            route: '/foo/new?customer=1',
        })

        expect(minProps.fetchCustomer).toBeCalledWith('1')
    })

    it('should set activeCustomer as customer', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        }) as Map<any, any>

        const {rerender} = renderWithRouter(
            <TicketDetailContainer {...minProps} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )

        rerender(
            <TicketDetailContainer
                {...minProps}
                activeCustomer={activeCustomer}
            />
        )

        expect(minProps.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email'))
        )
    })

    it('should not go to next ticket when setting status=closed and history is open', () => {
        ;((minProps.setStatus as unknown) as jest.MockedFunction<
            (value: any, cb: () => void) => void
        >).mockImplementationOnce((v, cb) => {
            act(cb)
        })

        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                currentUser={currentUser}
                canSendMessage
                ticket={fromJS({
                    messages: [],
                    _internal: {
                        displayHistory: true,
                    },
                })}
                newMessage={fromJS({
                    newMessage: {
                        source: {
                            to: [],
                        },
                    },
                })}
                submitTicket={() => Promise.resolve()}
            />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        userEvent.click(getByTestId('TicketView-close'))
        expect(minProps.goToNextTicket).not.toHaveBeenCalled()
    })

    it('should go to next ticket when setting status=closed and history is closed', async () => {
        ;((minProps.setStatus as unknown) as jest.MockedFunction<
            (status: string, cb: () => void) => void
        >).mockImplementationOnce((v, cb) => {
            act(cb)
        })

        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                currentUser={currentUser}
                canSendMessage
                ticket={fromJS({
                    messages: [],
                    _internal: {
                        displayHistory: false,
                    },
                })}
                newMessage={fromJS({
                    newMessage: {
                        source: {
                            to: [],
                        },
                    },
                })}
                submitTicket={() => Promise.resolve()}
            />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        userEvent.click(getByTestId('TicketView-close'))
        await waitFor(() => expect(minProps.goToNextTicket).toHaveBeenCalled())
    })

    it('should set activeCustomer as receiver', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        }) as Map<any, any>
        const expectedReceiver = {
            name: activeCustomer.get('name'),
            address: activeCustomer.get('email'),
        }

        const props = {
            ...minProps,
            activeCustomer,
        }

        const {rerender} = renderWithRouter(
            <TicketDetailContainer {...props} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )

        rerender(
            <TicketDetailContainer
                {...props}
                ticket={minProps.ticket.set(
                    'customer',
                    activeCustomer.set('address', activeCustomer.get('email'))
                )}
            />
        )

        expect(minProps.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email'))
        )
        expect(minProps.setReceivers).toBeCalledWith({
            to: [expectedReceiver],
        })
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
            <TicketDetailContainer {...minProps} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )

        rerender(
            <TicketDetailContainer
                {...minProps}
                activeView={activeView}
                ticket={newTicket}
            />
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
            <TicketDetailContainer {...props} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )
        rerender(
            <TicketDetailContainer
                {...props}
                ticket={minProps.ticket.set('updated_datetime', moment())}
            />
        )

        expect(minProps.updateCursor).not.toHaveBeenCalled()
    })

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from no recipients to one recipient',
        () => {
            const {rerender} = renderWithRouter(
                <TicketDetailContainer {...minProps} />,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
                <TicketDetailContainer
                    {...minProps}
                    newMessageSource={fromJS({
                        to: [
                            {
                                name: 'foo',
                                address: 'foo@gorgias.io',
                            },
                        ],
                    })}
                />
            )

            expect(minProps.findAndSetCustomer).toBeCalledWith('foo@gorgias.io')
        }
    )

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from multiple recipients to one recipient',
        () => {
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
                <TicketDetailContainer {...props} />,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
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
            )
            expect(minProps.findAndSetCustomer).toBeCalledWith('foo@gorgias.io')
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
                <TicketDetailContainer {...props} />,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
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
            <TicketDetailContainer {...props} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new?customer=1',
            }
        )
        expect(minProps.setCustomer).not.toHaveBeenCalled()

        rerender(
            <TicketDetailContainer
                {...props}
                ticket={fromJS({
                    messages: [],
                    customer,
                })}
            />
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
                <TicketDetailContainer {...props} />,
                {
                    path: '/foo/:ticketId',
                    route: '/foo/new',
                }
            )

            rerender(
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
            <TicketDetailContainer {...props} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )
        rerender(
            <TicketDetailContainer
                {...props}
                newMessageSource={fromJS({to: []})}
            />
        )

        expect(minProps.setCustomer).toBeCalledWith(null)
    })

    it('should not unset the customer because the ticket is new and the new message is an internal note', () => {
        renderWithRouter(
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
                newMessageSource={fromJS({to: [], type: 'internal-note'})}
            />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        expect(minProps.setCustomer).not.toBeCalled()
    })

    it('should set the customer as first recipient because the ticket is new and the customer has changed', () => {
        const props = {
            ...minProps,
            ticket: fromJS({
                messages: [],
            }),
            newMessage: newMessageState,
            newMessageSource: fromJS({
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
            }),
        }
        const {rerender} = renderWithRouter(
            <TicketDetailContainer {...props} />,
            {
                path: '/foo/:ticketId',
                route: '/foo/new',
            }
        )

        rerender(
            <TicketDetailContainer
                {...props}
                ticket={fromJS({
                    customer: {
                        id: 1,
                        name: 'foo',
                        email: 'foo@gorgias.io',
                    },
                })}
            />
        )

        expect(minProps.setReceivers).toBeCalledWith({
            to: [
                {
                    name: 'foo',
                    address: 'foo@gorgias.io',
                },
            ],
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
        })
    })

    it('should defer sending new message when new message is of type email', async () => {
        ;((minProps.prepareTicketMessage as unknown) as jest.MockedFunction<
            () => typeof preparedData
        >).mockReturnValueOnce(preparedData)
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    messages: [],
                })}
                newMessage={newMessageState}
                canSendMessage
            />,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-close'))
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
        ;((minProps.prepareTicketMessage as unknown) as jest.MockedFunction<
            () => typeof preparedFacebookData
        >).mockReturnValueOnce(preparedFacebookData)
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    messages: [],
                })}
                newMessage={newMessageState}
                canSendMessage
            />,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-close'))
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
        ;((minProps.prepareTicketMessage as unknown) as jest.MockedFunction<
            () => typeof preparedData
        >).mockReturnValue(preparedData)
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    messages: [],
                })}
                newMessage={newMessageState}
                canSendMessage
            />,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-close'))
        userEvent.click(getByTestId('TicketView-close'))
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

    it('should close the ticket and redirect to the next ticket on new ticket submit success', async () => {
        let resolveSubmitTicket: (value?: unknown) => void
        const submitTicketMock = jest.fn().mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveSubmitTicket = resolve
                })
        )
        const setStatus = jest
            .fn()
            .mockImplementation((status, callback: () => void) => callback())
        const history = createMemoryHistory({initialEntries: ['/foo/new']})
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                currentUser={currentUser}
                canSendMessage
                submitTicket={submitTicketMock}
                setStatus={setStatus}
            />,
            {
                path: '/foo/:ticketId',
                history,
            }
        )

        userEvent.click(getByTestId('TicketView-close'))
        act(() => {
            history.push('/foo/123')
            resolveSubmitTicket()
        })

        await waitFor(() => {
            expect(setStatus).toHaveBeenLastCalledWith(
                'closed',
                expect.any(Function)
            )
            expect(minProps.goToNextTicket).toHaveBeenLastCalledWith(
                123,
                expect.any(Promise)
            )
        })
    })

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
            <TicketDetailContainer
                {...minProps}
                ticket={fromJS({
                    id: 1,
                    messages: [],
                })}
                newMessage={newMessageState}
                canSendMessage
            />,
            {
                path: '/foo/:ticketId',
                route: '/foo/1',
            }
        )

        userEvent.click(getByTestId('TicketView-close'))
        await flushPromises()
    })

    it.each<[string, string, () => jest.Mock]>([
        [
            'next',
            'GO_FORWARD',
            () => {
                return (minProps.goToNextTicket as jest.Mock).mockReturnValue(
                    new Promise(_noop)
                )
            },
        ],
        [
            'prev',
            'GO_BACK',
            () => {
                return (minProps.goToPrevTicket as jest.Mock).mockReturnValue(
                    new Promise(_noop)
                )
            },
        ],
    ])(
        'should debounce %s ticket calls while call is already pending',
        (testName, actionName, testSetup) => {
            const execKeyboardAction = makeExecuteKeyboardAction(
                shortcutManagerMock
            )
            const callMock = testSetup()
            renderWithRouter(<TicketDetailContainer {...minProps} />, {
                path: '/foo/:ticketId',
                route: '/foo/1',
            })

            execKeyboardAction(actionName)
            execKeyboardAction(actionName)

            expect(callMock).toHaveBeenCalledTimes(1)
        }
    )
})
