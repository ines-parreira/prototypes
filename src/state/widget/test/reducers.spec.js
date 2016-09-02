import expect from 'expect'
import expectImmutable from 'expect-immutable'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers'
import * as types from '../constants'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('widgets', () => {
        it('should return the initial state', () => {
            expect(
                reducer(
                    undefined,
                    {}
                )
            ).toEqualImmutable(initialState)
        })

        it('should set fetched widgets and sort their fields', () => {
            {
                // no incoming widgets
                const resp = {
                    data: [],
                    meta: {}
                }

                const expected = fromJS({
                    items: resp.data,
                    meta: resp.meta
                })

                expect(
                    reducer(
                        initialState, {
                            type: types.FETCH_WIDGETS_SUCCESS,
                            resp
                        }
                    )
                ).toEqualImmutable(expected)
            }

            {
                // some widgets
                const resp = {
                    data: [{
                        fields: [
                            {
                                name: 'field2',
                                order: 2
                            },
                            {
                                name: 'field1',
                                order: 1
                            }
                        ]
                    }],
                    meta: {
                        say: 'hello'
                    }
                }

                const expected = fromJS({
                    items: [{
                        fields: [
                            {
                                name: 'field1',
                                order: 1
                            },
                            {
                                name: 'field2',
                                order: 2
                            }
                        ]
                    }],
                    meta: resp.meta
                })

                expect(
                    reducer(
                        initialState, {
                            type: types.FETCH_WIDGETS_SUCCESS,
                            resp
                        }
                    )
                ).toEqualImmutable(expected)
            }
        })
    })
})
