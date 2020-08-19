import {StoreDispatch} from '../types'

import * as constants from './constants.js'

export const openPanel = (panelName: string): ReturnType<StoreDispatch> => {
    return {
        type: constants.OPEN_PANEL,
        panelName,
    }
}

export const closePanels = (): ReturnType<StoreDispatch> => {
    return {
        type: constants.CLOSE_PANELS,
    }
}
