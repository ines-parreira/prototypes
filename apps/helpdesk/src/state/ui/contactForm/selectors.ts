import { createSelector } from 'reselect'

import type { StoreState } from 'state/types'

import type { ContactFormState } from './types'

const getContactFormStore = (state: StoreState): ContactFormState =>
    state.ui.contactForm

export const getCurrentContactFormId = createSelector(
    getContactFormStore,
    (state) => state.currentId,
)
