import expect from 'expect'
import expectImmutable from 'expect-immutable'

import { List, Map } from 'immutable'

import { tags as reducer, tagsInitial as initialState } from '../reducers'
import * as types from '../constants'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('tags', () => {
        // Simulates current tags in state
        const currentFakeTags = [
            { name: 'current_fake_name' },
            { name: 'other_current_fake_name' }
        ]

        // Simulates the arrival of new tags
        const newFakeTags = [
            { name: 'new_fake_name' },
            { name: 'other_new_fake_name' }
        ]

        it('should return the initial state', () => {
            expect(
                reducer(undefined, {})
            ).toEqualImmutable(
                initialState
            )
        })

        it('should replace current tags with tags from server', () => {
            const fetchTagsFromServer = (state) => (
                reducer(state, {
                    type: types.FETCH_TAG_LIST_SUCCESS,
                    resp: { data: newFakeTags }
                })
            )

            expect(
                fetchTagsFromServer(initialState)
            ).toEqualImmutable(
                Map({ items: List(newFakeTags) })
            )

            expect(
                fetchTagsFromServer(Map({ items: List(currentFakeTags) }))
            ).toEqualImmutable(
                Map({ items: List(newFakeTags) })
            )
        })

        it('should add tags', () => {
            const addTags = (state) => (
                reducer(state, {
                    type: types.ADD_TAGS,
                    tags: newFakeTags
                })
            )

            expect(
                addTags(initialState)
            ).toEqualImmutable(
                Map({ items: List(newFakeTags) })
            )

            expect(
                addTags(Map({ items: List(currentFakeTags) }))
            ).toEqualImmutable(
                Map({ items: List(currentFakeTags.concat(newFakeTags)) })
            )
        })
    })
})
