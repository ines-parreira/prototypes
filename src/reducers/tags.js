import * as types from '../constants/tag'
import {List, fromJS} from 'immutable'

export const tagsInitial = fromJS({
    items: []
})

export function tags(state = tagsInitial, action) {
    switch (action.type) {
        case types.FETCH_TAG_LIST_SUCCESS:
            return state.set('items', List().merge(action.resp.data))

        case types.ADD_TAGS:
            return state.set('items', state.get('items').concat(action.tags))

        default:
            return state
    }
}
