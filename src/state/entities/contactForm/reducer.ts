import { combineReducers } from 'redux'

import contactFormsReducer, {
    initialState as contactFormsInitialState,
} from 'state/entities/contactForm/contactForms'
import contactFormsAutomationSettingsReducer, {
    initialState as contactFormsAutomationSettingsInitialState,
} from 'state/entities/contactForm/contactFormsAutomationSettings'

export const initialState = {
    contactForms: contactFormsInitialState,
    contactFormsAutomationSettings: contactFormsAutomationSettingsInitialState,
}

export default combineReducers({
    contactForms: contactFormsReducer,
    contactFormsAutomationSettings: contactFormsAutomationSettingsReducer,
})
