import {fromJS} from 'immutable'

import * as types from './constants'
import * as search from './search'
import {generateDefaultAction} from './utils'

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
    items: []
})

export default (state = macrosInitial, action) => {
    switch (action.type) {
        case types.CLOSE_MODAL:
            return state.set('isModalOpen', false)

        case types.OPEN_MODAL:
            return state.set('isModalOpen', true)

        case types.CREATE_MACRO_SUCCESS:
            search.add(action.resp)
            return state.update('items', (items) => items.push(fromJS(action.resp)))

        case types.UPDATE_MACRO_SUCCESS:
            search.update(action.resp)
            return state.update('items', (items) => items.map((m) => {
                if (m.get('id') === action.resp.id) {
                    return fromJS(action.resp)
                }
                return m
            }))

        case types.DELETE_MACRO_SUCCESS:
            search.remove(action.resp)
            return state.update('items', (items) => items.filter((m) => m.get('id') !== action.resp.id))

        case types.SET_MACROS_VISIBILITY:
            return state.set('visible', action.visible)

        case types.FETCH_MACRO_LIST_SUCCESS: {
            const macros = fromJS(action.resp.data || [])
            search.populate(macros, true)
            return state.set('items', macros)
        }

        default:
            return state
    }
}
