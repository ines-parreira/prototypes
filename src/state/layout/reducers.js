// @flow
import {fromJS} from 'immutable'

import type {Map} from 'immutable'

import type {actionType} from '../types'

import * as types from './constants.js'

const initialState = fromJS({
    openedPanel: null,
})

export default function reducer(
    state: Map<*, *> = initialState,
    action: actionType
): Map<*, *> {
    switch (action.type) {
        case types.OPEN_PANEL: {
            return state.set('openedPanel', action.panelName)
        }

        case types.CLOSE_PANELS: {
            return state.set('openedPanel', null)
        }

        default:
            return state
    }
}
