import * as actions from '../actions/widget'
import { Map } from 'immutable'


const widgetsInitial = Map({
    items: [],
    meta: {}
})

export function widgets(state = widgetsInitial, action) {
    switch (action.type) {
        case actions.FETCH_WIDGETS_START:
            return state
        case actions.FETCH_WIDGETS_SUCCESS:
            return Map({
                items: action.resp.data,
                meta: action.resp.meta
            })
        default:
            return state
    }
}
