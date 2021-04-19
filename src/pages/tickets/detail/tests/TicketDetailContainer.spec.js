//@flow
import React, {type ElementProps} from 'react'
import {act, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import moment from 'moment'
import {createMemoryHistory} from 'history'

import {renderWithRouter} from '../../../../utils/testing.tsx'
import {initialState as currentUser} from '../../../../state/currentUser/reducers.ts'
import pendingMessageManager from '../../../../services/pendingMessageManager'
import {TicketDetailContainer} from '../TicketDetailContainer'
import TicketView from '../components/TicketView'

jest.useFakeTimers()

jest.mock(
    '../components/TicketView',
    () => ({submit}: ElementProps<typeof TicketView>) => (
        <div
            data-testid="TicketView-close"
            onClick={() => {
                submit('closed')
            }}
        />
    )
)

jest.mock('../../../../services/pendingMessageManager', () => ({
    sendMessage: jest.fn(),
    skipExistingTimer: jest.fn(),
}))

describe('TicketDetailContainer component', () => {
    const minProps: any = {
        isTicketDirty: false,
        canSendMessage: false,
        actions: {
            customers: {
                fetchCustomer: jest.fn(),
                fetchCustomers: jest.fn(),
            },
            macro: {
                createMacro: jest.fn(),
                deleteMacro: jest.fn(),
                fetchMacros: jest.fn(),
                getMacro: jest.fn(),
                updateMacro: jest.fn(),
            },
            newMessage: {
                setReceivers: jest.fn(),
                submitTicket: jest.fn(),
                prepareTicketMessage: jest.fn(),
                resetReceiversAndSender: jest.fn(),
                sendTicketMessage: jest.fn(),
            },
            tag: {
                addTags: jest.fn(),
                bulkDelete: jest.fn(),
                cancel: jest.fn(),
                create: jest.fn(),
                edit: jest.fn(),
                fetchTags: jest.fn(),
                merge: jest.fn(),
                remove: jest.fn(),
                save: jest.fn(),
                select: jest.fn(),
                selectAll: jest.fn(),
                setPage: jest.fn(),
            },
            ticket: {
                fetchTicket: jest.fn(),
                clearTicket: jest.fn(),
                setCustomer: jest.fn().mockResolvedValue(undefined),
                setStatus: jest.fn(),
                goToNextTicket: jest.fn(),
                findAndSetCustomer: jest.fn(),
                messageDeleted: jest.fn(),
            },
            views: {
                addFieldFilter: jest.fn(),
                addRecentView: jest.fn(),
                createJob: jest.fn(),
                deleteView: jest.fn(),
                deleteViewSuccess: jest.fn(),
                fetchActiveViewTickets: jest.fn(),
                fetchRecentViewsCounts: jest.fn(),
                fetchViewItems: jest.fn(),
                fetchViews: jest.fn(),
                fetchViewsSuccess: jest.fn(),
                fetchVisibleViewsCounts: jest.fn(),
                fieldEnumSearch: jest.fn(),
                gotoActiveView: jest.fn(),
                handleViewsCount: jest.fn(),
                removeFieldFilter: jest.fn(),
                resetView: jest.fn(),
                setFieldVisibility: jest.fn(),
                setOrderDirection: jest.fn(),
                setPage: jest.fn(),
                setViewActive: jest.fn(),
                setViewEditMode: jest.fn(),
                submitView: jest.fn(),
                toggleIdInSelectedItemsIds: jest.fn(),
                toggleViewSelection: jest.fn(),
                updateFieldFilter: jest.fn(),
                updateFieldFilterOperator: jest.fn(),
                updateRecentViews: jest.fn(),
                updateSelectedItemsIds: jest.fn(),
                updateView: jest.fn(),
            },
        },
        updateActiveViewCursor: jest.fn(),
        submitTicket: jest.fn(),
        ticket: fromJS({
            messages: [],
        }),
        newMessage: fromJS({
            newMessage: {
                source: {
                    to: [],
                },
            },
        }),
        activeView: fromJS({}),
        activeCustomer: fromJS({}),
        newMessageSource: fromJS({}),
        customers: fromJS({}),
    }
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

        expect(minProps.actions.customers.fetchCustomer).toBeCalledWith('1')
    })

    it('should set activeCustomer as customer', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        })

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

        expect(minProps.actions.ticket.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email'))
        )
    })

    it('should not go to next ticket when setting status=closed and history is open', () => {
        minProps.actions.ticket.setStatus.mockImplementationOnce((v, cb) => {
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
        expect(minProps.actions.ticket.goToNextTicket).not.toHaveBeenCalled()
    })

    it('should go to next ticket when setting status=closed and history is closed', async () => {
        minProps.actions.ticket.setStatus.mockImplementationOnce((v, cb) => {
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
        await waitFor(() =>
            expect(minProps.actions.ticket.goToNextTicket).toHaveBeenCalled()
        )
    })

    it('should set activeCustomer as receiver', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        })
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

        expect(minProps.actions.ticket.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email'))
        )
        expect(minProps.actions.newMessage.setReceivers).toBeCalledWith({
            to: [expectedReceiver],
        })
    })

    it('should update cursor of the view when the id of the ticket changes', () => {
        const activeView = fromJS({order_by: 'updated_datetime'})
        const newTicket = fromJS({id: 9999, updated_datetime: '2018-12-20'})
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

        expect(minProps.updateActiveViewCursor).toBeCalledWith(
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

        expect(minProps.updateActiveViewCursor).not.toHaveBeenCalled()
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

            expect(minProps.actions.ticket.findAndSetCustomer).toBeCalledWith(
                'foo@gorgias.io'
            )
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
            expect(minProps.actions.ticket.findAndSetCustomer).toBeCalledWith(
                'foo@gorgias.io'
            )
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

            expect(
                minProps.actions.ticket.findAndSetCustomer
            ).not.toHaveBeenCalled()
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
        expect(props.actions.ticket.setCustomer).not.toHaveBeenCalled()

        rerender(
            <TicketDetailContainer
                {...props}
                ticket={fromJS({
                    messages: [],
                    customer,
                })}
            />
        )

        expect(props.actions.ticket.setCustomer).toHaveBeenCalledWith(
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

            expect(
                minProps.actions.ticket.findAndSetCustomer
            ).not.toHaveBeenCalled()
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

        expect(minProps.actions.ticket.setCustomer).toBeCalledWith(null)
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

        expect(minProps.actions.ticket.setCustomer).not.toBeCalled()
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

        expect(minProps.actions.newMessage.setReceivers).toBeCalledWith({
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
        minProps.actions.newMessage.prepareTicketMessage.mockReturnValueOnce(
            preparedData
        )
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                currentAccount={fromJS({
                    status: {
                        status: 'active',
                    },
                })}
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
        minProps.actions.newMessage.prepareTicketMessage.mockReturnValueOnce(
            preparedFacebookData
        )
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                currentAccount={fromJS({
                    status: {
                        status: 'active',
                    },
                })}
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
            expect(
                minProps.actions.newMessage.sendTicketMessage
            ).toHaveBeenNthCalledWith(
                1,
                1,
                preparedFacebookData.messageToSend,
                undefined,
                true
            )
        )
    })

    it('should send a deferred message when sending a new deferred message', async () => {
        minProps.actions.newMessage.prepareTicketMessage.mockReturnValue(
            preparedData
        )
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                currentAccount={fromJS({
                    status: {
                        status: 'active',
                    },
                })}
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
        let resolveSubmitTicket
        const submitTicketMock = jest.fn().mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveSubmitTicket = resolve
                })
        )
        const setStatus = jest
            .fn()
            .mockImplementation((status, callback) => callback())
        const history = createMemoryHistory({initialEntries: ['/foo/new']})
        const {getByTestId} = renderWithRouter(
            <TicketDetailContainer
                {...minProps}
                currentUser={currentUser}
                canSendMessage
                submitTicket={submitTicketMock}
                actions={{
                    ...minProps.actions,
                    ticket: {
                        ...minProps.actions.ticket,
                        setStatus,
                    },
                }}
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
            expect(
                minProps.actions.ticket.goToNextTicket
            ).toHaveBeenLastCalledWith(123, expect.any(Promise))
        })
    })
})
