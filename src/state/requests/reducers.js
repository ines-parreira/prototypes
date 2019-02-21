// @flow
import {fromJS} from 'immutable'


import type {Map} from 'immutable'

import type {actionType} from '../types'

import * as constants from './constants'

export const requestInitial = fromJS({
    id: 'new',
    name: 'New Request',
    samples: ''
})

export const requestsInitial = fromJS({
    items: []
})

export default function reducer(state: Map<*, *> = requestsInitial, action: actionType): Map<*, *> {
    switch (action.type) {
        case constants.CREATE_REQUEST_SUCCESS:
            // Flow auto-detects all properties in Map as boolean, because of above.
            // $FlowFixMe
            return state.update('items', (items) => items.push(fromJS(action.resp)))

        case constants.UPDATE_REQUEST_SUCCESS:
            // $FlowFixMe
            return state.update('items', (items) => items.map((m) => {
                if (m.get('id') === action.resp.id) {
                    return fromJS(action.resp)
                }
                return m
            }))

        case constants.DELETE_REQUEST_SUCCESS:
            // $FlowFixMe
            return state.update('items', (items) => items.filter((m) => m.get('id') !== action.resp.id))

        case constants.DELETE_BULK_REQUEST_SUCCESS:
            // $FlowFixMe
            return state.update('items', (items) =>
                items.filter(
                    (m) => !action.requestIds.includes(m.get('id'))
                )
            )

        case constants.FETCH_REQUEST_LIST_SUCCESS: {
            const requests = fromJS(action.resp.data || [])
            return state.set('items', requests)
        }

        default:
            return state
    }
}
