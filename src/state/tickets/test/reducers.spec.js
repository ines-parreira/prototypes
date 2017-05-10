import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as viewTypes from '../../views/constants'

jest.addMatchers(immutableMatchers)

describe('reducers', () => {
    describe('tickets', () => {
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
                name: 'A ticket'
            }, {
                name: 'Another ticket'
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
                        viewType: 'ticket-list',
                        data: resp
                    }
                )
            ).toEqualImmutable(expected)
        })

        it('bulk delete OK', () => {
            const tickets = [
                {
                    id: 1,
                    name: 'A ticket'
                },
                {
                    id: 2,
                    name: 'Another ticket'
                },
                {
                    id: 3,
                    name: 'Another nice ticket'
                }
            ]

            expect(
                reducer(
                    initialState
                        .set('items', fromJS(tickets)),
                    {
                        type: viewTypes.BULK_DELETE_SUCCESS,
                        viewType: 'ticket-list',
                        ids: [1, 2]
                    }
                )
            ).toEqualImmutable(
                initialState
                    .merge({
                        items: fromJS([tickets[2]])
                    })
            )
        })
    })
})
