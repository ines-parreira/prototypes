import * as actions from '../actions/macro'
import Immutable, { Map } from 'immutable'
import _ from 'lodash'

const macrosInitial = Map({
    visible: true,
    selected: Map(),
    items: Map(),
})

export function macros(state = macrosInitial, action) {
    let items
    switch (action.type) {

        case actions.PREVIEW_MACRO:
            return state.set('selected', state.getIn(['items', action.id]))

        case actions.APPLY_MACRO:
            return state.set('visible', false)

        case actions.SET_MACROS_VISIBILITY:
            return state.set('visible', action.visible)

        case actions.PREVIEW_ADJACENT_MACRO:
            let prev
            const selectedMacro = state.get('selected')
            items = state.get('items')

            for (let current of items.toIndexedSeq()) {
                const toSelect = action.direction === 'prev' ? prev : current
                const toCompare = action.direction === 'prev' ? current : prev
                if (selectedMacro === toCompare) {
                    return prev ? state.set('selected', toSelect) : state
                }
                prev = current
            }
            return state

        case actions.FETCH_MACRO_LIST_SUCCESS:
            items = Immutable.Map()
            for (let macro of action.resp.data) {
                items = items.set(macro.id, Immutable.fromJS(macro))
            }
            return state.merge({
                visible: true,
                items,
            })

        default:
            return state
    }
}