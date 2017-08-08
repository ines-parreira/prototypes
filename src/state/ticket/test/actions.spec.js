import configureMockStore from 'redux-mock-store'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import * as types from '../constants'
import * as actions from '../actions'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('ticket', () => {
        let store
        let mockServer

        beforeEach(() => {
            store = mockStore({ticket: initialState})
            mockServer = new MockAdapter(axios)
        })

        it('should fail to delete ticket', () => {
            const expectedActions = [{
                type: types.DELETE_TICKET_ERROR
            }]

            return store.dispatch(actions.deleteTicket(13)).then(() => {
                store.getActions().forEach((action, index) => {
                    expect(action.type).toEqual(expectedActions[index].type)
                })
            })
        })

        describe('setSpam()', () => {
            it('should dispatch actions', () => {
                store = mockStore({ticket: initialState.set('id', 1)})

                const expectedActions = [{
                    type: types.SET_SPAM,
                    spam: true
                }, {
                    type: types.TICKET_PARTIAL_UPDATE_START,
                    args: {spam: true},
                }, {
                    type: types.TICKET_PARTIAL_UPDATE_SUCCESS,
                    resp: {data: {}},
                }]
                mockServer.onPut(/\/api\/tickets\/\d+\//).reply(202, {data: {}})

                return store.dispatch(actions.setSpam(true)).then(() => {
                    expect(store.getActions()).toEqual(expectedActions)
                })
            })

            it('should not dispatch actions (same status)', () => {
                store = mockStore({ticket: initialState.set('spam', true)})

                return store.dispatch(actions.setSpam(true)).then(() => {
                    expect(store.getActions()).toEqual([])
                })
            })
        })

        it('should set requester with partial update', () => {
            const expectedActions = [
                {type: types.SET_REQUESTER},
                {type: types.TICKET_PARTIAL_UPDATE_START},
                {type: types.TICKET_PARTIAL_UPDATE_SUCCESS},
            ]
            const store = mockStore({
                ticket: initialState.merge({id: 1})
            })
            const requester = fromJS({id: 1})

            mockServer
                .onPut('/api/tickets/1/')
                .reply(200)

            return store.dispatch(actions.setRequester(requester)).then(() => {
                store.getActions().forEach((action, index) => {
                    expect(action.type).toEqual(expectedActions[index].type)
                })
            })
        })

        it('should only send requester id with setRequester', () => {
            const store = mockStore({
                ticket: initialState.merge({id: 1})
            })
            const requester = fromJS({
                id: 1,
                custom: true
            })

            mockServer
                .onPut('/api/tickets/1/')
                .reply(200)

            return store.dispatch(actions.setRequester(requester)).then(() => {
                store.getActions().some((action) => {
                    if (action.type === types.TICKET_PARTIAL_UPDATE_START) {
                        expect(action.args.requester).toEqualImmutable(fromJS({id:1}))

                        return true
                    }
                })
            })
        })
    })

    describe('replace variables', () => {
        it('should return empty value if no matching integration', () => {
            const ticketState = fromJS({
                requester: {
                    integrations: {
                        15: {
                            __integration_type__: 'weirdtype',
                            customer: {
                                foo: 'bar'
                            }
                        }
                    }
                }
            })

            const variable = 'ticket.requester.integrations.shopify.customer.foo'

            const logs = []
            const dispatch = (arg) => logs.push(arg)

            const newArg = 'Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations.shopify.customer.foo}?'

            const res = actions.replaceIntegrationVariables('shopify', ticketState, variable, newArg, dispatch)

            expect(res).toEqual('Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {}?')
            expect(logs.length).toEqual(1)
        })

        it('should update the Shopify variable with the correct integrations id', () => {
            const ticketState = fromJS({
                requester: {
                    integrations: {
                        15: {
                            __integration_type__: 'shopify',
                            customer: {
                                foo: 'bar'
                            }
                        }
                    }
                }
            })

            const variable = 'ticket.requester.integrations.shopify.customer.foo'

            const logs = []
            const dispatch = (arg) => logs.push(arg)

            const newArg = 'Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations.shopify.customer.foo}?'

            const res = actions.replaceIntegrationVariables('shopify', ticketState, variable, newArg, dispatch)

            expect(res).toEqual('Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations[15].customer.foo}?')
            expect(logs.length).toEqual(0)
        })

        it('should take data from first of multiple Shopify integrations', () => {
            const ticketState = fromJS({
                requester: {
                    integrations: {
                        15: {
                            __integration_type__: 'shopify',
                            customer: {
                                foo: 'bar'
                            }
                        },
                        17: {
                            __integration_type__: 'shopify',
                            customer: {
                                foo: 'bar'
                            }
                        }
                    }
                }
            })

            const variable = 'ticket.requester.integrations.shopify.customer.foo'

            const logs = []
            const dispatch = (arg) => logs.push(arg)

            const newArg = 'Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations.shopify.customer.foo}?'

            const res = actions.replaceIntegrationVariables('shopify', ticketState, variable, newArg, dispatch)

            expect(res).toEqual('Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations[15].customer.foo}?')
            expect(logs.length).toEqual(0)
        })

        it('should take data from most recent of multiple Shopify integrations updates based on updated_at info', () => {
            const ticketState = fromJS({
                requester: {
                    integrations: {
                        15: {
                            __integration_type__: 'shopify',
                            customer: {
                                foo: 'bar',
                                updated_at: '2017-06-17T13:57:14-04:00',
                            }
                        },
                        16: {
                            __integration_type__: 'shopify',
                            customer: {
                                foo: 'bar',
                                updated_at: '2017-06-19T13:57:14-04:00',
                            }
                        },
                        17: {
                            __integration_type__: 'shopify',
                            customer: {
                                foo: 'bar',
                                updated_at: '2017-06-18T13:57:14-04:00',
                            }
                        }
                    }
                }
            })

            const variable = 'ticket.requester.integrations.shopify.customer.foo'

            const logs = []
            const dispatch = (arg) => logs.push(arg)

            const newArg = 'Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations.shopify.customer.foo}?'

            const res = actions.replaceIntegrationVariables('shopify', ticketState, variable, newArg, dispatch)

            expect(res).toEqual('Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations[16].customer.foo}?')
            expect(logs.length).toEqual(0)
        })
    })
})
