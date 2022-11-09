import {StoreDispatch} from '../types'

import * as constants from './constants'

export const openPanel = (panelName: string): ReturnType<StoreDispatch> => {
    return {
        type: constants.OPEN_PANEL,
        panelName,
    }
}

export const closePanels = () => {
    return {
        type: constants.CLOSE_PANELS,
    }
}
