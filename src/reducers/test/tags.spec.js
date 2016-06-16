import expect from 'expect'
import expectImmutable from 'expect-immutable'

import { List, Map } from 'immutable'

import { tags } from '../tags'
import * as actions from '../../actions/tag'

expect.extend(expectImmutable)

describe('reducers', () => {
    describe('tags', () => {
        const currentFakeTags = [
            { name: 'current_fake_name' },
            { name: 'other_current_fake_name' }
        ]

        const newFakeTags = [
            { name: 'new_fake_name' },
            { name: 'other_new_fake_name' }
        ]

        it('should return the initial state', () => {
            expect(
                tags(undefined, {})
            ).toEqualImmutable(
                Map({ items: List() })
            )
        })

        it('should replace current tags with tags from server', () => {
            expect(
                tags(Map({ items: List(currentFakeTags) }), {
                    type: actions.FETCH_TAG_LIST_SUCCESS,
                    resp: { data: newFakeTags },
                })
            ).toEqualImmutable(
                Map({ items: List(newFakeTags) })
            )
        })

        it('should add tags', () => {
            expect(
                tags(Map({ items: List(currentFakeTags) }), {
                    type: actions.ADD_TAGS,
                    tags: newFakeTags,
                })
            ).toEqualImmutable(
                Map({ items: List(currentFakeTags.concat(newFakeTags)) })
            )
        })

    })
})
