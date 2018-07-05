import {
    getContext, getSources,
    getSourcesWithCustomer,
    getWidgets,
    getWidgetsState,
    getWidgetsWithContext, hasWidgets,
    hasWidgetsWithContext, isEditing
} from '../selectors'
import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'

jest.addMatchers(immutableMatchers)

describe('widgets selectors', () => {
    describe('getWidgetsState', () => {
        it('should return widgets state because it exists', () => {
            const state = {
                widgets: fromJS({
                    foo: 'bar'
                })
            }

            expect(getWidgetsState(state)).toEqualImmutable(fromJS({foo: 'bar'}))
        })

        it('should return an empty Map because widgets state does not exist', () => {
            const state = {
                foo: 'bar'
            }

            expect(getWidgetsState(state)).toEqualImmutable(fromJS({}))
        })
    })

    describe('getContext', () => {
        it('should return current context because it is set', () => {
            const currentContext = 'foo'
            const state = {
                widgets: fromJS({currentContext})
            }

            expect(getContext(state)).toEqual(currentContext)
        })

        it('should return an empty string because current context is null', () => {
            const state = {
                widgets: fromJS({currentContext: null})
            }

            expect(getContext(state)).toEqual('')
        })
    })

    describe('getWidgets', () => {
        it('should return items from the widgets state', () => {
            const items = [1, 2, 3]
            const state = {
                widgets: fromJS({items})
            }

            expect(getWidgets(state)).toEqualImmutable(fromJS(items))
        })

        it('should return an empty immutable list because items is not set', () => {
            const items = [1, 2, 3]
            const state = {
                widgets: fromJS({foo: items})
            }

            expect(getWidgets(state)).toEqualImmutable(fromJS([]))
        })
    })

    describe('hasWidgets', () => {
        it('should return true because there is some widgets', () => {
            const items = [1, 2, 3]
            const state = {
                widgets: fromJS({items})
            }

            expect(hasWidgets(state)).toEqual(true)
        })

        it('should return false because the widgets items list is empty', () => {
            const items = []
            const state = {
                widgets: fromJS({items})
            }

            expect(hasWidgets(state)).toEqual(false)
        })

        it('should return false because the widgets items list does not exist', () => {
            const items = []
            const state = {
                widgets: fromJS({foo: items})
            }

            expect(hasWidgets(state)).toEqual(false)
        })
    })

    describe('getWidgetsWithContext', () => {
        it('should return items with current context', () => {
            const items = [{id: 1, context: 'ticket'}, {id: 2, context: 'user'}]
            const state = {
                widgets: fromJS({items})
            }

            expect(getWidgetsWithContext('ticket')(state)).toEqualImmutable(fromJS([{id: 1, context: 'ticket'}]))
        })

        it('should return an empty list because there is no items with current context', () => {
            const items = [{id: 1, context: 'user'}, {id: 2, context: 'user'}]
            const state = {
                widgets: fromJS({items})
            }

            expect(getWidgetsWithContext('ticket')(state)).toEqualImmutable(fromJS([]))
        })

        it('should return an empty list because there is no items at all', () => {
            const items = []
            const state = {
                widgets: fromJS({items})
            }

            expect(getWidgetsWithContext('ticket')(state)).toEqualImmutable(fromJS([]))
        })

        it('should return an empty list because the items key is not set', () => {
            const items = []
            const state = {
                widgets: fromJS({foo: items})
            }

            expect(getWidgetsWithContext('ticket')(state)).toEqualImmutable(fromJS([]))
        })

        it('should default to current context if no context is passed', () => {
            const items = [{id: 1, context: 'ticket'}, {id: 2, context: 'user'}]
            const currentContext = 'ticket'
            const state = {
                widgets: fromJS({items, currentContext})
            }

            expect(getWidgetsWithContext()(state)).toEqualImmutable(fromJS([{id: 1, context: 'ticket'}]))
        })
    })

    describe('hasWidgetsWithContext', () => {
        it('should return true because there are items matching the passed context', () => {
            const items = [{id: 1, context: 'ticket'}, {id: 2, context: 'user'}]
            const state = {
                widgets: fromJS({items})
            }

            expect(hasWidgetsWithContext('ticket')(state)).toEqual(true)
        })

        it('should return false because there are no items with passed context', () => {
            const items = [{id: 1, context: 'user'}, {id: 2, context: 'user'}]
            const state = {
                widgets: fromJS({items})
            }

            expect(hasWidgetsWithContext('ticket')(state)).toEqual(false)
        })

        it('should return false because there are no items at all', () => {
            const items = []
            const state = {
                widgets: fromJS({items})
            }

            expect(hasWidgetsWithContext('ticket')(state)).toEqual(false)
        })

        it('should return false because the items key is not set', () => {
            const items = []
            const state = {
                widgets: fromJS({foo: items})
            }

            expect(hasWidgetsWithContext('ticket')(state)).toEqual(false)
        })

        it('should default to current context if no context is passed', () => {
            const items = [{id: 1, context: 'ticket'}, {id: 2, context: 'user'}]
            const currentContext = 'ticket'
            const state = {
                widgets: fromJS({items, currentContext})
            }

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
                    active: customer
                })
            }

            expect(getSources(state)).toEqualImmutable(fromJS({ticket, user: customer}))
        })
    })

    describe('getSourcesWithCustomer', () => {
        it('should return the ticket customer because it exists', () => {
            const expectedResult = fromJS({
                ticket: {
                    customer: {
                        id: 1,
                        name: 'foo'
                    }
                },
                user: {}
            })

            const ticket = expectedResult.get('ticket')

            expect(getSourcesWithCustomer({ticket})).toEqualImmutable(expectedResult)
        })

        it('should set the customer in the ticket customer and return it because there is no ticket', () => {
            const state = {
                ticket: {},
                customers: fromJS({
                    active: {
                        id: 1,
                        name: 'foo'
                    }
                })
            }

            const expectedResult = fromJS({
                ticket: {
                    customer: {
                        id: 1,
                        name: 'foo'
                    }
                },
                user: {
                    id: 1,
                    name: 'foo'
                }
            })

            expect(getSourcesWithCustomer(state)).toEqualImmutable(expectedResult)
        })

        it('should set the customer in the ticket customer and return it because the ticket has no customer', () => {
            const state = {
                ticket: fromJS({
                    id: 1,
                    subject: 'foo'
                }),
                customers: fromJS({
                    active: {
                        id: 2,
                        name: 'bar'
                    }
                })
            }

            const expectedResult = fromJS({
                ticket: {
                    id: 1,
                    subject: 'foo',
                    customer: {
                        id: 2,
                        name: 'bar'
                    }
                },
                user: {
                    id: 2,
                    name: 'bar'
                }
            })

            expect(getSourcesWithCustomer(state)).toEqualImmutable(expectedResult)
        })
    })

    describe('isEditing', () => {
        it('should return isEditing from the state', () => {
            expect(isEditing({
                widgets: fromJS({
                    _internal: {
                        isEditing: true
                    }
                })
            })).toEqual(true)

            expect(isEditing({
                widgets: fromJS({
                    _internal: {
                        isEditing: false
                    }
                })
            })).toEqual(false)
        })

        it('should return false because isEditing is not set in the state', () => {
            expect(isEditing({
                widgets: fromJS({
                    _internal: {}
                })
            })).toEqual(false)
        })
    })
})
