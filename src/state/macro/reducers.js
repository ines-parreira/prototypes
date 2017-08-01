import {fromJS, Map} from 'immutable'

import * as types from './constants'
import {generateDefaultAction} from './utils'
import {toImmutable} from '../../utils'

export const macroListToMap = (macros) => {
    macros = toImmutable(macros)
    let items = Map()

    macros.forEach((macro) => {
        items = items.set(macro.get('id'), fromJS(macro))
    })

    return items.sortBy(i => i.get('usage', 0)).reverse()
}

export const macroInitial = fromJS({
    id: 'new',
    name: 'New macro',
    actions: [
        generateDefaultAction('setResponseText')
    ]
})

const macrosInitial = fromJS({
    visible: true,
    isModalOpen: false,
    items: {}
})

export default (state = macrosInitial, action) => {
    let newState = state

    switch (action.type) {
        case types.CLOSE_MODAL:
            return state.set('isModalOpen', false)

        case types.OPEN_MODAL:
            return state.set('isModalOpen', true)

        case types.CREATE_MACRO_SUCCESS:
        case types.UPDATE_MACRO_SUCCESS:
            return state.setIn(['items', action.resp.id], fromJS(action.resp))

        case types.DELETE_MACRO_SUCCESS:
            return state.set('items', newState.get('items').delete(action.macroId))

        case types.SET_MACROS_VISIBILITY:
            return state.set('visible', action.visible)

        case types.FETCH_MACRO_LIST_SUCCESS: {
            const macros = action.resp.data || []
            return state.merge({
                items: macroListToMap(macros)
            })
        }

        default:
            return state
    }
}
