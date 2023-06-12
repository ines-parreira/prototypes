import {createAction} from '@reduxjs/toolkit'

import {HelpCenterAutomationSettings} from 'models/helpCenter/types'
import {HelpCentersAutomationSettingsActions} from 'state/entities/helpCenter/helpCentersAutomationSettings/types'

export const helpCenterAutomationSettingsFetched = createAction<{
    helpCenterId: string
    automationSettings: HelpCenterAutomationSettings
}>(HelpCentersAutomationSettingsActions.HELPCENTER_AUTOMATION_SETTINGS_FETCHED)

export const helpCenterAutomationSettingsUpdated = createAction<{
    helpCenterId: string
    automationSettings: HelpCenterAutomationSettings
}>(HelpCentersAutomationSettingsActions.HELPCENTER_AUTOMATION_SETTINGS_UPDATED)
