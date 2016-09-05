import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

expect.extend(expectImmutable)

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
                .setIn(['_internal', 'pagination'], resp.meta)
                .setIn(['_internal', 'loading', 'fetchList'], false)

            expect(
                reducer(
                    initialState, {
                        type: types.FETCH_TICKET_LIST_VIEW_SUCCESS,
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
                        type: types.BULK_DELETE_SUCCESS,
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
