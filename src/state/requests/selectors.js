// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import type {Map} from 'immutable'
import type {stateType} from '../types'
import {getMessages} from '../ticket/selectors'

export const getRequestsState = (state: stateType): Map<*, *> => state.requests || fromJS({})

export const getRequests = createSelector(
    [getRequestsState],
    (requests) => requests.get('items') || fromJS([])
)

export const getLatestRequest = createSelector(
    [getRequests, getMessages],
    (requests, messages) => {
        const lastMessage = messages.filter((m) => m.get('request_id')).sortBy((m) => m.get('created_datetime')).last()
        if (lastMessage) {
            return requests.filter((r) => r.get('id') === lastMessage.get('request_id')).first() || fromJS({})
        }
        return fromJS({})
    }
)
