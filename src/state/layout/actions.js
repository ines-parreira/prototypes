// @flow
import type {dispatchType} from '../types'

import * as constants from './constants'

export const openPanel = (panelName: string): dispatchType => {
    return {
        type: constants.OPEN_PANEL,
        panelName,
    }
}

export const closePanels = (): dispatchType => {
    return {
        type: constants.CLOSE_PANELS,
    }
}
