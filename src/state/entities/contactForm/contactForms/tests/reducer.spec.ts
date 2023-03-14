import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import {
    contactFormUpdated,
    contactFormDeleted,
    contactFormsFetched,
} from '../actions'
import reducer, {initialState} from '../reducer'

describe('contactForms reducer', () => {
    describe('contactFormDeleted action', () => {
        it('should delete a contact form from the state', () => {
            const newState = reducer(
                {
                    contactFormById: {
                        [ContactFormFixture.id]: ContactFormFixture,
                        [666]: ContactFormFixture,
                    },
                },
                contactFormDeleted(ContactFormFixture.id)
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('contactFormUpdated action', () => {
        it('should replace an existing contact form in the state', () => {
            const newState = reducer(
                {
                    contactFormById: {
                        [ContactFormFixture.id]: ContactFormFixture,
                    },
                },
                contactFormUpdated({
                    ...ContactFormFixture,
                    name: 'test',
                    default_locale: 'da-DK',
                    subject_lines: {
                        allow_other: true,
                        created_datetime:
                            ContactFormFixture.subject_lines.created_datetime,
                        updated_datetime:
                            ContactFormFixture.subject_lines.updated_datetime,
                        options: {
                            ['da-DK']: ['TEST'],
                        },
                    },
                })
            )
            expect(newState).toMatchSnapshot()
        })
    })

    describe('contactFormsFetched action', () => {
        it('should add the contact forms to the state', () => {
            const newState = reducer(
                initialState,
                contactFormsFetched([ContactFormFixture])
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
