import {StoreState} from 'state/types'

import {ContactFormState} from './types'

export const getContactFormStore = (state: StoreState): ContactFormState =>
    state.entities.contactForm
