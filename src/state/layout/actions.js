import * as types from './constants'

export const openPanel = (panelName) => {
    return {
        type: types.OPEN_PANEL,
        panelName,
    }
}

export const closePanels = () => {
    return {
        type: types.CLOSE_PANELS,
    }
}
