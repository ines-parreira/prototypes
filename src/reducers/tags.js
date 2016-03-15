import * as actions from '../actions/tag'
import {Map} from 'immutable'
import _ from 'lodash'

const tagsInitial = Map({
    items: [],
})

export function tags(state = tagsInitial, action) {
    switch (action.type) {

        case actions.FETCH_TAG_LIST_SUCCESS:
            return Map({
                items: action.resp.data,
            })

        default:
            return state
    }
}