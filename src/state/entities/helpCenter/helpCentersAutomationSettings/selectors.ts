import {StoreState} from 'state/types'
import {HelpCentersAutomationSettingsState} from './types'

export const getHelpCentersAutomationSettings = (
    state: StoreState
): HelpCentersAutomationSettingsState['automationSettingsByHelpCenterId'] =>
    state.entities.helpCenter.helpCentersAutomationSettings
        .automationSettingsByHelpCenterId || {}
