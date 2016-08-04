import expect from 'expect'
import expectImmutable from 'expect-immutable'

import { List, Map, fromJS } from 'immutable'

import { users as reducer, usersInitial as initialState } from '../users'
import * as types from '../../constants/user'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('users', () => {
        it('should return the initial state', () => {
            expect(
                reducer(
                    undefined,
                    {}
                )
            ).toEqualImmutable(initialState)
        })

        it('should remember query if there is any', () => {
            const stringQuery = 'Dark Vador'
            const params = {
                dark: 'vador'
            }

            const expected = initialState.merge({
                search: {
                    stringQuery,
                    params
                }
            })

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
            ).toEqualImmutable(initialState)
        })

        it('should replace current users with users from server', () => {
            const items = [{
                name: 'Mario'
            }, {
                name: 'Luigi'
            }]

            const resp = {
                data: items
            }

            const expected = initialState.merge({
                items,
                loading: false,
                resp
            })

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_USER_LIST_SUCCESS,
                        resp
                    }
                )
            ).toEqualImmutable(expected)
        })

        it('should add a user', () => {
            const user = {
                name: 'Mario'
            }

            const resp = user

            const expected = initialState.merge({
                items: List().push(fromJS(resp)),
                loading: false,
                resp
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

        it('should update users list', () => {
            const items = [{
                name: 'Mario'
            }, {
                name: 'Luigi'
            }]

            const expected = initialState.merge({
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

        it('should update user', () => {
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

        it('should delete user', () => {
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
                        type: types.DELETE_USER_SUCCESS,
                        userId: 1,
                        resp: {}
                    }
                )
            ).toEqualImmutable(
                initialState.set('items',
                    fromJS([
                        {
                            id: 2,
                            name: 'Luigi'
                        }
                    ])).set('resp', Map())
            )
        })
    })
})
