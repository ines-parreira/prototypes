import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors.ts'
import {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('tags selectors', () => {
    let state
    const selectedTagId = 123

    beforeEach(() => {
        state = {
            tags: initialState
                .mergeDeep({
                    items: [
                        {
                            id: 1,
                            name: 'refund',
                            decoration: null,
                            usage: 60,
                            created_datetime: '2017-08-16T16:54:49',
                        },
                        {
                            id: 2,
                            name: 'billing',
                            decoration: null,
                            usage: 30,
                            created_datetime: '2017-08-16T16:54:49',
                        },
                    ],
                    meta: {},
                    _internal: {
                        pagination: {
                            item_count: 2,
                            nb_pages: 1,
                            page: 1,
                            current_page: '/api/views/?page=1',
                            per_page: 30,
                        },
                        selectAll: true,
                    },
                }) // We need to do that separately, else JS transforms the `int` key into a string
                .setIn(['meta', selectedTagId], fromJS({selected: true})),
        }
    })

    it('getTagsState', () => {
        expect(selectors.getTagsState(state)).toEqualImmutable(state.tags)
        expect(selectors.getTagsState({})).toEqualImmutable(fromJS({}))
    })

    it('getTags', () => {
        expect(selectors.getTags(state)).toEqualImmutable(
            state.tags.get('items')
        )
        expect(selectors.getTags({})).toEqualImmutable(fromJS([]))
    })

    it('getInternal', () => {
        expect(selectors.getInternal(state)).toBe(state.tags.get('_internal'))
        expect(selectors.getInternal({})).toBe(fromJS({}))
    })

    it('getNumberPages', () => {
        expect(selectors.getNumberPages(state)).toBe(
            state.tags.getIn(['_internal', 'pagination', 'nb_pages'])
        )
        expect(selectors.getNumberPages({})).toBe(1)
    })

    it('getCurrentPage', () => {
        expect(selectors.getCurrentPage(state)).toBe(
            state.tags.getIn(['_internal', 'pagination', 'page'])
        )
        expect(selectors.getCurrentPage({})).toBe(1)
    })

    it('getSelectAll', () => {
        expect(selectors.getSelectAll(state)).toBe(
            state.tags.getIn(['_internal', 'selectAll'])
        )
        expect(selectors.getSelectAll({})).toBe(false)
    })

    it('getMeta', () => {
        expect(selectors.getMeta(state)).toBe(state.tags.get('meta'))
        expect(selectors.getMeta({})).toBe(fromJS({}))
    })

    it('getSelectedTagMeta', () => {
        expect(selectors.getSelectedTagMeta(selectedTagId)(state)).toBe(
            state.tags.getIn(['meta', selectedTagId])
        )
        expect(selectors.getSelectedTagMeta(selectedTagId)({})).toBe(fromJS({}))
    })
})
