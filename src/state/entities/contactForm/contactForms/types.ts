import { PayloadActionCreator } from '@reduxjs/toolkit'

import { ContactForm } from 'models/contactForm/types'

export enum ContactFormsActions {
    CONTACTFORM_UPDATED = 'CONTACTFORM/CONTACTFORM_FETCHED',
    CONTACTFORM_DELETED = 'CONTACTFORM/CONTACTFORM_DELETED',
    CONTACTFORMS_FETCHED = 'CONTACTFORM/CONTACTFORMS_FETCHED',
}

export type ContactFormUpdatedAction = PayloadActionCreator<
    ContactForm,
    typeof ContactFormsActions.CONTACTFORM_UPDATED
>

export type ContactFormsState = {
    contactFormById: Record<string, ContactForm>
}
