import { HelpCenterAutomationSettings } from 'models/helpCenter/types'

export enum HelpCentersAutomationSettingsActions {
    HELPCENTER_AUTOMATION_SETTINGS_FETCHED = 'HELPCENTER/HELPCENTER_AUTOMATION_SETTINGS_FETCHED',
    HELPCENTERS_AUTOMATION_SETTINGS_FETCHED = 'HELPCENTER/HELPCENTERS_AUTOMATION_SETTINGS_FETCHED',
    HELPCENTER_AUTOMATION_SETTINGS_UPDATED = 'HELPCENTER/HELPCENTER_AUTOMATION_SETTINGS_UPDATED',
}

export type HelpCentersAutomationSettingsState = {
    automationSettingsByHelpCenterId: Record<
        string,
        HelpCenterAutomationSettings
    >
}
