import {createReducer} from '@reduxjs/toolkit'
import {ContactFormsState} from 'state/entities/contactForm/contactForms/types'
import {
    contactFormsFetched,
    contactFormDeleted,
    contactFormUpdated,
} from 'state/entities/contactForm/contactForms/actions'

export const initialState: ContactFormsState = {
    contactFormById: {},
}

const contactFormReducer = createReducer<ContactFormsState>(
    initialState,
    (builder) =>
        builder
            .addCase(contactFormUpdated, (state, {payload: newVersion}) => {
                const oldVersion =
                    state.contactFormById[newVersion.id.toString()] || {}
                state.contactFormById[newVersion.id.toString()] = {
                    ...oldVersion,
                    ...newVersion,
                    subject_lines: {
                        ...(oldVersion?.subject_lines || {}),
                        ...(newVersion?.subject_lines || {}),
                        options: {
                            ...(oldVersion?.subject_lines?.options || {}),
                            ...(newVersion?.subject_lines?.options || {}),
                        },
                    },
                }
            })
            .addCase(contactFormsFetched, (state, {payload}) => {
                payload.map((contactForm) => {
                    state.contactFormById[contactForm.id.toString()] =
                        contactForm
                })
            })
            .addCase(contactFormDeleted, (state, {payload}) => {
                delete state.contactFormById[payload]
            })
)

export default contactFormReducer
