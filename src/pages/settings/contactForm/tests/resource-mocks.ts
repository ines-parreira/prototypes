import MockAdapter from 'axios-mock-adapter'
import {
    ContactFormListFixtures,
    ContactFormGeneric500ErrorFixture,
    ContactFormFixture,
    ContactFormEmptyListFixture,
} from '../fixtures/contacForm'
import * as contactFormResourceMethods from '../resources'
import {
    ShopifyPagesEmptyListFixture,
    ShopifyPagesGeneric500ErrorFixture,
    ShopifyPagesListFixture,
} from '../fixtures/shopifyPage'

export type MockOptions = 'success' | 'error' | 'success-empty'
export const mockResourceServerReplies = (
    mockedServer: MockAdapter,
    options: {
        [K in keyof typeof contactFormResourceMethods]?: MockOptions
    } = {
        getContactForms: 'success',
        createContactForm: 'success',
        getShopifyPages: 'success',
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

    if (options.getShopifyPages === 'success') {
        mockedServer
            .onGet('/api/help-center/contact-forms/1/pages')
            .reply(200, ShopifyPagesListFixture)
    }
    if (options.getShopifyPages === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/contact-forms/1/pages')
            .reply(200, ShopifyPagesEmptyListFixture)
    }

    if (options.getShopifyPages === 'error') {
        mockedServer
            .onGet(`/api/help-center/contact-forms/1/pages`)
            .reply(500, ShopifyPagesGeneric500ErrorFixture)
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
            ShopifyPagesListFixture,
            ShopifyPagesEmptyListFixture,
            ShopifyPagesGeneric500ErrorFixture,
        },
    }
}
