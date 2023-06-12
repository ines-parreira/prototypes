import {StoreState} from 'state/types'
import {ContactFormsAutomationSettingsState} from './types'

export const getContactFormsAutomationSettings = (
    state: StoreState
): ContactFormsAutomationSettingsState['automationSettingsByContactFormId'] =>
    state.entities.contactForm.contactFormsAutomationSettings
        .automationSettingsByContactFormId || {}
