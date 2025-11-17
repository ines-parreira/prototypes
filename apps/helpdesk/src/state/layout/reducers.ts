import { fromJS } from 'immutable'

import type { GorgiasAction } from '../types'
import * as types from './constants'
import type { LayoutState } from './types'

const initialState: LayoutState = fromJS({
    openedPanel: null,
})

export default function reducer(
    state: LayoutState = initialState,
    action: GorgiasAction,
): LayoutState {
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
