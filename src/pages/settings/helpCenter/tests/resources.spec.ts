import {
    PageEmbedmentFixture,
    PageEmbedmentsListFixture,
} from '../fixtures/pageEmbedment'
import {
    ShopifyPagesListFixture,
    ShopifyPagesGeneric500ErrorFixture,
} from '../fixtures/shopifyPage'
import {
    ArticleTemplatesListFixture,
    ArticleTemplatesGeneric500ErrorFixture,
} from '../fixtures/articleTemplate.fixture'
import {buildSDKMocks} from '../../../../rest_api/help_center_api/tests/buildSdkMocks'
import * as helpCenterResourceMethods from '../resources'
import {
    AIArticlesGeneric500ErrorFixture,
    AIArticlesListFixture,
} from '../fixtures/aiArticles.fixture'
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

        const data = await helpCenterResourceMethods.getShopifyPages(
            sdkMocks.client,
            {help_center_id: 1}
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
            helpCenterResourceMethods.getShopifyPages(sdkMocks.client, {
                help_center_id: 1,
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

        const data = await helpCenterResourceMethods.getPageEmbedments(
            sdkMocks.client,
            {help_center_id: 1}
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
            helpCenterResourceMethods.getPageEmbedments(sdkMocks.client, {
                help_center_id: 1,
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

        const data = await helpCenterResourceMethods.createPageEmbedment(
            sdkMocks.client,
            {help_center_id: 1},
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
            helpCenterResourceMethods.createPageEmbedment(
                sdkMocks.client,
                {help_center_id: 1},
                payload
            )
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})

describe('getArticleTemplates', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const locale = 'en-US'

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with a list of article templates on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplates: 'success',
        })

        const data = await helpCenterResourceMethods.getArticleTemplates(
            sdkMocks.client,
            {locale}
        )
        expect(data).toEqual(ArticleTemplatesListFixture)
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplates: 'error',
        })

        sdkMocks.mockedServer
            .onGet(`/api/help-center/article-templates?locale=en-US`)
            .reply(500, ArticleTemplatesGeneric500ErrorFixture)

        await expect(
            helpCenterResourceMethods.getArticleTemplates(sdkMocks.client, {
                locale,
            })
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})

describe('getArticleTemplate', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>
    const locale = 'en-US'
    const templateKey = 'shippingPolicy'

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with an article template on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplate: 'success',
        })

        const data = await helpCenterResourceMethods.getArticleTemplate(
            sdkMocks.client,
            {template_key: templateKey},
            {locale}
        )
        expect(data).toEqual(ArticleTemplatesListFixture[0])
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplate: 'error',
        })

        sdkMocks.mockedServer
            .onGet(`/api/help-center/article-templates/shippingPolicy`)
            .reply(500, ArticleTemplatesGeneric500ErrorFixture)

        await expect(
            helpCenterResourceMethods.getArticleTemplate(
                sdkMocks.client,
                {template_key: templateKey},
                {locale}
            )
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 500]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})

describe('getAIArticles', () => {
    let sdkMocks: Awaited<ReturnType<typeof buildSDKMocks>>

    beforeEach(async () => {
        sdkMocks = await buildSDKMocks()
    })

    it('resolves with a list of AI articles on success', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getAIGeneratedArticles: 'success',
        })

        const data = await helpCenterResourceMethods.getAIGeneratedArticles(
            sdkMocks.client
        )
        expect(data).toEqual(AIArticlesListFixture)
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })

    it('rejects if the server returns an error', async () => {
        mockResourceServerReplies(sdkMocks.mockedServer, {
            getArticleTemplates: 'error',
        })

        sdkMocks.mockedServer
            .onGet(`/api/help-center/ai-articles`)
            .reply(500, AIArticlesGeneric500ErrorFixture)

        await expect(
            helpCenterResourceMethods.getAIGeneratedArticles(sdkMocks.client)
        ).rejects.toMatchInlineSnapshot(
            `[Error: Request failed with status code 404]`
        )
        expect(sdkMocks.mockedServer.history).toMatchSnapshot()
    })
})
