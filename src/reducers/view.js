import * as actions from '../actions/view'
import Immutable, {Map} from 'immutable'
import { _ } from 'lodash'


export function views(state = Map(), action) {
    switch (action.type) {
        case actions.NEW_VIEW:
            return state
        case actions.FETCH_VIEW_LIST_START:
            return state
        case actions.FETCH_VIEW_LIST_SUCCESS:
            return Map(_.keyBy(action.resp.data, 'slug'))
        case actions.UPDATE_VIEW_START:
            // TODO: Use ImmutableJS throughout
            let newState = state.toJS()
            newState[action.slug] = _.assign({}, newState[action.slug], action.data)
            return Map(newState)
        default:
            return state
    }
}
