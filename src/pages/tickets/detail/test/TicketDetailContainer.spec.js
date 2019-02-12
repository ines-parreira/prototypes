import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import _merge from 'lodash/merge'
import {browserHistory} from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import moment from 'moment'

import * as customersActions from '../../../../state/customers/actions'
import * as newMessageActions from '../../../../state/newMessage/actions'
import * as ticketActions from '../../../../state/ticket/actions'

import TicketDetailContainer from '../TicketDetailContainer'
import * as ticketsActions from '../../../../state/tickets/actions'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../../../state/customers/actions', () => {
    const _identity = require('lodash/identity')

    return {
        fetchCustomer: jest.fn(() => _identity),
        fetchCustomers: jest.fn(() => _identity),
    }
})

jest.mock('../../../../state/newMessage/actions', () => {
    const _identity = require('lodash/identity')

    return {
        setReceivers: jest.fn(() => _identity),
        submitTicket: jest.fn(() => _identity),
        submitTicketMessage: jest.fn(() => _identity),
        resetReceiversAndSender: jest.fn(() => _identity),
    }
})

jest.mock('../../../../state/tickets/actions', () => {
    const _identity = require('lodash/identity')
    return {
        updateCursor: jest.fn(() => _identity),
    }
})

jest.mock('../../../../state/ticket/actions', () => {
    const _identity = require('lodash/identity')

    return {
        fetchTicket: jest.fn(() => _identity),
        clearTicket: jest.fn(() => _identity),
        setCustomer: jest.fn(() => () => Promise.resolve()),
        setStatus: jest.fn((status, callback) => () => callback()),
        goToNextTicket: jest.fn(() => () => Promise.resolve),
        findAndSetCustomer: jest.fn(() => () => Promise.resolve),
    }
})

