import type { ContactFormsState } from 'state/entities/contactForm/contactForms'

import type { ContactFormsAutomationSettingsState } from './contactFormsAutomationSettings'

export type ContactFormState = {
    contactForms: ContactFormsState
    contactFormsAutomationSettings: ContactFormsAutomationSettingsState
}
