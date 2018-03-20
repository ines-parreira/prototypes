// @flow
import {fromJS} from 'immutable'

import * as constants from './constants'
import * as search from './search'
import {generateDefaultAction} from './utils'

import type {Map} from 'immutable'
import type {actionType} from '../types'

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

export default (state: Map<*, *> = macrosInitial, action: actionType): Map<*, *> => {
    switch (action.type) {
        case constants.OPEN_MODAL:
            return state.set('isModalOpen', true)

        case constants.CLOSE_MODAL:
            return state.set('isModalOpen', false)

        case constants.CREATE_MACRO_SUCCESS:
            search.add(action.resp)
            // Flow auto-detects all properties in Map as boolean, because of above.
            // $FlowFixMe
            return state.update('items', (items) => items.push(fromJS(action.resp)))

        case constants.UPDATE_MACRO_SUCCESS:
            search.update(action.resp)
            // $FlowFixMe
            return state.update('items', (items) => items.map((m) => {
                if (m.get('id') === action.resp.id) {
                    return fromJS(action.resp)
                }
                return m
            }))

        case constants.DELETE_MACRO_SUCCESS:
            search.remove(action.resp)
            // $FlowFixMe
            return state.update('items', (items) => items.filter((m) => m.get('id') !== action.resp.id))

        case constants.SET_MACROS_VISIBILITY:
            return state.set('visible', action.visible)

        case constants.FETCH_MACRO_LIST_SUCCESS: {
            const macros = fromJS(action.resp.data || [])
            search.populate(macros, true)
            return state.set('items', macros)
        }

        default:
            return state
    }
}
