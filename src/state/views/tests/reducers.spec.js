import {fromJS} from 'immutable'
import moment from 'moment'
import reducers, {initialState} from '../reducers'
import * as fixtures from '../../../fixtures/views'
import * as types from '../constants'
import * as utils from '../utils'
import * as selectors from '../selectors'

describe('reducers', () => {
    describe('views', () => {
        it('should update field value of active view', () => {
            const state = fromJS({
                active: {
                    dirty: false,
                    filters: 'eq(ticket.assignee_user.id, \'2\')',
                    filters_ast: {
                        type: 'Program',
                        sourceType: 'script',
                        body: [{
                            type: 'ExpressionStatement',
                            expression: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'eq'
                                },
                                arguments: [{
                                    type: 'MemberExpression',
                                    computed: false,
                                    property: {
                                        type: 'Identifier',
                                        name: 'id'
                                    },
                                    object: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'Identifier',
                                            name: 'ticket'
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'assignee_user'
                                        }
                                    }
                                }, {
                                    type: 'Literal',
                                    value: '2',
                                    raw: '\'{current_user.id}\''
                                }]
                            }
                        }]
                    }
                }
            })
            const expectedState = state.updateIn(
                ['active', 'filters'], () => 'eq(ticket.assignee_user.id, \'3\')'
            ).updateIn(
                ['active', 'filters_ast', 'body', 0, 'expression', 'arguments', 1, 'value'], '', () => '3'
            ).updateIn(['active', 'dirty'], () => true)
            expect(reducers(state, {
                type: types.UPDATE_VIEW_FIELD_FILTER,
                index: 0,
                value: '3'
            })).toEqual(expectedState)
        })

        it('should update field operator of active view', () => {
            const state = fromJS({
                active: {
                    dirty: false,
                    filters: 'eq(ticket.assignee_user.id, \'2\')',
                    filters_ast: {
                        type: 'Program',
                        sourceType: 'script',
                        body: [{
                            type: 'ExpressionStatement',
                            expression: {
                                type: 'CallExpression',
                                callee: {
                                    type: 'Identifier',
                                    name: 'eq'
                                },
                                arguments: [{
                                    type: 'MemberExpression',
                                    computed: false,
                                    property: {
                                        type: 'Identifier',
                                        name: 'id'
                                    },
                                    object: {
                                        type: 'MemberExpression',
                                        computed: false,
                                        object: {
                                            type: 'Identifier',
                                            name: 'ticket'
                                        },
                                        property: {
                                            type: 'Identifier',
                                            name: 'assignee_user'
                                        }
                                    }
                                }, {
                                    type: 'Literal',
                                    value: '2',
                                    raw: '\'{current_user.id}\''
                                }]
                            }
                        }]
                    }
                }
            })
            const expectedState = state.updateIn(
                ['active', 'filters'], () => 'neq(ticket.assignee_user.id, \'2\')'
            ).updateIn(
                ['active', 'filters_ast', 'body', 0, 'expression', 'callee', 'name'], () => 'neq'
            ).updateIn(['active', 'dirty'], true, () => true)
            expect(reducers(state, {
                type: types.UPDATE_VIEW_FIELD_FILTER_OPERATOR,
                index: 0,
                operator: 'neq'
            })).toEqual(expectedState)
        })

        it('should create a view', () => {
            expect(reducers(initialState, {
                type: types.CREATE_VIEW_SUCCESS,
                resp: fixtures.view
            })).toMatchSnapshot()
        })

        it('should update a view', () => {
            const state = reducers(initialState, {
                type: types.CREATE_VIEW_SUCCESS,
                resp: fixtures.view
            })

            fixtures.view.type = 'system'

            expect(reducers(state, {
                type: types.UPDATE_VIEW_SUCCESS,
                resp: fixtures.view
            })).toMatchSnapshot()
        })

        it('should delete a view ', () => {
            const state = reducers(initialState, {
                type: types.CREATE_VIEW_SUCCESS,
                resp: fixtures.view
            })
            expect(reducers(state, {
                type: types.DELETE_VIEW_SUCCESS,
                viewId: fixtures.view.id
            })).toMatchSnapshot()
        })

        it('should handle ADD_RECENT_VIEW', () => {
            const beforeActionDt = moment.utc()
            const state = reducers(initialState, {
                type: types.ADD_RECENT_VIEW,
                viewId: 1
            })

            const recentViews = selectors.getRecentViews({views: state}).toJS()
            const viewIds = Object.keys(recentViews)
            const now = moment.utc().add(1, 's')

            // should store new view id in the Redux state
            expect(viewIds).toEqual(['1'])
            for (let view in recentViews) {
                expect(moment(view.insert_datetime).isBetween(beforeActionDt, now)).toBe(true)
                expect(moment(view.updated_datetime).isBetween(beforeActionDt, now)).toBe(true)
            }

            // should store recent views in the localStorage
            const views = utils.recentViewsStorage.get()
            expect(Object.keys(views)).toEqual(['1'])
        })

        it('should handle UPDATE_COUNTS', () => {
            let state = initialState.mergeDeep(fromJS({
                recent: {
                    1: {},
                    2: {}
                }
            }))
            const counts = {
                1: 12,
                2: 234,
                3: 78,
            }
            const beforeActionDt = moment.utc()

            state = reducers(state, {
                type: types.UPDATE_COUNTS,
                counts
            })

            // should update view counts
            expect(state.get('counts').toJS()).toEqual(counts)

            const now = moment.utc().add(3, 's')
            const recentViews = selectors.getRecentViews({views: state}).toJS()
            // should update when these view counts were updated for each recent views
            expect(recentViews).not.toEqual({})

            for (let view in recentViews) {
                expect(moment(view.updated_datetime).isBetween(beforeActionDt, now)).toBe(true)
            }
        })

        it('should update updated datetime of recent views', () => {
            const beforeActionDt = moment.utc()
            let state = initialState.mergeDeep(fromJS({
                recent: {
                    1: {},
                    2: {}
                }
            }))
            state = reducers(state, {
                type: types.UPDATE_RECENT_VIEWS,
                viewIds: [1, 2]
            })

            const now = moment.utc().add(1, 's')
            const recentViews = selectors.getRecentViews({views: state}).toJS()
            // should update when these view counts were updated for each recent views
            expect(recentViews).not.toEqual({})

            for (let view in recentViews) {
                expect(moment(view.updated_datetime).isBetween(beforeActionDt, now)).toBe(true)
            }
        })
    })
})
