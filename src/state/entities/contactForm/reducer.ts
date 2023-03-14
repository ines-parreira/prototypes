import {combineReducers} from 'redux'

import contactFormsReducer, {
    initialState as contactFormsInitialState,
} from 'state/entities/contactForm/contactForms'

export const initialState = {
    contactForms: contactFormsInitialState,
}

export default combineReducers({
    contactForms: contactFormsReducer,
})
