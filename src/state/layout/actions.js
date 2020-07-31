// @flow
import type {Dispatch} from '../types'

import * as constants from './constants'

export const openPanel = (panelName: string): Dispatch => {
    return {
        type: constants.OPEN_PANEL,
        panelName,
    }
}

export const closePanels = (): Dispatch => {
    return {
        type: constants.CLOSE_PANELS,
    }
}
