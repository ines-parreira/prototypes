import {createReducer} from '@reduxjs/toolkit'

import {
    optimisticUserSettingsReset,
    optimisticUserSettingsSet,
    optimisticAccountSettingsSet,
    optimisticAccountSettingsReset,
} from './actions'
import {TicketNavbarState} from './types'

const initialOptimisticSettings = {
    views: {},
    view_sections: {},
}

export const initialState: TicketNavbarState = {
    optimisticAccountSettings: initialOptimisticSettings,
    optimisticUserSettings: initialOptimisticSettings,
}

const ViewsReducer = createReducer<TicketNavbarState>(initialState, (builder) =>
    builder
        .addCase(optimisticUserSettingsSet, (state, {payload}) => {
            state.optimisticUserSettings = payload
        })
        .addCase(optimisticUserSettingsReset, (state) => {
            state.optimisticUserSettings = initialOptimisticSettings
        })
        .addCase(optimisticAccountSettingsSet, (state, {payload}) => {
            state.optimisticAccountSettings = payload
        })
        .addCase(optimisticAccountSettingsReset, (state) => {
            state.optimisticAccountSettings = initialOptimisticSettings
        })
)

export default ViewsReducer
