import MockAdapter from 'axios-mock-adapter'
import {
    ContactFormListFixtures,
    ContactFormGeneric500ErrorFixture,
    ContactFormFixture,
    ContactFormEmptyListFixture,
} from '../fixtures/contacForm'
import * as contactFormResourceMethods from '../resources'

export type MockOptions = 'success' | 'error' | 'success-empty'
export const mockResourceServerReplies = (
    mockedServer: MockAdapter,
    options: {
        [K in keyof typeof contactFormResourceMethods]?: MockOptions
    } = {
        getContactForms: 'success',
        createContactForm: 'success',
    }
) => {
    if (options.getContactForms === 'success') {
        mockedServer
            .onGet('/api/help-center/contact-forms')
            .reply(200, ContactFormListFixtures)
    }
    if (options.getContactForms === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/contact-forms')
            .reply(200, ContactFormEmptyListFixture)
    }

    if (options.getContactForms === 'error') {
        mockedServer
            .onGet(`/api/help-center/contact-forms`)
            .reply(500, ContactFormGeneric500ErrorFixture)
    }

    if (options.createContactForm === 'success') {
        mockedServer
            .onPost('/api/help-center/contact-forms')
            .reply(201, ContactFormFixture)
    }

    if (options.createContactForm === 'error') {
        mockedServer
            .onPost('/api/help-center/contact-forms')
            .reply(500, ContactFormGeneric500ErrorFixture)
    }

    return {
        fixtures: {
            ContactFormFixture,
            ContactFormListFixtures,
            ContactFormEmptyListFixture,
            ContactFormGeneric500ErrorFixture,
        },
    }
}
