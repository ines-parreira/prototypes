import { createSelector } from 'reselect'

import { StoreState } from 'state/types'

import { ContactFormState } from './types'

const getContactFormStore = (state: StoreState): ContactFormState =>
    state.ui.contactForm

export const getCurrentContactFormId = createSelector(
    getContactFormStore,
    (state) => state.currentId,
)
