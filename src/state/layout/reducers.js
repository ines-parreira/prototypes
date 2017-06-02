import {fromJS} from 'immutable'
import * as types from './constants.js'

const initialState = fromJS({
    openedPanel: null,
})

export default (state = initialState, action) => {
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
