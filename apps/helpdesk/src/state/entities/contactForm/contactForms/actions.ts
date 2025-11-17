import { createAction } from '@reduxjs/toolkit'

import type { ContactForm } from 'models/contactForm/types'
import { ContactFormsActions } from 'state/entities/contactForm/contactForms/types'

export const contactFormsFetched = createAction<ContactForm[]>(
    ContactFormsActions.CONTACTFORMS_FETCHED,
)

export const contactFormUpdated = createAction<ContactForm>(
    ContactFormsActions.CONTACTFORM_UPDATED,
)

export const contactFormDeleted = createAction<number>(
    ContactFormsActions.CONTACTFORM_DELETED,
)
