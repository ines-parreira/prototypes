import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import {RootState} from '../../types'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('tags selectors', () => {
    let state: RootState
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
        } as RootState
    })

    it('getTagsState', () => {
        expect(selectors.getTagsState(state)).toEqualImmutable(state.tags)
        expect(selectors.getTagsState({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getTags', () => {
        expect(selectors.getTags(state)).toEqualImmutable(
            state.tags.get('items')
        )
        expect(selectors.getTags({} as RootState)).toEqualImmutable(fromJS([]))
    })

    it('getInternal', () => {
        expect(selectors.getInternal(state)).toBe(state.tags.get('_internal'))
        expect(selectors.getInternal({} as RootState)).toBe(fromJS({}))
    })

    it('getSelectAll', () => {
        expect(selectors.getSelectAll(state)).toBe(
            state.tags.getIn(['_internal', 'selectAll'])
        )
        expect(selectors.getSelectAll({} as RootState)).toBe(false)
    })

    describe('getIsCreating', () => {
        it.each([undefined, true, false])(
            'should return the proper value',
            (value) => {
                expect(
                    selectors.getIsCreating({
                        ...state,
                        tags: state.tags.setIn(
                            ['_internal', 'creating'],
                            value
                        ),
                    })
                ).toBe(!!value)
            }
        )
    })

    it('getMeta', () => {
        expect(selectors.getMeta(state)).toBe(state.tags.get('meta'))
        expect(selectors.getMeta({} as RootState)).toBe(fromJS({}))
    })

    it('getSelectedTagMeta', () => {
        expect(selectors.getSelectedTagMeta(selectedTagId)(state)).toBe(
            state.tags.getIn(['meta', selectedTagId])
        )
        expect(
            selectors.getSelectedTagMeta(selectedTagId)({} as RootState)
        ).toBe(fromJS({}))
    })
})
