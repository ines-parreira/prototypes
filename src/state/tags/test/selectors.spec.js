import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('tags selectors', () => {
    let state

    beforeEach(() => {
        state = {
            tags: initialState
                .mergeDeep({
                    items: [
                        {
                            id: 1,
                            name: 'refund',
                            decoration: null,
                            user_id: 2,
                            usage: 60,
                            created_datetime: '2017-08-16T16:54:49'
                        },
                        {
                            id: 2,
                            name: 'billing',
                            decoration: null,
                            user_id: 2,
                            usage: 30,
                            created_datetime: '2017-08-16T16:54:49'
                        },
                    ],
                    meta: {},
                    _internal: {
                        pagination: {
                            item_count: 2,
                            nb_pages: 1,
                            page: 1,
                            current_page: '/api/views/?page=1',
                            per_page: 30
                        }
                    }
                })
        }
    })

    it('getTagsState', () => {
        expect(selectors.getTagsState(state)).toEqualImmutable(state.tags)
        expect(selectors.getTagsState({})).toEqualImmutable(fromJS({}))
    })

    it('getTags', () => {
        expect(selectors.getTags(state)).toEqualImmutable(state.tags.get('items'))
        expect(selectors.getTags({})).toEqualImmutable(fromJS([]))
    })

    it('getNumberPages', () => {
        expect(selectors.getNumberPages(state)).toBe(state.tags.getIn(['_internal', 'pagination', 'nb_pages']))
        expect(selectors.getNumberPages({})).toBe(1)
    })

    it('getCurrentPage', () => {
        expect(selectors.getCurrentPage(state)).toBe(state.tags.getIn(['_internal', 'pagination', 'page']))
        expect(selectors.getCurrentPage({})).toBe(1)
    })
})