describe('TicketDetailContainer component', () => {
    const minProps = {
        router: {
            ...browserHistory,
            setRouteLeaveHook: _noop,
            isActive: _noop,

            params: {
                ticketId: 'new'
            },
            location: {
                query: {}
            },
        },
        route: {},
    }

    beforeEach(() => {
        jest.clearAllMocks()
        minProps.store = mockStore({
            ticket: fromJS({
                messages: [],
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        to: []
                    }
                }
            })
        })
    })

    it('should render container for new ticket', () => {
        const component = shallow(<TicketDetailContainer {...minProps} />).dive().dive()
        expect(component).toMatchSnapshot()
    })

    it('should have new ticket title', () => {
        const component = shallow(<TicketDetailContainer {...minProps} />).dive().dive()
        expect(component.prop('title')).toBe('New ticket')
    })

    it('should fetch customer details from url', () => {
        const router = _merge(
            {...minProps.router},
            {location: {query: {customer:'1'}}}
        )

        shallow(
            <TicketDetailContainer
                {...minProps}
                router={router}
                />
        ).dive().dive()

        expect(customersActions.fetchCustomer).toBeCalledWith(1)
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
                params={{customerId: '1'}}
                location={{query: {customer:'1'}}}
                />
        ).dive().dive()

        component.setProps({activeCustomer})

        expect(ticketActions.setCustomer).toBeCalledWith(
            activeCustomer.set('address', activeCustomer.get('email'))
        )
    })

    it('should not go to next ticket when setting status=closed and history is open', () => {
        const store = mockStore({
            ticket: fromJS({
                messages: [],
                _internal: {
                    displayHistory: true
                }
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        to: []
                    }
                }
            })
        })

        const component = shallow(
            <TicketDetailContainer
                router={minProps.router}
                store={store}
            />
        ).dive().dive().instance()

        component._hideTicket = jest.fn()
        component._setStatus('closed')

        expect(component._hideTicket.mock.calls.length).toBe(0)
    })

    it('should go to next ticket when setting status=closed and history is closed', () => {
        const store = mockStore({
            ticket: fromJS({
                messages: [],
                _internal: {
                    displayHistory: false
                }
            }),
            newMessage: fromJS({
                newMessage: {
                    source: {
                        to: []
                    }
                }
            })
        })

        const component = shallow(
            <TicketDetailContainer
                router={minProps.router}
                store={store}
            />
        ).dive().dive().instance()

        component._hideTicket = jest.fn(() => Promise.resolve())
        component._setStatus('closed')

        expect(component._hideTicket.mock.calls.length).toBe(1)
    })

    it('should set activeCustomer as receiver', () => {
        const activeCustomer = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        })

        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                location={{query: {customer:'1'}}}
                />
        ).dive().dive()

        component.setProps({activeCustomer})

        // wait promise to be resolved
        setTimeout(() => {
            expect(newMessageActions.setReceivers).toBeCalledWith({
                to: [activeCustomer.set('address', activeCustomer.get('email')).toJS()]
            }, true)
        }, 1)
    })

    it('should update cursor of the view when the id of the ticket changes', () => {
        const activeView = fromJS({order_by: 'updated_datetime'})
        const newTicket = fromJS({id: 9999, updated_datetime: '2018-12-20'})
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                params={{customerId: '1'}}
                location={{query: {customer:'1'}}}
                />
        ).dive().dive()
        component.setProps({activeView: activeView})
        component.setProps({ticket: newTicket})

        expect(ticketsActions.updateCursor).toBeCalledWith(newTicket.get(activeView.get('order_by')))
    })

    it('should NOT update the cursor of the view when ticket\'s attributes change', () => {
        const activeView = fromJS({order_by: 'updated_datetime'})
        const ticket = minProps.store.getState().ticket
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                activeView={activeView}
                params={{customerId: '1'}}
                location={{query: {customer:'1'}}}
                />
        ).dive().dive()
        component.setProps({ticket: ticket.set('updated_datetime', moment())})

        expect(ticketsActions.updateCursor).not.toHaveBeenCalled()
    })

    it('should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
        'from no recipients to one recipient', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
            />
        ).dive().dive()

        component.setProps({
            newMessageSource: fromJS({
                to: [{
                    name: 'foo',
                    address: 'foo@gorgias.io'
                }]
            })
        })

        expect(ticketActions.findAndSetCustomer).toBeCalledWith('foo@gorgias.io')
    })

    it('should try to set the first recipient as customer because this ticket is new and the recipients have changed ' +
        'from multiple recipients to one recipient', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                store={mockStore({
                    ticket: fromJS({
                        messages: [],
                    }),
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                to: [{
                                    name: 'foo',
                                    address: 'foo@gorgias.io'
                                }, {
                                    name: 'bar',
                                    address: 'bar@gorgias.io'
                                }]
                            }
                        }
                    })
                })}
            />
        ).dive().dive()

        component.setProps({
            newMessageSource: fromJS({
                to: [{
                    name: 'foo',
                    address: 'foo@gorgias.io'
                }]
            })
        })

        expect(ticketActions.findAndSetCustomer).toBeCalledWith('foo@gorgias.io')
    })

    it('should not try to set the first recipient as customer because event though this ticket is new and the ' +
        'recipients have changed from multiple recipients to one recipient, this is the same customer', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                store={mockStore({
                    ticket: fromJS({
                        messages: [],
                        customer: {
                            name: 'foo',
                            email: 'foo@gorgias.io',
                            channels: [{
                                type: 'email',
                                address: 'foo@gorgias.io'
                            }]
                        }
                    }),
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                to: [{
                                    name: 'foo',
                                    address: 'foo@gorgias.io'
                                }, {
                                    name: 'bar',
                                    address: 'bar@gorgias.io'
                                }]
                            }
                        }
                    })
                })}
            />
        ).dive().dive()

        component.setProps({
            newMessageSource: fromJS({
                to: [{
                    name: 'foo',
                    address: 'foo@gorgias.io'
                }]
            })
        })

        expect(ticketActions.findAndSetCustomer).not.toHaveBeenCalled()
    })

    it('should not try to set the first recipient as customer because the only recipient is in the `cc` field, and ' +
        'not in the `to` field', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                store={mockStore({
                    ticket: fromJS({
                        messages: [],
                        customer: {
                            name: 'foo',
                            email: 'foo@gorgias.io',
                            channels: [{
                                type: 'email',
                                address: 'foo@gorgias.io'
                            }]
                        }
                    }),
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                to: [{
                                    name: 'foo',
                                    address: 'foo@gorgias.io'
                                }, {
                                    name: 'bar',
                                    address: 'bar@gorgias.io'
                                }]
                            }
                        }
                    })
                })}
            />
        ).dive().dive()

        component.setProps({
            newMessageSource: fromJS({
                to: [{
                    name: 'foo',
                    address: 'foo@gorgias.io'
                }]
            })
        })

        expect(ticketActions.findAndSetCustomer).not.toHaveBeenCalled()
    })

    it('should set the customer to null because the ticket is new and the recipients have been removed', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                store={mockStore({
                    ticket: fromJS({
                        messages: [],
                    }),
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                to: [{
                                    name: 'foo',
                                    address: 'foo@gorgias.io'
                                }]
                            }
                        }
                    })
                })}
            />
        ).dive().dive()

        component.setProps({newMessageSource: fromJS({to: []})})

        expect(ticketActions.setCustomer).toBeCalledWith(null)
    })

    it('should set the customer as first recipient because the ticket is new and the customer has changed', () => {
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                store={mockStore({
                    ticket: fromJS({
                        messages: [],
                    }),
                    newMessage: fromJS({
                        newMessage: {
                            source: {
                                cc: [{
                                    name: 'cc',
                                    address: 'cc@gorgias.io'
                                }],
                                bcc: [{
                                    name: 'bcc',
                                    address: 'bcc@gorgias.io'
                                }]
                            }
                        }
                    })
                })}
            />
        ).dive().dive()

        component.setProps({
            ticket: fromJS({
                customer: {
                    id: 1,
                    name: 'foo',
                    email: 'foo@gorgias.io'
                }
            }),
        })

        // This operation shouldn't modify the existing cc and bcc
        expect(newMessageActions.setReceivers).toBeCalledWith({
            to: [{
                name: 'foo',
                address: 'foo@gorgias.io'
            }],
            cc: [{
                name: 'cc',
                address: 'cc@gorgias.io'
            }],
            bcc: [{
                name: 'bcc',
                address: 'bcc@gorgias.io'
            }],
        })
    })
})
