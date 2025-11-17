import type { StoreState } from 'state/types'

import type { ContactFormState } from './types'

export const getContactFormStore = (state: StoreState): ContactFormState =>
    state.entities.contactForm
