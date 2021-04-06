//@flow
import React, {type ElementProps, type ElementRef} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import moment from 'moment'

import pendingMessageManager from '../../../../services/pendingMessageManager'
import {TicketDetailContainer} from '../TicketDetailContainer'
import TicketView from '../components/TicketView'

jest.useFakeTimers()

jest.mock(
    '../components/TicketView',
    () => ({submit}: ElementProps<typeof TicketView>) => (
        <div onClick={submit} />
    )
)

jest.mock('../../../../services/pendingMessageManager', () => ({
    sendMessage: jest.fn(),
    skipExistingTimer: jest.fn(),
}))

describe('TicketDetailContainer component', () => {
    const minProps: any = {
        match: {
            params: {
                ticketId: 'new',
            },
        },
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
        location: {
            search: '',
        },
        activeView: fromJS({}),
        activeCustomer: fromJS({}),
        newMessageSource: fromJS({}),
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
        const component = shallow(<TicketDetailContainer {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should have new ticket title', () => {
        const component = shallow(<TicketDetailContainer {...minProps} />)
        expect(component.dive().prop('title')).toBe('New ticket')
    })

    it('should fetch customer details from url', () => {
        shallow(
            <TicketDetailContainer
                {...minProps}
                location={{search: '?customer=1'}}
            />
        )

        expect(minProps.actions.customers.fetchCustomer).toBeCalledWith('1')
    })

    it('should set activeCustomer as customer', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        })

        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                match={{params: {customerId: '1', ticketId: 'new'}}}
                location={{search: '?customer=1'}}
            />
        )

        component.setProps({activeCustomer})

        expect(minProps.actions.ticket.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email'))
        )
    })

    it('should not go to next ticket when setting status=closed and history is open', () => {
        const component: ElementRef<typeof TicketDetailContainer> = shallow(
            <TicketDetailContainer
                {...minProps}
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
            />
        ).instance()

        component._hideTicket = jest.fn()
        component._setStatus('closed')

        expect((component._hideTicket: any).mock.calls.length).toBe(0)
    })

    it('should go to next ticket when setting status=closed and history is closed', () => {
        minProps.actions.ticket.setStatus.mockImplementationOnce((v, cb) => {
            cb()
        })

        const component: ElementRef<typeof TicketDetailContainer> = shallow(
            <TicketDetailContainer
                {...minProps}
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
            />
        ).instance()

        component._hideTicket = jest.fn(() => Promise.resolve())
        component._setStatus('closed')

        expect((component._hideTicket: any).mock.calls.length).toBe(1)
    })

    it('should set activeCustomer as receiver', (done) => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        })

        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                location={{search: '?customer=1'}}
            />
        )

        component.setProps({activeCustomer})

        // wait promise to be resolved
        setImmediate(() => {
            expect(minProps.actions.newMessage.setReceivers).toBeCalledWith(
                {
                    to: [
                        activeCustomer
                            .set('address', activeCustomer.get('email'))
                            .toJS(),
                    ],
                },
                true
            )
            done()
        })
    })

    it('should update cursor of the view when the id of the ticket changes', () => {
        const activeView = fromJS({order_by: 'updated_datetime'})
        const newTicket = fromJS({id: 9999, updated_datetime: '2018-12-20'})
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                match={{params: {customerId: '1'}}}
                location={{search: '?customer=1'}}
            />
        )
        component.setProps({activeView: activeView})
        component.setProps({ticket: newTicket})

        expect(minProps.updateActiveViewCursor).toBeCalledWith(
            newTicket.get(activeView.get('order_by'))
        )
    })

    it("should NOT update the cursor of the view when ticket's attributes change", () => {
        const activeView = fromJS({order_by: 'updated_datetime'})
        const ticket = minProps.ticket
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                activeView={activeView}
                match={{params: {customerId: '1'}}}
                location={{search: '?customer=1'}}
            />
        )
        component.setProps({ticket: ticket.set('updated_datetime', moment())})

        expect(minProps.updateActiveViewCursor).not.toHaveBeenCalled()
    })

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from no recipients to one recipient',
        () => {
            const component = shallow(<TicketDetailContainer {...minProps} />)

            component.setProps({
                newMessageSource: fromJS({
                    to: [
                        {
                            name: 'foo',
                            address: 'foo@gorgias.io',
                        },
                    ],
                }),
            })

            expect(minProps.actions.ticket.findAndSetCustomer).toBeCalledWith(
                'foo@gorgias.io'
            )
        }
    )

    it(
        'should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
            'from multiple recipients to one recipient',
        () => {
            const component = shallow(
                <TicketDetailContainer
                    {...minProps}
                    ticket={fromJS({
                        messages: [],
                    })}
                    newMessage={newMessageState}
                />
            )

            component.setProps({
                newMessageSource: fromJS({
                    to: [
                        {
                            name: 'foo',
                            address: 'foo@gorgias.io',
                        },
                    ],
                }),
            })

            expect(minProps.actions.ticket.findAndSetCustomer).toBeCalledWith(
                'foo@gorgias.io'
            )
        }
    )

    it(
        'should not try to set the first recipient as customer because event though this ticket is new and the ' +
            'recipients have changed from multiple recipients to one recipient, this is the same customer',
        () => {
            const component = shallow(
                <TicketDetailContainer
                    {...minProps}
                    ticket={fromJS({
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
                    })}
                    newMessage={newMessageState}
                />
            )

            component.setProps({
                newMessageSource: fromJS({
                    to: [
                        {
                            name: 'foo',
                            address: 'foo@gorgias.io',
                        },
                    ],
                }),
            })

            expect(
                minProps.actions.ticket.findAndSetCustomer
            ).not.toHaveBeenCalled()
        }
    )

    it(
        'should not try to set the first recipient as customer because the only recipient is in the `cc` field, and ' +
            'not in the `to` field',
        () => {
            const component = shallow(
                <TicketDetailContainer
                    {...minProps}
                    ticket={fromJS({
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
                    })}
                    newMessage={newMessageState}
                />
            )

            component.setProps({
                newMessageSource: fromJS({
                    to: [
                        {
                            name: 'foo',
                            address: 'foo@gorgias.io',
                        },
                    ],
                }),
            })

            expect(
                minProps.actions.ticket.findAndSetCustomer
            ).not.toHaveBeenCalled()
        }
    )

    it('should set the customer to null because the ticket is new and the recipients have been removed', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                ticket={fromJS({
                    messages: [],
                })}
                newMessage={fromJS({
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
                })}
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

        component.setProps({newMessageSource: fromJS({to: []})})

        expect(minProps.actions.ticket.setCustomer).toBeCalledWith(null)
    })

    it('should not unset the customer because the ticket is new and the new message is an internal note', () => {
        const component = shallow(
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
            />
        )

        component.setProps({
            newMessageSource: fromJS({to: [], type: 'internal-note'}),
        })

        expect(minProps.actions.ticket.setCustomer).toBeCalledTimes(0)
    })

    it('should set the customer as first recipient because the ticket is new and the customer has changed', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                ticket={fromJS({
                    messages: [],
                })}
                newMessage={newMessageState}
                newMessageSource={fromJS({
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
                })}
            />
        )

        component.setProps({
            ticket: fromJS({
                customer: {
                    id: 1,
                    name: 'foo',
                    email: 'foo@gorgias.io',
                },
            }),
        })

        // This operation shouldn't modify the existing cc and bcc
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

    it('should defer sending new message when new message is of type email', (done) => {
        minProps.actions.newMessage.prepareTicketMessage.mockReturnValueOnce(
            preparedData
        )
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                match={{
                    params: {
                        ticketId: '1',
                    },
                }}
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
            />
        )

        component.find(TicketView).props().submit()
        setImmediate(() => {
            jest.runAllTimers()
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
            done()
        })
    })

    it('should NOT defer sending new message when new message is NOT of type email', (done) => {
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
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                match={{
                    params: {
                        ticketId: '1',
                    },
                }}
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
            />
        )

        component.find(TicketView).props().submit()
        setImmediate(() => {
            expect(
                minProps.actions.newMessage.sendTicketMessage
            ).toHaveBeenNthCalledWith(
                1,
                1,
                preparedFacebookData.messageToSend,
                undefined,
                true
            )
            done()
        })
    })

    it('should send a deferred message when sending a new deferred message', (done) => {
        minProps.actions.newMessage.prepareTicketMessage.mockReturnValue(
            preparedData
        )
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                match={{
                    params: {
                        ticketId: '1',
                    },
                }}
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
            />
        )

        component.find(TicketView).props().submit()
        component.find(TicketView).props().submit()
        setImmediate(() => {
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
            done()
        })
    })
})
