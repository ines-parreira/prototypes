import * as actions from '../actions/view'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'


export function views(state = Map(), action) {
    switch (action.type) {
        case actions.NEW_VIEW:
            return state
        case actions.FETCH_VIEW_LIST_START:
            return state
        case actions.FETCH_VIEW_LIST_SUCCESS:
            return Immutable.fromJS(_.keyBy(action.resp.data, 'slug'))
        case actions.UPDATE_VIEW_START:
            return state.mergeDeep({[action.slug]: action.data})
        default:
            return state
    }
}
