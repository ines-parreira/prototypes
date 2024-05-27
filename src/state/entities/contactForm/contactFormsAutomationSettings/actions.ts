import {createAction} from '@reduxjs/toolkit'

import {ContactFormAutomationSettings} from 'models/contactForm/types'
import {ContactFormsAutomationSettingsActions} from 'state/entities/contactForm/contactFormsAutomationSettings/types'

export const contactFormAutomationSettingsFetched = createAction<{
    contactFormId: string
    automationSettings: ContactFormAutomationSettings
}>(
    ContactFormsAutomationSettingsActions.CONTACTFORM_AUTOMATION_SETTINGS_FETCHED
)
export const contactFormsAutomationSettingsFetched = createAction<
    {
        contactFormId: string
        automationSettings: ContactFormAutomationSettings
    }[]
>(
    ContactFormsAutomationSettingsActions.CONTACTFORMS_AUTOMATION_SETTINGS_FETCHED
)

export const contactFormAutomationSettingsUpdated = createAction<{
    contactFormId: string
    automationSettings: ContactFormAutomationSettings
}>(
    ContactFormsAutomationSettingsActions.CONTACTFORM_AUTOMATION_SETTINGS_UPDATED
)
