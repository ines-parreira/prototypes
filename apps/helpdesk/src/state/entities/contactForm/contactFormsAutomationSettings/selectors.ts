import type { StoreState } from 'state/types'

import type { ContactFormsAutomationSettingsState } from './types'

export const getContactFormsAutomationSettings = (
    state: StoreState,
): ContactFormsAutomationSettingsState['automationSettingsByContactFormId'] =>
    state.entities.contactForm.contactFormsAutomationSettings
        .automationSettingsByContactFormId || {}
