import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import * as types from '../constants'
import * as actions from '../actions'
import {initialState} from '../reducers'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('actions', () => {
    describe('ticket', () => {
        let store

        beforeEach(() => {
            store = mockStore(initialState)
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
    })

    describe('replace Recharge variables', () => {
        it('should replace the variable with null since the requester has no Recharge data', () => {
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

            const variable = 'ticket.requester.integrations.recharge.customer.foo'

            const logs = []
            const dispatch = (arg) => logs.push(arg)

            const newArg = 'Hello {ticket.requester.integration.recharge.customer.name}, ' +
                'what is your {null}?'

            const res = actions.replaceRechargeVariables(ticketState, variable, dispatch, newArg)

            expect(res).toEqual(newArg)
        })

        it('should update the Recharge variable with the correct integrations id', () => {
            const ticketState = fromJS({
                requester: {
                    integrations: {
                        15: {
                            __integration_type__: 'recharge',
                            customer: {
                                foo: 'bar'
                            }
                        }
                    }
                }
            })

            const variable = 'ticket.requester.integrations.recharge.customer.foo'

            const logs = []
            const dispatch = (arg) => logs.push(arg)

            const newArg = 'Hello {ticket.requester.integration.recharge.customer.name}, ' +
                'what is your {ticket.requester.integrations.recharge.customer.foo}?'

            const res = actions.replaceRechargeVariables(ticketState, variable, dispatch, newArg)

            expect(res).toEqual('Hello {ticket.requester.integration.recharge.customer.name}, ' +
                'what is your {ticket.requester.integrations[15].customer.foo}?')
        })

        it('should raise an error because the user has data on multiple Recharge integrations', () => {
            const ticketState = fromJS({
                requester: {
                    integrations: {
                        15: {
                            __integration_type__: 'recharge',
                            customer: {
                                foo: 'bar'
                            }
                        },
                        17: {
                            __integration_type__: 'recharge',
                            customer: {
                                foo: 'bar'
                            }
                        }
                    }
                }
            })

            const variable = 'ticket.requester.integrations.recharge.customer.foo'

            const logs = []
            const dispatch = (arg) => logs.push(arg)

            const newArg = 'Hello {ticket.requester.integration.recharge.customer.name}, ' +
                'what is your {ticket.requester.integrations.recharge.customer.foo}?'

            const res = actions.replaceRechargeVariables(ticketState, variable, dispatch, newArg)

            expect(res).toEqual(undefined)
            expect(logs.length).toEqual(1)
        })
    })

    describe('replace Shopify variables', () => {
        it('should replace the variable with null since the requester has no Shopify data', () => {
            const ticketState = fromJS({
                requester: {
                    integrations: {
                        15: {
                            __integration_type__: 'recharge',
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
                'what is your {null}?'

            const res = actions.replaceShopifyVariables(ticketState, variable, dispatch, newArg)

            expect(res).toEqual(newArg)
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

            const res = actions.replaceShopifyVariables(ticketState, variable, dispatch, newArg)

            expect(res).toEqual('Hello {ticket.requester.integration.shopify.customer.name}, ' +
                'what is your {ticket.requester.integrations[15].customer.foo}?')
        })

        it('should raise an error because the user has data on multiple Shopify integrations', () => {
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

            const res = actions.replaceShopifyVariables(ticketState, variable, dispatch, newArg)

            expect(res).toEqual(undefined)
            expect(logs.length).toEqual(1)
        })
    })
})
