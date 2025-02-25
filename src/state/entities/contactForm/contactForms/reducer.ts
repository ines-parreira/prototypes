import { createReducer } from '@reduxjs/toolkit'

import {
    contactFormDeleted,
    contactFormsFetched,
    contactFormUpdated,
} from 'state/entities/contactForm/contactForms/actions'
import { ContactFormsState } from 'state/entities/contactForm/contactForms/types'

export const initialState: ContactFormsState = {
    contactFormById: {},
}

const contactFormReducer = createReducer<ContactFormsState>(
    initialState,
    (builder) =>
        builder
            .addCase(contactFormUpdated, (state, { payload: newVersion }) => {
                state.contactFormById[newVersion.id.toString()] = newVersion
            })
            .addCase(contactFormsFetched, (state, { payload }) => {
                payload.map((contactForm) => {
                    state.contactFormById[contactForm.id.toString()] =
                        contactForm
                })
            })
            .addCase(contactFormDeleted, (state, { payload }) => {
                delete state.contactFormById[payload]
            }),
)

export default contactFormReducer
