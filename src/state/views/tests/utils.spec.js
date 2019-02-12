import moment from 'moment'
import {fromJS} from 'immutable'

import * as utils from '../utils'
import {updateFilterOperator, activeViewUrl, rawify} from '../utils'

describe('utils', () => {
    describe('RecentViewStorage', () => {
        describe('get()', () => {
            it('should return undefined(invalid data stored)', () => {
                expect(utils.recentViewsStorage.get()).toBe(undefined)
                localStorage.setItem('recentViews', JSON.stringify({1: {}}))
                expect(utils.recentViewsStorage.get()).toBe(undefined)
                localStorage.setItem('recentViews', JSON.stringify(1))
                expect(utils.recentViewsStorage.get()).toBe(undefined)
                localStorage.setItem('recentViews', JSON.stringify('hello'))
                expect(utils.recentViewsStorage.get()).toBe(undefined)
            })

            it('should not crash if there is no storage', () => {
                const _storage = utils.recentViewsStorage.storage
                utils.recentViewsStorage.storage = {}
                utils.recentViewsStorage.get()
                utils.recentViewsStorage.storage = _storage
            })

            it('should get recent views', () => {
                localStorage.setItem('recentViews', JSON.stringify([1, 2]))

                const beforeGetDt = moment.utc().subtract(1, 's')
                const views = utils.recentViewsStorage.get()
                const now = moment.utc().add(1, 's')

                expect(Object.keys(views)).toEqual(['1', '2'])

                Object.values(views).forEach((view) => {
                    expect(moment(view.updated_datetime).isBetween(beforeGetDt, now)).toBe(true)
                    expect(moment(view.inserted_datetime).isBetween(beforeGetDt, now)).toBe(true)
                })
            })
        })

        describe('set()', () => {
            it('should not crash if there is no storage', () => {
                const _storage = utils.recentViewsStorage.storage
                utils.recentViewsStorage.storage = {}
                utils.recentViewsStorage.set([1, 2])
                utils.recentViewsStorage.storage = _storage
            })

            it('should set recent views', () => {
                utils.recentViewsStorage.set([1, 2])
                expect(JSON.parse(localStorage.getItem('recentViews'))).toEqual([1, 2])
            })
        })
    })

    describe('updateFilterOperator', () => {
        it('should remove the right part of the expression if the operator is an empty operator', () => {
            const ast = fromJS({
                type: 'Program',
                body: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            name: 'gt'
                        },
                        arguments: [
                            {raw: '\'ticket.created_datetime\'', value: 'ticket.created_datetime', type: 'Identifier'},
                            {raw: '2018-04-02T18:57:04.669744', value: '2018-04-02T18:57:04.669744', type: 'Literal'},
                        ]
                    }
                }]
            })

            const res = updateFilterOperator(ast, 0, 'isEmpty')

            expect(res.toJS()).toMatchSnapshot()
        })

        it('should re-add a right part if there\'s none and the operator is not an empty operator', () => {
            const ast = fromJS({
                type: 'Program',
                body: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            name: 'isEmpty'
                        },
                        arguments: [
                            {raw: '\'ticket.created_datetime\'', value: 'ticket.created_datetime', type: 'Identifier'},
                        ]
                    }
                }]
            })

            const res = updateFilterOperator(ast, 0, 'gte')

            expect(res.toJS()).toMatchSnapshot()
        })

        it('should delete the right part and add another one with the default value instead if we are switching from ' +
            'an absolute to a relative datetime operator', () => {
            const ast = fromJS({
                type: 'Program',
                body: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            name: 'gte'
                        },
                        arguments: [
                            {raw: '\'ticket.created_datetime\'', value: 'ticket.created_datetime', type: 'Identifier'},
                            {
                                raw: '\'2018-04-02T18:57:04.669744\'',
                                value: '2018-04-02T18:57:04.669744',
                                type: 'Literal'
                            },
                        ]
                    }
                }]
            })

            const res = updateFilterOperator(ast, 0, 'gteTimedelta')

            expect(res.toJS()).toMatchSnapshot()
        })

        it('should delete the right part and add another one with the default value instead if we are switching from ' +
            'an absolute to a relative datetime operator', () => {
            const ast = fromJS({
                type: 'Program',
                body: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            name: 'gteTimedelta'
                        },
                        arguments: [
                            {raw: '\'ticket.created_datetime\'', value: 'ticket.created_datetime', type: 'Identifier'},
                            {raw: '\'1d\'', value: '1d', type: 'Literal'},
                        ]
                    }
                }]
            })

            const res = updateFilterOperator(ast, 0, 'gte')

            expect(res.toJS()).toMatchSnapshot()
        })

        it('should conserve the right part if we are switching between operators of the same kind', () => {
            const ast = fromJS({
                type: 'Program',
                body: [{
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'CallExpression',
                        callee: {
                            name: 'gte'
                        },
                        arguments: [
                            {raw: '\'ticket.id\'', value: 'ticket.id', type: 'Identifier'},
                            {raw: '1', value: 1, type: 'Literal'},
                        ]
                    }
                }]
            })

            const res = updateFilterOperator(ast, 0, 'lte')

            expect(res.toJS()).toMatchSnapshot()
        })
    })

    describe('activeViewUrl', () => {
        it('should return index url with no active view', () => {
            const url = activeViewUrl(fromJS({}), {pathname: '/app/ticket/1'}, fromJS({}))
            expect(url).toBe('/app')
        })

        it('should return the ticket list url', () => {
            const url = activeViewUrl(fromJS({
                type: 'ticket-list',
                id: '1'
            }), {
                pathname: '/app/ticket/1',
                search: ''
            }, fromJS({}))
            expect(url).toBe('/app/tickets/1')
        })

        it('should return the customer list url', () => {
            const url = activeViewUrl(fromJS({
                type: 'customer-list',
                id: '2'
            }), {
                pathname: '/app/customer/2',
                search: ''
            }, fromJS({}))
            expect(url).toBe('/app/customers/2')
        })

        it('should return the same url when on a different item type', () => {
            const url = activeViewUrl(fromJS({
                type: 'customer-list',
                id: '2'
            }), {
                pathname: '/app/ticket/1',
                search: ''
            }, fromJS({}))
            expect(url).toBe('/app/ticket/1')
        })

        it('should return the same url when on an unsupported url', () => {
            const url = activeViewUrl(fromJS({
                type: 'customer-list',
                id: '2'
            }), {
                pathname: '/app/pizza-pepperoni',
                search: ''
            }, fromJS({}))
            expect(url).toBe('/app/pizza-pepperoni')
        })

        it('should keep the url search query', () => {
            const url = activeViewUrl(fromJS({
                type: 'customer-list',
                id: '2'
            }), {
                pathname: '/app/pizza-pepperoni',
                search: '?pizza=pepperoni'
            }, fromJS({}))
            expect(url).toBe('/app/pizza-pepperoni?pizza=pepperoni')
        })

        it('should return the tickets search url and page number', () => {
            const url = activeViewUrl(fromJS({
                type: 'ticket-list',
                id: '1',
                search: 'pizza'
            }), {
                pathname: '/app/ticket/1',
                search: ''
            }, fromJS({page: 2}))
            expect(url).toBe('/app/tickets/search?q=pizza&page=2')
        })

        it('should return the page number', () => {
            const url = activeViewUrl(fromJS({
                type: 'ticket-list',
                id: '1',
            }), {
                pathname: '/app/ticket/1',
                search: ''
            }, fromJS({page: 2}))
            expect(url).toBe('/app/tickets/1?page=2')
        })
    })

    describe('rawify', () => {
        it('should work with empty values', () => {
            expect(rawify()).toEqual('\'\'')
            expect(rawify('')).toEqual('\'\'')
            expect(rawify(null)).toEqual('\'\'')
        })

        it('should quote strings', () => {
            expect(rawify('a')).toEqual('\'a\'')
            expect(rawify('1')).toEqual('\'1\'')
            expect(rawify('aaa')).toEqual('\'aaa\'')
            expect(rawify('a\\a')).toEqual('\'a\\\\a\'')
            expect(rawify('aaa\'bbb')).toEqual('\'aaa\\\'bbb\'')
            expect(rawify('aaa\'b\'bb')).toEqual('\'aaa\\\'b\\\'bb\'')
            expect(rawify('aaa\\\'bbb')).toEqual('\'aaa\\\\\\\'bbb\'')
            expect(rawify('aaa\\\'b\\\'bb')).toEqual('\'aaa\\\\\\\'b\\\\\\\'bb\'')
            expect(rawify('aaa\\\\\'bbb')).toEqual('\'aaa\\\\\\\\\\\'bbb\'')
        })

        it('should stringify numbers', () => {
            expect(rawify(111)).toEqual('111')
            expect(rawify(100.1)).toEqual('100.1')
        })
    })
})
