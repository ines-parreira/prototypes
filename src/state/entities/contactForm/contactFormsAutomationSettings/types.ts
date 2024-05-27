import {ContactFormAutomationSettings} from 'models/contactForm/types'

export enum ContactFormsAutomationSettingsActions {
    CONTACTFORM_AUTOMATION_SETTINGS_FETCHED = 'CONTACTFORM/CONTACTFORM_AUTOMATION_SETTINGS_FETCHED',
    CONTACTFORMS_AUTOMATION_SETTINGS_FETCHED = 'CONTACTFORM/CONTACTFORMS_AUTOMATION_SETTINGS_FETCHED',
    CONTACTFORM_AUTOMATION_SETTINGS_UPDATED = 'CONTACTFORM/CONTACTFORM_AUTOMATION_SETTINGS_UPDATED',
}

export type ContactFormsAutomationSettingsState = {
    automationSettingsByContactFormId: Record<
        string,
        ContactFormAutomationSettings
    >
}
