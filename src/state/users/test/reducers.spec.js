import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as viewTypes from '../../views/constants'

jest.addMatchers(immutableMatchers)

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

        it('fetch list OK', () => {
            const items = [{
                name: 'A user'
            }, {
                name: 'Another user'
            }]

            const resp = {
                data: items,
                meta: {
                    nb_pages: 2,
                    page: 1
                }
            }

            const expected = initialState
                .merge({
                    items
                })

            expect(
                reducer(
                    initialState, {
                        type: viewTypes.FETCH_LIST_VIEW_SUCCESS,
                        viewType: 'user-list',
                        data: resp
                    }
                )
            ).toEqualImmutable(expected)
        })

        it('bulk delete OK', () => {
            const users = [
                {
                    id: 1,
                    name: 'A user'
                },
                {
                    id: 2,
                    name: 'Another user'
                },
                {
                    id: 3,
                    name: 'Another happy user'
                }
            ]

            expect(
                reducer(
                    initialState
                        .set('items', fromJS(users)),
                    {
                        type: viewTypes.BULK_DELETE_SUCCESS,
                        viewType: 'user-list',
                        ids: [1, 2]
                    }
                )
            ).toEqualImmutable(
                initialState
                    .merge({
                        items: fromJS([users[2]])
                    })
            )
        })
    })
})
