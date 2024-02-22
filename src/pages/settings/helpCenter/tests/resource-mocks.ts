import MockAdapter from 'axios-mock-adapter'

import {
    ShopifyPagesEmptyListFixture,
    ShopifyPagesGeneric500ErrorFixture,
    ShopifyPagesListFixture,
} from '../fixtures/shopifyPage'
import {
    PageEmbedmentsListFixture,
    PageEmbedmentsEmptyListFixture,
    PageEmbedmentsGeneric500ErrorFixture,
    PageEmbedmentFixture,
} from '../fixtures/pageEmbedment'
import {
    ArticleTemplatesListFixture,
    ArticleTemplatesEmptyListFixture,
    ArticleTemplatesGeneric500ErrorFixture,
} from '../fixtures/articleTemplate.fixture'
import {
    AIArticlesListFixture,
    AIArticlesEmptyListFixture,
    AIArticlesGeneric500ErrorFixture,
} from '../fixtures/aiArticles.fixture'

import * as helpCenterResourceMethods from '../resources'

export type MockOptions = 'success' | 'error' | 'success-empty'
export const mockResourceServerReplies = (
    mockedServer: MockAdapter,
    options: {
        [K in keyof typeof helpCenterResourceMethods]?: MockOptions
    } = {
        getShopifyPages: 'success',
    }
) => {
    if (options.getShopifyPages === 'success') {
        mockedServer
            .onGet('/api/help-center/help-centers/1/shopify-pages')
            .reply(200, ShopifyPagesListFixture)
    }
    if (options.getShopifyPages === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/help-centers/1/shopify-pages')
            .reply(200, ShopifyPagesEmptyListFixture)
    }

    if (options.getShopifyPages === 'error') {
        mockedServer
            .onGet(`/api/help-center/help-centers/1/shopify-pages`)
            .reply(500, ShopifyPagesGeneric500ErrorFixture)
    }

    if (options.getPageEmbedments === 'success') {
        mockedServer
            .onGet('/api/help-center/help-centers/1/shopify-page-embedments')
            .reply(200, PageEmbedmentsListFixture)
    }
    if (options.getPageEmbedments === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/help-centers/1/shopify-page-embedments')
            .reply(200, PageEmbedmentsEmptyListFixture)
    }

    if (options.getPageEmbedments === 'error') {
        mockedServer
            .onGet(`/api/help-center/help-centers/1/shopify-page-embedments`)
            .reply(500, PageEmbedmentsGeneric500ErrorFixture)
    }

    if (options.createPageEmbedment === 'success') {
        mockedServer
            .onPost('/api/help-center/help-centers/1/shopify-page-embedments')
            .reply(201, PageEmbedmentFixture)
    }

    if (options.createPageEmbedment === 'error') {
        mockedServer
            .onPost('/api/help-center/help-centers/1/shopify-page-embedments')
            .reply(500, PageEmbedmentsGeneric500ErrorFixture)
    }

    if (options.updatePageEmbedment === 'success') {
        mockedServer
            .onPut('/api/help-center/help-centers/1/shopify-page-embedments/1')
            .reply(200, PageEmbedmentFixture)
    }

    if (options.updatePageEmbedment === 'error') {
        mockedServer
            .onPut('/api/help-center/help-centers/1/shopify-page-embedments/1')
            .reply(500, PageEmbedmentsGeneric500ErrorFixture)
    }

    if (options.getArticleTemplates === 'success') {
        mockedServer
            .onGet('/api/help-center/article-templates')
            .reply(200, ArticleTemplatesListFixture)
    }
    if (options.getArticleTemplates === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/article-templates')
            .reply(200, ArticleTemplatesEmptyListFixture)
    }

    if (options.getArticleTemplates === 'error') {
        mockedServer
            .onGet(`/api/help-center/article-templates`)
            .reply(500, ArticleTemplatesGeneric500ErrorFixture)
    }

    if (options.getArticleTemplate === 'success') {
        mockedServer
            .onGet('/api/help-center/article-templates/shippingPolicy')
            .reply(200, ArticleTemplatesListFixture[0])
    }

    if (options.getArticleTemplate === 'error') {
        mockedServer
            .onGet(`/api/help-center/article-templates/shippingPolicy`)
            .reply(500, ArticleTemplatesGeneric500ErrorFixture)
    }

    if (options.getAIGeneratedArticles === 'success') {
        mockedServer
            .onGet('/api/help-center/help-centers/1/article-templates/ai')
            .reply(200, AIArticlesListFixture)
    }
    if (options.getAIGeneratedArticles === 'success-empty') {
        mockedServer
            .onGet('/api/help-center/help-centers/1/article-templates/ai')
            .reply(200, AIArticlesEmptyListFixture)
    }

    if (options.getAIGeneratedArticles === 'error') {
        mockedServer
            .onGet(`/api/help-center/article-templates`)
            .reply(500, AIArticlesGeneric500ErrorFixture)
    }

    return {
        fixtures: {
            ShopifyPagesListFixture,
            ShopifyPagesEmptyListFixture,
            ShopifyPagesGeneric500ErrorFixture,
            PageEmbedmentFixture,
            PageEmbedmentsListFixture,
            PageEmbedmentsEmptyListFixture,
            PageEmbedmentsGeneric500ErrorFixture,
            ArticleTemplatesListFixture,
            ArticleTemplatesEmptyListFixture,
            ArticleTemplatesGeneric500ErrorFixture,
            AIArticlesListFixture,
            AIArticlesEmptyListFixture,
            AIArticlesGeneric500ErrorFixture,
        },
    }
}
