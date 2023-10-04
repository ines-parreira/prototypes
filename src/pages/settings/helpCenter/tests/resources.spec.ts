import {
    PageEmbedmentFixture,
    PageEmbedmentsListFixture,
} from '../fixtures/pageEmbedment'
import {
    ShopifyPagesListFixture,
    ShopifyPagesGeneric500ErrorFixture,
} from '../fixtures/shopifyPage'
import {buildSDKMocks} from '../../../../rest_api/help_center_api/tests/buildSdkMocks'
import * as contactFormResourceMethods from '../resources'
import {mockResourceServerReplies} from './resource-mocks'

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
            .reply(500, ShopifyPagesGeneric500ErrorFixture)

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
