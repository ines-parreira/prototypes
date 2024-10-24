import {ContactFormsState} from 'state/entities/contactForm/contactForms'

import {ContactFormsAutomationSettingsState} from './contactFormsAutomationSettings'

export type ContactFormState = {
    contactForms: ContactFormsState
    contactFormsAutomationSettings: ContactFormsAutomationSettingsState
}
