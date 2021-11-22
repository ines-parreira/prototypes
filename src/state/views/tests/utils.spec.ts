import moment from 'moment'
import {fromJS} from 'immutable'

import * as utils from '../utils'
import {getAST} from '../../../utils'

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
                utils.recentViewsStorage.storage =
                    {} as unknown as typeof _storage
                utils.recentViewsStorage.get()
                utils.recentViewsStorage.storage = _storage
            })

            it('should get recent views', () => {
                localStorage.setItem('recentViews', JSON.stringify([1, 2]))

                const beforeGetDt = moment.utc().subtract(1, 's')
                const views = utils.recentViewsStorage.get() as Record<
                    string,
                    utils.StoredView
                >
                const now = moment.utc().add(1, 's')

                expect(Object.keys(views)).toEqual(['1', '2'])

                Object.values(views).forEach((view) => {
                    expect(
                        moment(view.updated_datetime).isBetween(
                            beforeGetDt,
                            now
                        )
                    ).toBe(true)
                    expect(
                        moment(view.inserted_datetime).isBetween(
                            beforeGetDt,
                            now
                        )
                    ).toBe(true)
                })
            })
        })

        describe('set()', () => {
            it('should not crash if there is no storage', () => {
                const _storage = utils.recentViewsStorage.storage
                utils.recentViewsStorage.storage =
                    {} as unknown as typeof _storage
                utils.recentViewsStorage.set([1, 2])
                utils.recentViewsStorage.storage = _storage
            })

            it('should set recent views', () => {
                utils.recentViewsStorage.set([1, 2])
                expect(
                    JSON.parse(localStorage.getItem('recentViews') as string)
                ).toEqual([1, 2])
            })
        })
    })

    describe('updateFilterOperator', () => {
        it('should remove the right part of the expression if the operator is an empty operator', () => {
            const ast = getAST(
                "gt(ticket.created_datetime, '2018-04-02T18:57:04.669744')"
            )
            const res = utils.updateFilterOperator(fromJS(ast), 0, 'isEmpty')
            expect(res.toJS()).toEqual(
                getAST('isEmpty(ticket.created_datetime)')
            )
        })

        it("should re-add a right part if there's none and the operator is not an empty operator", () => {
            const ast = getAST('isEmpty(ticket.created_datetime)')
            const res = utils.updateFilterOperator(fromJS(ast), 0, 'gte')
            expect(res.toJS()).toEqual(
                getAST("gte(ticket.created_datetime, '')")
            )
        })

        it(
            'should delete the right part and add another one with the default value instead if we are switching from ' +
                'an absolute to a relative datetime operator',
            () => {
                const ast = getAST(
                    "gte(ticket.created_datetime, '2018-04-02T18:57:04.669744')"
                )
                const res = utils.updateFilterOperator(
                    fromJS(ast),
                    0,
                    'gteTimedelta'
                )
                expect(res.toJS()).toEqual(
                    getAST("gteTimedelta(ticket.created_datetime, '1d')")
                )
            }
        )

        it(
            'should delete the right part and add another one with the default value instead if we are switching from ' +
                'an absolute to a relative datetime operator',
            () => {
                const ast = getAST(
                    "gteTimedelta(ticket.created_datetime, '1d')"
                )
                const res = utils.updateFilterOperator(fromJS(ast), 0, 'gte')
                expect(res.toJS()).toEqual(
                    getAST("gte(ticket.created_datetime, '')")
                )
            }
        )

        it('should conserve the right part if we are switching between operators of the same kind', () => {
            const ast = getAST("gte(ticket.created_datetime, '1')")
            const res = utils.updateFilterOperator(fromJS(ast), 0, 'lte')
            expect(res.toJS()).toEqual(
                getAST("lte(ticket.created_datetime, '1')")
            )
        })
    })

    describe('updateFilterValue', () => {
        it('should update fields value to number', () => {
            const ast = getAST('gte(ticket.created_datetime, 1)')
            const res = utils.updateFilterValue(fromJS(ast), 0, 2)
            expect(res.toJS()).toEqual(
                getAST('gte(ticket.created_datetime, 2)')
            )
        })

        it('should update fields value to string', () => {
            const ast = getAST("gte(ticket.created_datetime, '1')")
            const res = utils.updateFilterValue(fromJS(ast), 0, '2')
            expect(res.toJS()).toEqual(
                getAST("gte(ticket.created_datetime, '2')")
            )
        })

        it('should update fields value to array', () => {
            const ast = getAST("gte(ticket.created_datetime, '1')")
            const res = utils.updateFilterValue(fromJS(ast), 0, [1])
            expect(res.toJS()).toEqual(
                getAST('gte(ticket.created_datetime, [1])')
            )
        })

        it('should remove field value', () => {
            const ast = getAST("gte(ticket.created_datetime, '1')")
            const res = utils.updateFilterValue(fromJS(ast), 0, null)
            expect(res.toJS()).toEqual(
                getAST("gte(ticket.created_datetime, '')")
            )
        })
    })

    describe('activeViewUrl', () => {
        it('should return index url with no active view', () => {
            const url = utils.activeViewUrl(
                fromJS({}),
                {pathname: '/app/ticket/1', search: ''},
                fromJS({})
            )
            expect(url).toBe('/app')
        })

        it('should return the ticket list url', () => {
            const url = utils.activeViewUrl(
                fromJS({
                    type: 'ticket-list',
                    id: '1',
                }),
                {
                    pathname: '/app/ticket/1',
                    search: '',
                },
                fromJS({})
            )
            expect(url).toBe('/app/tickets/1')
        })

        it('should return the customer list url', () => {
            const url = utils.activeViewUrl(
                fromJS({
                    type: 'customer-list',
                    id: '2',
                }),
                {
                    pathname: '/app/customer/2',
                    search: '',
                },
                fromJS({})
            )
            expect(url).toBe('/app/customers/2')
        })

        it('should return the same url when on a different item type', () => {
            const url = utils.activeViewUrl(
                fromJS({
                    type: 'customer-list',
                    id: '2',
                }),
                {
                    pathname: '/app/ticket/1',
                    search: '',
                },
                fromJS({})
            )
            expect(url).toBe('/app/ticket/1')
        })

        it('should return the same url when on an unsupported url', () => {
            const url = utils.activeViewUrl(
                fromJS({
                    type: 'customer-list',
                    id: '2',
                }),
                {
                    pathname: '/app/pizza-pepperoni',
                    search: '',
                },
                fromJS({})
            )
            expect(url).toBe('/app/pizza-pepperoni')
        })

        it('should keep the url search query', () => {
            const url = utils.activeViewUrl(
                fromJS({
                    type: 'customer-list',
                    id: '2',
                }),
                {
                    pathname: '/app/pizza-pepperoni',
                    search: '?pizza=pepperoni',
                },
                fromJS({})
            )
            expect(url).toBe('/app/pizza-pepperoni?pizza=pepperoni')
        })

        it('should return the tickets search url and cursor', () => {
            const cursor = 'asd8645'
            const url = utils.activeViewUrl(
                fromJS({
                    type: 'ticket-list',
                    id: '1',
                    search: 'pizza',
                }),
                {
                    pathname: '/app/ticket/1',
                    search: '',
                },
                fromJS({current_cursor: cursor})
            )
            expect(url).toBe(`/app/tickets/search?q=pizza&cursor=${cursor}`)
        })

        it('should return the page number', () => {
            const cursor = 'asd8645'
            const url = utils.activeViewUrl(
                fromJS({
                    type: 'ticket-list',
                    id: '1',
                }),
                {
                    pathname: '/app/ticket/1',
                    search: '',
                },
                fromJS({current_cursor: cursor})
            )
            expect(url).toBe(`/app/tickets/1?cursor=${cursor}`)
        })
    })

    describe('rawify', () => {
        it('should work with empty values', () => {
            expect(utils.rawify(null)).toEqual("''")
            expect(utils.rawify('')).toEqual("''")
            expect(utils.rawify(null)).toEqual("''")
        })

        it('should quote strings', () => {
            expect(utils.rawify('a')).toEqual("'a'")
            expect(utils.rawify('1')).toEqual("'1'")
            expect(utils.rawify('aaa')).toEqual("'aaa'")
            expect(utils.rawify('a\\a')).toEqual("'a\\\\a'")
            expect(utils.rawify("aaa'bbb")).toEqual("'aaa\\'bbb'")
            expect(utils.rawify("aaa'b'bb")).toEqual("'aaa\\'b\\'bb'")
            expect(utils.rawify("aaa\\'bbb")).toEqual("'aaa\\\\\\'bbb'")
            expect(utils.rawify("aaa\\'b\\'bb")).toEqual(
                "'aaa\\\\\\'b\\\\\\'bb'"
            )
            expect(utils.rawify("aaa\\\\'bbb")).toEqual("'aaa\\\\\\\\\\'bbb'")
        })

        it('should stringify numbers', () => {
            expect(utils.rawify(111)).toEqual('111')
            expect(utils.rawify(100.1)).toEqual('100.1')
        })
    })
})
