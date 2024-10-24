import {buildSDKMocks} from '../../../../rest_api/help_center_api/tests/buildSdkMocks'
import {
    ContactFormFixture,
    ContactFormGeneric500ErrorFixture,
    ContactFormListFixtures,
} from '../fixtures/contacForm'
import {
    PageEmbedmentFixture,
    PageEmbedmentsListFixture,
} from '../fixtures/pageEmbedment'
import {
    ShopifyPagesListFixture,
    ShopifyPagesGeneric500ErrorFixture,
} from '../fixtures/shopifyPage'
import * as contactFormResourceMethods from '../resources'
import {mockResourceServerReplies} from './resource-mocks'

describe('getContactForms', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with a list of contact forms on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getContactForms: 'success',
        })

        const data = await contactFormResourceMethods.getContactForms(
            sdkMocks.client
        )
        expect(data).toEqual(ContactFormListFixtures)
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getContactForms: 'error',
        })
        sdkMocks.mockedServer
            .onGet(`/api/help-center/contact-forms`)
            .reply(500, ContactFormGeneric500ErrorFixture)

        await expect(
            contactFormResourceMethods.getContactForms(sdkMocks.client)
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})

describe('getShopifyPages', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with a list of shopify pages on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getShopifyPages: 'success',
        })

        const data = await contactFormResourceMethods.getShopifyPages(
            sdkMocks.client,
            {contact_form_id: 1}
        )
        expect(data).toEqual(ShopifyPagesListFixture)
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getShopifyPages: 'error',
        })

        sdkMocks.mockedServer
            .onGet(`/api/help-center/contact-forms/1/shopify-pages`)
            .reply(500, ShopifyPagesGeneric500ErrorFixture)

        await expect(
            contactFormResourceMethods.getShopifyPages(sdkMocks.client, {
                contact_form_id: 1,
            })
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})

describe('getPageEmbedments', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with a list of page embedments on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getPageEmbedments: 'success',
        })

        const data = await contactFormResourceMethods.getPageEmbedments(
            sdkMocks.client,
            {contact_form_id: 1}
        )
        expect(data).toEqual(PageEmbedmentsListFixture)
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getPageEmbedments: 'error',
        })

        sdkMocks.mockedServer
            .onGet(`/api/help-center/contact-forms/1/shopify-pages`)
            .reply(500, ShopifyPagesGeneric500ErrorFixture)

        await expect(
            contactFormResourceMethods.getPageEmbedments(sdkMocks.client, {
                contact_form_id: 1,
            })
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})

describe('createContactForm', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const payload = {
        name: 'test',
        default_locale: 'en-US',
        email_integration: {
            email: 'a@a.com',
            id: 1,
        },
    } as const

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with a created contact form on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            createContactForm: 'success',
        })
        sdkMocks.mockedServer
            .onPost('/api/help-center/contact-forms')
            .reply(201, ContactFormFixture)

        const data = await contactFormResourceMethods.createContactForm(
            sdkMocks.client,
            payload
        )
        expect(data).toEqual(ContactFormFixture)
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            createContactForm: 'error',
        })

        sdkMocks.mockedServer
            .onPost('/api/help-center/contact-forms')
            .reply(500, ContactFormGeneric500ErrorFixture)

        await expect(
            contactFormResourceMethods.createContactForm(
                sdkMocks.client,
                payload
            )
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})

describe('createPageEmbedment', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const payload = {
        page_external_id: '123456789',
        position: 'TOP',
    } as const

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with a created page embedment on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            createPageEmbedment: 'success',
        })
        sdkMocks.mockedServer
            .onPost('/api/help-center/contact-forms/1/shopify-page-embedments')
            .reply(201, PageEmbedmentFixture)

        const data = await contactFormResourceMethods.createPageEmbedment(
            sdkMocks.client,
            {contact_form_id: 1},
            payload
        )
        expect(data).toEqual(PageEmbedmentFixture)
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            createPageEmbedment: 'error',
        })

        sdkMocks.mockedServer
            .onPost('/api/help-center/contact-forms/1/shopify-page-embedments')
            .reply(500, ContactFormGeneric500ErrorFixture)

        await expect(
            contactFormResourceMethods.createPageEmbedment(
                sdkMocks.client,
                {contact_form_id: 1},
                payload
            )
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})
