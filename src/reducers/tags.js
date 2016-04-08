import * as actions from '../actions/tag'
import { Map, List } from 'immutable'
import _ from 'lodash'

const tagsInitial = Map({
    items: List(),
})

export function tags(state = tagsInitial, action) {
    switch (action.type) {

        case actions.FETCH_TAG_LIST_SUCCESS:
            return state.set('items', List().merge(action.resp.data))

        case actions.ADD_TAGS:
            return state.set('items', state.get('items').concat(action.tags))

        default:
            return state
    }
}
