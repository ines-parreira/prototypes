import _keyBy from 'lodash/keyBy'

import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import { initialState as contactFormInitialState } from 'state/entities/contactForm/reducer'
import type { StoreState } from 'state/types'
import { initialState as uiState } from 'state/ui/contactForm/reducer'

import { getContactFormById, getCurrentContactForm } from '../selectors'

describe('Entities/Contact Form', () => {
    describe('getCurrentContactForm', () => {
        it('returns null if the currentId is not defined', () => {
            const store: Partial<StoreState> = {
                entities: { contactForm: contactFormInitialState } as any,
                ui: { contactForm: uiState } as any,
            }
            expect(getCurrentContactForm(store as StoreState)).toEqual(null)
        })

        it('returns the right contact form by currentId', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    contactForm: {
                        contactForms: {
                            contactFormById: _keyBy([ContactFormFixture], 'id'),
                        },
                    },
                } as any,
                ui: {
                    contactForm: {
                        ...uiState,
                        currentId: ContactFormFixture.id,
                    },
                } as any,
            }

            expect(getCurrentContactForm(dataStore as StoreState)).toEqual(
                ContactFormFixture,
            )
        })
    })

    describe('getContactFormById', () => {
        const CONTACT_FORM_ID = 1

        it('returns null if the contact form with the given id does not exist', () => {
            const store: Partial<StoreState> = {
                entities: { contactForm: contactFormInitialState } as any,
                ui: { contactForm: uiState } as any,
            }
            expect(
                getContactFormById(CONTACT_FORM_ID)(store as StoreState),
            ).toEqual(null)
        })

        it('returns the right contact form by id', () => {
            const dataStore: Partial<StoreState> = {
                entities: {
                    contactForm: {
                        contactForms: {
                            contactFormById: {
                                [CONTACT_FORM_ID]: ContactFormFixture,
                            },
                        },
                    },
                } as any,
                ui: { contactForm: uiState } as any,
            }

            expect(
                getContactFormById(CONTACT_FORM_ID)(dataStore as StoreState),
            ).toEqual(ContactFormFixture)
        })
    })
})
