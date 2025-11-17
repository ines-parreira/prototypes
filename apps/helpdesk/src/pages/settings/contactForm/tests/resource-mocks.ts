import type MockAdapter from 'axios-mock-adapter'

import {
    ContactFormEmptyListFixture,
    ContactFormFixture,
    ContactFormGeneric500ErrorFixture,
    ContactFormListFixtures,
} from '../fixtures/contacForm'
import {
    PageEmbedmentFixture,
    PageEmbedmentsEmptyListFixture,
    PageEmbedmentsGeneric500ErrorFixture,
    PageEmbedmentsListFixture,
} from '../fixtures/pageEmbedment'
import {
    ShopifyPagesEmptyListFixture,
    ShopifyPagesGeneric500ErrorFixture,
    ShopifyPagesListFixture,
} from '../fixtures/shopifyPage'
import type * as contactFormResourceMethods from '../resources'

export type MockOptions = 'success' | 'error' | 'success-empty'
export const mockResourceServerReplies = (
    mockedServer: MockAdapter,
    options: {
        [K in keyof typeof contactFormResourceMethods]?: MockOptions
    } = {
        getContactForms: 'success',
        createContactForm: 'success',
        getShopifyPages: 'success',
    },
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
            .onGet('/api/help-center/contact-forms/1/shopify-pages')
            .reply(200, ShopifyPagesListFixture)
    }
    if (options.getShopifyPages === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/contact-forms/1/shopify-pages')
            .reply(200, ShopifyPagesEmptyListFixture)
    }

    if (options.getShopifyPages === 'error') {
        mockedServer
            .onGet(`/api/help-center/contact-forms/1/shopify-pages`)
            .reply(500, ShopifyPagesGeneric500ErrorFixture)
    }

    if (options.getPageEmbedments === 'success') {
        mockedServer
            .onGet('/api/help-center/contact-forms/1/shopify-page-embedments')
            .reply(200, PageEmbedmentsListFixture)
    }
    if (options.getPageEmbedments === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/contact-forms/1/shopify-page-embedments')
            .reply(200, PageEmbedmentsEmptyListFixture)
    }

    if (options.getPageEmbedments === 'error') {
        mockedServer
            .onGet(`/api/help-center/contact-forms/1/shopify-page-embedments`)
            .reply(500, PageEmbedmentsGeneric500ErrorFixture)
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

    if (options.createPageEmbedment === 'success') {
        mockedServer
            .onPost('/api/help-center/contact-forms/1/shopify-page-embedments')
            .reply(201, PageEmbedmentFixture)
    }

    if (options.createPageEmbedment === 'error') {
        mockedServer
            .onPost('/api/help-center/contact-forms/1/shopify-page-embedments')
            .reply(500, PageEmbedmentsGeneric500ErrorFixture)
    }

    if (options.updatePageEmbedment === 'success') {
        mockedServer
            .onPut('/api/help-center/contact-forms/1/shopify-page-embedments/1')
            .reply(200, PageEmbedmentFixture)
    }

    if (options.updatePageEmbedment === 'error') {
        mockedServer
            .onPut('/api/help-center/contact-forms/1/shopify-page-embedments/1')
            .reply(500, PageEmbedmentsGeneric500ErrorFixture)
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
            PageEmbedmentFixture,
            PageEmbedmentsListFixture,
            PageEmbedmentsEmptyListFixture,
            PageEmbedmentsGeneric500ErrorFixture,
        },
    }
}
