import * as actions from '../actions/macro'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'

const macrosInitial = Map({
    show: true,
    selected: null,
    items: Map(),
})

export function macros(state = macrosInitial, action) {
    switch (action.type) {

        case actions.PREVIEW_MACRO:
            const macros = state.get('items')
            return state.set('selected', macros.get(action.id))

        case actions.FETCH_MACRO_LIST_SUCCESS:
            let items = Immutable.Map()
            for (let macro of action.resp.data) {
                items = items.set(macro.id, Immutable.fromJS(macro))
            }
            return Map({
                show: true,
                selected: null,
                items,
            })

        default:
            return state
    }
}