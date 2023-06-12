import {createReducer} from '@reduxjs/toolkit'
import {
    helpCenterAutomationSettingsFetched,
    helpCenterAutomationSettingsUpdated,
} from 'state/entities/helpCenter/helpCentersAutomationSettings/actions'
import {HelpCentersAutomationSettingsState} from './types'

export const initialState: HelpCentersAutomationSettingsState = {
    automationSettingsByHelpCenterId: {},
}

const helpCenterAutomationSettingsReducer =
    createReducer<HelpCentersAutomationSettingsState>(initialState, (builder) =>
        builder
            .addCase(
                helpCenterAutomationSettingsFetched,
                (state, {payload: {helpCenterId, automationSettings}}) => {
                    state.automationSettingsByHelpCenterId[helpCenterId] =
                        automationSettings
                }
            )
            .addCase(
                helpCenterAutomationSettingsUpdated,
                (state, {payload: {helpCenterId, automationSettings}}) => {
                    state.automationSettingsByHelpCenterId[helpCenterId] =
                        automationSettings
                }
            )
    )

export default helpCenterAutomationSettingsReducer
