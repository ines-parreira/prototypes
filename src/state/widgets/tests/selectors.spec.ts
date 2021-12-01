import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

import {RootState} from '../../types'
import {WidgetContextType} from '../types'
import {
    getContext,
    getSources,
    getSourcesWithCustomer,
    getWidgets,
    getWidgetsState,
    getWidgetsWithContext,
    hasWidgets,
    hasWidgetsWithContext,
    isEditing,
} from '../selectors'

jest.addMatchers(immutableMatchers)

describe('widgets selectors', () => {
    describe('getWidgetsState', () => {
        it('should return widgets state because it exists', () => {
            const state = {
                widgets: fromJS({
                    foo: 'bar',
                }),
            } as RootState

            expect(getWidgetsState(state)).toEqualImmutable(
                fromJS({foo: 'bar'})
            )
        })

        it('should return an empty Map because widgets state does not exist', () => {
            const state = {
                foo: 'bar',
            } as unknown as RootState

            expect(getWidgetsState(state)).toEqualImmutable(fromJS({}))
        })
    })

    describe('getContext', () => {
        it('should return current context because it is set', () => {
            const currentContext = 'foo'
            const state = {
                widgets: fromJS({currentContext}),
            } as RootState

            expect(getContext(state)).toEqual(currentContext)
        })

        it('should return an empty string because current context is null', () => {
            const state = {
                widgets: fromJS({currentContext: null}),
            } as RootState

            expect(getContext(state)).toEqual('')
        })
    })

    describe('getWidgets', () => {
        it('should return items from the widgets state', () => {
            const items = [1, 2, 3]
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(getWidgets(state)).toEqualImmutable(fromJS(items))
        })

        it('should return an empty immutable list because items is not set', () => {
            const items = [1, 2, 3]
            const state = {
                widgets: fromJS({foo: items}),
            } as RootState

            expect(getWidgets(state)).toEqualImmutable(fromJS([]))
        })
    })

    describe('hasWidgets', () => {
        it('should return true because there is some widgets', () => {
            const items = [1, 2, 3]
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(hasWidgets(state)).toEqual(true)
        })

        it('should return false because the widgets items list is empty', () => {
            const items: never[] = []
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(hasWidgets(state)).toEqual(false)
        })

        it('should return false because the widgets items list does not exist', () => {
            const items: never[] = []
            const state = {
                widgets: fromJS({foo: items}),
            } as RootState

            expect(hasWidgets(state)).toEqual(false)
        })
    })

    describe('getWidgetsWithContext', () => {
        it('should return items with current context', () => {
            const items = [
                {id: 1, context: 'ticket'},
                {id: 2, context: 'customer'},
            ]
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(
                getWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqualImmutable(fromJS([{id: 1, context: 'ticket'}]))
            expect(
                getWidgetsWithContext(WidgetContextType.Customer)(state)
            ).toEqualImmutable(fromJS(items.slice(1)))
        })

        it('should return an empty list because there is no items with current context', () => {
            const items = [
                {id: 1, context: 'customer'},
                {id: 2, context: 'customer'},
            ]
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(
                getWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqualImmutable(fromJS([]))
        })

        it('should return an empty list because there is no items at all', () => {
            const items: never[] = []
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(
                getWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqualImmutable(fromJS([]))
        })

        it('should return an empty list because the items key is not set', () => {
            const items: never[] = []
            const state = {
                widgets: fromJS({foo: items}),
            } as RootState

            expect(
                getWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqualImmutable(fromJS([]))
        })

        it('should default to current context if no context is passed', () => {
            const items = [
                {id: 1, context: 'ticket'},
                {id: 2, context: 'customer'},
            ]
            const currentContext = 'ticket'
            const state = {
                widgets: fromJS({items, currentContext}),
            } as RootState

            expect(getWidgetsWithContext()(state)).toEqualImmutable(
                fromJS([{id: 1, context: 'ticket'}])
            )
        })
    })

    describe('hasWidgetsWithContext', () => {
        it('should return true because there are items matching the passed context', () => {
            const items = [
                {id: 1, context: 'ticket'},
                {id: 2, context: 'customer'},
            ]
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(
                hasWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqual(true)
        })

        it('should return false because there are no items with passed context', () => {
            const items = [
                {id: 1, context: 'customer'},
                {id: 2, context: 'customer'},
            ]
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(
                hasWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqual(false)
        })

        it('should return false because there are no items at all', () => {
            const items: never[] = []
            const state = {
                widgets: fromJS({items}),
            } as RootState

            expect(
                hasWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqual(false)
        })

        it('should return false because the items key is not set', () => {
            const items: never[] = []
            const state = {
                widgets: fromJS({foo: items}),
            } as RootState

            expect(
                hasWidgetsWithContext(WidgetContextType.Ticket)(state)
            ).toEqual(false)
        })

        it('should default to current context if no context is passed', () => {
            const items = [
                {id: 1, context: 'ticket'},
                {id: 2, context: 'customer'},
            ]
            const currentContext = 'ticket'
            const state = {
                widgets: fromJS({items, currentContext}),
            } as RootState

            expect(hasWidgetsWithContext()(state)).toEqual(true)
        })
    })

    describe('getSources', () => {
        it('should return the sources from the state', () => {
            const ticket = fromJS({foo: 'bar'})
            const customer = fromJS({id: 1, name: 'foo'})
            const state = {
                ticket: ticket,
                customers: fromJS({
                    active: customer,
                }),
            } as RootState

            expect(getSources(state)).toEqualImmutable(
                fromJS({ticket, customer})
            )
        })
    })

    describe('getSourcesWithCustomer', () => {
        it('should return the ticket customer because it exists', () => {
            const expectedResult = fromJS({
                ticket: {
                    customer: {
                        id: 1,
                        name: 'foo',
                    },
                },
                customer: {},
            }) as Map<any, any>

            const ticket = expectedResult.get('ticket')

            expect(
                getSourcesWithCustomer({ticket} as RootState)
            ).toEqualImmutable(expectedResult)
        })

        it('should set the customer in the ticket customer and return it because there is no ticket', () => {
            const state = {
                ticket: {},
                customers: fromJS({
                    active: {
                        id: 1,
                        name: 'foo',
                    },
                }),
            } as RootState

            const expectedResult = fromJS({
                ticket: {
                    customer: {
                        id: 1,
                        name: 'foo',
                    },
                },
                customer: {
                    id: 1,
                    name: 'foo',
                },
            })

            expect(getSourcesWithCustomer(state)).toEqualImmutable(
                expectedResult
            )
        })

        it('should set the customer in the ticket customer and return it because the ticket has no customer', () => {
            const state = {
                ticket: fromJS({
                    id: 1,
                    subject: 'foo',
                }),
                customers: fromJS({
                    active: {
                        id: 2,
                        name: 'bar',
                    },
                }),
            } as RootState

            const expectedResult = fromJS({
                ticket: {
                    id: 1,
                    subject: 'foo',
                    customer: {
                        id: 2,
                        name: 'bar',
                    },
                },
                customer: {
                    id: 2,
                    name: 'bar',
                },
            })

            expect(getSourcesWithCustomer(state)).toEqualImmutable(
                expectedResult
            )
        })

        it('should not set the customer if ticket is loading', () => {
            const customer = {
                id: 2,
                name: 'bar',
            }

            const ticket = {
                id: 1,
                subject: 'foo',
                _internal: {
                    loading: {
                        fetchTicket: true,
                    },
                },
            }

            const state = {
                ticket: fromJS(ticket),
                customers: fromJS({
                    active: customer,
                }),
            } as RootState

            const expectedResult = fromJS({
                ticket,
                customer,
            })

            expect(getSourcesWithCustomer(state)).toEqualImmutable(
                expectedResult
            )
        })
    })

    describe('isEditing', () => {
        it('should return isEditing from the state', () => {
            expect(
                isEditing({
                    widgets: fromJS({
                        _internal: {
                            isEditing: true,
                        },
                    }),
                } as RootState)
            ).toEqual(true)

            expect(
                isEditing({
                    widgets: fromJS({
                        _internal: {
                            isEditing: false,
                        },
                    }),
                } as RootState)
            ).toEqual(false)
        })

        it('should return false because isEditing is not set in the state', () => {
            expect(
                isEditing({
                    widgets: fromJS({
                        _internal: {},
                    }),
                } as RootState)
            ).toEqual(false)
        })
    })
})
