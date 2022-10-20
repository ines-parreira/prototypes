import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {initialState} from '../reducers.ts'
import * as types from '../constants.ts'

jest.addMatchers(immutableMatchers)

describe('tags reducers', () => {
    // Simulates current tags in state
    const currentFakeTags = fromJS([
        {id: 1, name: 'current_fake_name'},
        {id: 2, name: 'other_current_fake_name'},
    ])

    // Simulates the arrival of new tags
    const newFakeTags = fromJS([
        {id: 3, name: 'new_fake_name'},
        {id: 4, name: 'other_new_fake_name'},
    ])

    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch tag list', () => {
        // success
        expect(
            reducer(initialState, {
                type: types.FETCH_TAG_LIST_SUCCESS,
                resp: {data: newFakeTags, meta: {page: 1}},
            }).toJS()
        ).toMatchSnapshot()
    })

    it('add tags', () => {
        expect(
            reducer(
                initialState.mergeDeep({
                    items: currentFakeTags,
                }),
                {
                    type: types.ADD_TAGS,
                    tags: newFakeTags,
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('select tag', () => {
        expect(
            reducer(initialState.mergeDeep({items: currentFakeTags}), {
                type: types.SELECT_TAG,
                tag: {id: 1},
            }).toJS()
        ).toMatchSnapshot()
    })

    it('select all tags', () => {
        expect(
            reducer(initialState.mergeDeep({items: currentFakeTags}), {
                type: types.SELECT_TAG_ALL,
                tags: [{id: 1}, {id: 2}],
            }).toJS()
        ).toMatchSnapshot()
    })

    it('edit tag', () => {
        expect(
            reducer(initialState.mergeDeep({items: currentFakeTags}), {
                type: types.EDIT_TAG,
                tag: {id: 1},
            }).toJS()
        ).toMatchSnapshot()
    })

    it('cancel edit tag', () => {
        expect(
            reducer(initialState.mergeDeep({items: currentFakeTags}), {
                type: types.EDIT_TAG_CANCEL,
                tag: {id: 1},
            }).toJS()
        ).toMatchSnapshot()
    })

    it('save tag', () => {
        // success
        expect(
            reducer(initialState.mergeDeep({items: currentFakeTags}), {
                type: types.SAVE_TAG,
                tag: {id: 1, name: 'edited_name'},
            }).toJS()
        ).toMatchSnapshot()
    })

    it('create tag', () => {
        // start
        expect(
            reducer(initialState, {
                type: types.CREATE_TAG_START,
            }).toJS()
        ).toMatchSnapshot()

        // success
        expect(
            reducer(initialState, {
                type: types.CREATE_TAG_SUCCESS,
                tag: {id: 1, foo: 'bar'},
            }).toJS()
        ).toMatchSnapshot()

        // error
        expect(
            reducer(initialState, {
                type: types.CREATE_TAG_ERROR,
            }).toJS()
        ).toMatchSnapshot()
    })

    it('remove tag', () => {
        expect(
            reducer(initialState.mergeDeep({items: currentFakeTags}), {
                type: types.REMOVE_TAG,
                id: 1,
            }).toJS()
        ).toMatchSnapshot()
    })

    it('reset meta of tags', () => {
        expect(
            reducer(
                initialState.mergeDeep({
                    items: currentFakeTags,
                    meta: fromJS({
                        2: {
                            selected: true,
                        },
                        5: {
                            selected: true,
                        },
                        15: {
                            selected: false,
                        },
                    }),
                }),
                {
                    type: types.RESET_META,
                }
            ).toJS().meta
        ).toEqual({})
    })
})
