import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import _noop from 'lodash/noop'
import _merge from 'lodash/merge'
import {browserHistory} from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as userActions from '../../../../state/users/actions'
import * as newMessageActions from '../../../../state/newMessage/actions'
import * as ticketActions from '../../../../state/ticket/actions'

import TicketDetailContainer from '../TicketDetailContainer'
import * as ticketsActions from '../../../../state/tickets/actions'
import moment from 'moment'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

jest.mock('../../../../state/users/actions', () => {
    const _identity = require('lodash/identity')

    return {
        fetchUser: jest.fn(() => _identity),
        fetchUsers: jest.fn(() => _identity),
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
        setRequester: jest.fn(() => () => Promise.resolve()),
        setStatus: jest.fn((status, callback) => () => callback()),
        goToNextTicket: jest.fn(() => () => Promise.resolve)
    }
})

describe('TicketDetailContainer component', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const minProps = {
        store: mockStore({
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
        }),
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

    it('should render container for new ticket', () => {
        const component = shallow(<TicketDetailContainer {...minProps} />).dive().dive()
        expect(component).toMatchSnapshot()
    })

    it('should have new ticket title', () => {
        const component = shallow(<TicketDetailContainer {...minProps} />).dive().dive()
        expect(component.prop('title')).toBe('New ticket')
    })

    it('should fetch user details from url', () => {
        const router = _merge(
            {...minProps.router},
            {location: {query: {requester:'1'}}}
        )

        shallow(
            <TicketDetailContainer
                {...minProps}
                router={router}
                />
        ).dive().dive()

        expect(userActions.fetchUser).toBeCalledWith(1)
    })

    it('should set activeUser as requester', () => {
        const activeUser = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        })

        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                params={{userId: '1'}}
                location={{query: {requester:'1'}}}
                />
        ).dive().dive()

        component.setProps({activeUser})

        expect(ticketActions.setRequester).toBeCalledWith(
            activeUser.set('address', activeUser.get('email'))
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

    it('should set activeUser as receiver', () => {
        const activeUser = fromJS({
            id: 1,
            name: 'Pizza Pepperoni',
            email: 'pizza@pepperoni.com',
        })

        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                location={{query: {requester:'1'}}}
                />
        ).dive().dive()

        component.setProps({activeUser})

        // wait promise to be resolved
        setTimeout(() => {
            expect(newMessageActions.setReceivers).toBeCalledWith({
                to: [activeUser.set('address', activeUser.get('email')).toJS()]
            }, true)
        }, 1)
    })

    it('should update cursor of the view when the id of the ticket changes', () => {
        const activeView = fromJS({order_by: 'updated_datetime'})
        const newTicket = fromJS({id: 9999, updated_datetime: '2018-12-20'})
        const component = shallow(
            <TicketDetailContainer
                {...minProps}
                params={{userId: '1'}}
                location={{query: {requester:'1'}}}
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
                params={{userId: '1'}}
                location={{query: {requester:'1'}}}
                />
        ).dive().dive()
        component.setProps({ticket: ticket.set('updated_datetime', moment())})

        expect(ticketsActions.updateCursor).not.toHaveBeenCalled()
    })
})
