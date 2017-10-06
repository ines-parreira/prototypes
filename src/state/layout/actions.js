// @flow
import * as constants from './constants'

import type {dispatchType} from '../types'

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
