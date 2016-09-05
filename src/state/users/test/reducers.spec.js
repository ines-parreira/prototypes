import expect from 'expect'
import expectImmutable from 'expect-immutable'
import {fromJS} from 'immutable'
import reducer, {initialState} from '../reducers'
import * as types from '../constants'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('users', () => {
        it('initial state OK', () => {
            expect(
                reducer(
                    undefined,
                    {}
                )
            ).toEqualImmutable(initialState)
        })

        it('remember query OK', () => {
            const stringQuery = 'Dark Vador'
            const params = {
                dark: 'vador'
            }

            const expected = initialState
                .setIn(['_internal', 'search'], fromJS({
                    stringQuery,
                    params
                }))
                .setIn(['_internal', 'loading', 'fetchList'], true)

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_USER_LIST_START,
                        stringQuery,
                        params
                    }
                )
            ).toEqualImmutable(expected)

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_USER_LIST_START
                    }
                )
            ).toEqualImmutable(
                initialState
                    .setIn(['_internal', 'loading', 'fetchList'], true)
            )
        })

        it('fetch list OK', () => {
            const items = [{
                name: 'Mario'
            }, {
                name: 'Luigi'
            }]

            const resp = {
                data: items
            }

            const expected = initialState
                .merge({
                    items
                })
                .setIn(['_internal', 'loading', 'fetchList'], false)

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_USER_LIST_SUCCESS,
                        resp
                    }
                )
            ).toEqualImmutable(expected)
        })

        it('add OK', () => {
            const user = {
                name: 'Mario',
                email: 'mario@nintendo.com'
            }

            const resp = user

            const expected = initialState
                .merge({
                    items: fromJS([resp])
                })

            expect(
                reducer(
                    initialState, {
                        type: types.CREATE_NEW_USER_SUCCESS,
                        resp
                    }
                )
            ).toEqualImmutable(expected)
        })

        it('update list OK', () => {
            const items = [{
                name: 'Mario'
            }, {
                name: 'Luigi'
            }]

            const expected = initialState
                .merge({
                    items
                })

            expect(
                reducer(
                    initialState, {
                        type: types.UPDATE_LIST,
                        list: items
                    }
                )
            ).toEqualImmutable(expected)
        })

        it('update OK', () => {
            expect(
                reducer(
                    initialState.set('items',
                        fromJS([
                            {
                                id: 1,
                                name: 'Mario'
                            },
                            {
                                id: 2,
                                name: 'Luigi'
                            }
                        ])),
                    {
                        type: types.UPDATE_USER_SUCCESS,
                        userId: 1,
                        resp: {
                            id: 1,
                            name: 'Pikachu'
                        }
                    }
                )
            ).toEqualImmutable(
                initialState.set('items',
                    fromJS([
                        {
                            id: 1,
                            name: 'Pikachu'
                        },
                        {
                            id: 2,
                            name: 'Luigi'
                        }
                    ]))
            )
        })

        it('delete OK', () => {
            expect(
                reducer(
                    initialState
                        .set('items',
                            fromJS([
                                {
                                    id: 1,
                                    name: 'Mario'
                                },
                                {
                                    id: 2,
                                    name: 'Luigi'
                                }
                            ])),
                    {
                        type: types.DELETE_USER_SUCCESS,
                        userId: 1
                    }
                )
            ).toEqualImmutable(
                initialState
                    .set('items',
                        fromJS([
                            {
                                id: 2,
                                name: 'Luigi'
                            }
                        ]))
            )
        })
    })
})
