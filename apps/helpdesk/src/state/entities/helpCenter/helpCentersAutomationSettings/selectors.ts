import type { StoreState } from 'state/types'

import type { HelpCentersAutomationSettingsState } from './types'

export const getHelpCentersAutomationSettings = (
    state: StoreState,
): HelpCentersAutomationSettingsState['automationSettingsByHelpCenterId'] =>
    state.entities.helpCenter.helpCentersAutomationSettings
        .automationSettingsByHelpCenterId || {}
