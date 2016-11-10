import expect from 'expect'
import {fromJS} from 'immutable'
import reducers from '../reducers'
import * as types from '../constants'

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
    })
})
