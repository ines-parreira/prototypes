import { combineReducers } from 'redux'

import {
    initialState as contactFormsInitialState,
    contactFormReducer as contactFormsReducer,
} from 'state/entities/contactForm/contactForms'
import {
    initialState as contactFormsAutomationSettingsInitialState,
    contactFormAutomationSettingsReducer as contactFormsAutomationSettingsReducer,
} from 'state/entities/contactForm/contactFormsAutomationSettings'

export const initialState = {
    contactForms: contactFormsInitialState,
    contactFormsAutomationSettings: contactFormsAutomationSettingsInitialState,
}

const DefaultExportReducer = combineReducers({
    contactForms: contactFormsReducer,
    contactFormsAutomationSettings: contactFormsAutomationSettingsReducer,
})

export { DefaultExportReducer }
