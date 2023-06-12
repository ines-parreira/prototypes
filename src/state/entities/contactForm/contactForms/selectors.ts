import {createSelector} from '@reduxjs/toolkit'
import {StoreState} from 'state/types'
import {ContactFormsState} from 'state/entities/contactForm/contactForms/types'
import {getCurrentContactFormId} from 'state/ui/contactForm'
import {ContactForm} from 'models/contactForm/types'

export const getContactForms = (
    state: StoreState
): ContactFormsState['contactFormById'] =>
    state.entities.contactForm.contactForms.contactFormById || {}

export const getContactFormsList = createSelector(
    getContactForms,
    (contactForms) => Object.values(contactForms)
)

export const getCurrentContactForm = createSelector(
    getCurrentContactFormId,
    getContactForms,
    (currentContactFormId, contactForms): ContactForm | null => {
        if (typeof currentContactFormId !== 'number') return null
        return contactForms[currentContactFormId.toString()] || null
    }
)

export const getContactFormById = (contactFormId: number | null) =>
    createSelector(getContactForms, (contactForms): ContactForm | null => {
        if (!contactFormId) return null
        return contactForms[contactFormId.toString()] || null
    })
