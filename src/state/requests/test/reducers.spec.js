import * as immutableMatchers from 'jest-immutable-matchers'

import {fromJS} from 'immutable'

import reducer, {requestsInitial as initialState} from '../reducers'
import * as types from '../constants'

jest.addMatchers(immutableMatchers)

describe('requests reducers', () => {
    // Simulates current requests in state
    const currentFakeRequests = fromJS([
        {id: 1, name: 'current_fake_name'},
        {id: 2, name: 'other_current_fake_name'}
    ])

    // Simulates the arrival of new requests
    const newFakeRequests = fromJS([
        {id: 3, name: 'new_fake_name'},
        {id: 4, name: 'other_new_fake_name'}
    ])

    it('initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    it('fetch request list', () => {
        // success
        expect(
            reducer(
                initialState,
                {
                    type: types.FETCH_REQUEST_LIST_SUCCESS,
                    resp: {data: newFakeRequests, meta: {page: 1}},
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('create request', () => {
        expect(
            reducer(
                initialState,
                {
                    type: types.CREATE_REQUEST_SUCCESS,
                    resp: newFakeRequests.first(),
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('update request', () => {
        const updatedRequest = currentFakeRequests.first()
        expect(
            reducer(
                initialState.mergeDeep({items: currentFakeRequests}),
                {
                    type: types.UPDATE_REQUEST_SUCCESS,
                    resp: updatedRequest.set('name', 'updated').toJS(),
                }
            ).toJS()
        ).toMatchSnapshot()
    })


    it('delete request', () => {
        expect(
            reducer(
                initialState.mergeDeep({items: currentFakeRequests}),
                {
                    type: types.DELETE_REQUEST_SUCCESS,
                    resp: currentFakeRequests.first().toJS(),
                }
            ).toJS()
        ).toMatchSnapshot()
    })

    it('delete bulk request', () => {
        expect(
            reducer(
                initialState.mergeDeep({items: currentFakeRequests}),
                {
                    type: types.DELETE_BULK_REQUEST_SUCCESS,
                    requestIds: [currentFakeRequests.first().toJS().id],
                }
            ).toJS()
        ).toMatchSnapshot()
    })
})
