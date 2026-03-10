import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Article } from 'models/helpCenter/types'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { RootState, StoreDispatch } from 'state/types'

import type { SearchResultArticle } from '../types'
import { SearchResultsArticleRow } from './SearchResultsArticleRow'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
}))

jest.mock('hooks/helpCenter/useLimitations', () => ({
    useLimitations: () => ({}),
}))

const baseTranslation = {
    created_datetime: '2024-01-01T00:00:00.000Z',
    updated_datetime: '2024-01-01T00:00:00.000Z',
    deleted_datetime: null,
    title: 'Test Article',
    excerpt: '',
    content: '',
    slug: 'test-article',
    locale: 'en-US' as const,
    article_id: 1,
    category_id: 1,
    article_unlisted_id: 'abc123',
    seo_meta: { title: null, description: null },
    visibility_status: 'PUBLIC' as const,
    is_current: true,
    draft_version_id: null,
    published_version_id: 1,
    published_datetime: '2024-01-01T00:00:00.000Z',
    publisher_user_id: 1,
    commit_message: null,
    version: 1,
}

const createArticle = (
    overrides: Partial<Article['translation']> = {},
): Article =>
    ({
        id: 1,
        help_center_id: 1,
        created_datetime: '2024-01-01T00:00:00.000Z',
        updated_datetime: '2024-01-01T00:00:00.000Z',
        unlisted_id: 'art-unlisted-abc123',
        position: 0,
        available_locales: ['en-US'],
        category_id: 1,
        ingested_resource_id: null,
        template_key: null,
        translation: {
            ...baseTranslation,
            ...overrides,
        },
    }) as Article

const createSearchResultArticle = (article: Article): SearchResultArticle => ({
    type: 'article',
    id: article.id,
    article,
    algoliaHits: {
        'en-US': {
            objectID: `article-${article.id}`,
            id: article.id,
            type: 'article',
            locale: 'en-US',
            help_center_id: 1,
            title: 'Test Article',
            title_draft: 'Test Article',
            slug: 'test-article',
            slug_draft: 'test-article',
            preview: '',
            preview_draft: '',
            gorgias_domain: 'test.gorgias.com',
            custom_domain: '',
            customer_visibility: 'PUBLIC',
            parent_category_1: null,
            parent_category_2: null,
            parent_category_3: null,
            parent_category_4: null,
            article_content: '',
            article_content_draft: '',
            _tags: ['current'] as const,
            _highlightResult: {},
        } as SearchResultArticle['algoliaHits']['en-US'],
    },
})

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: { helpCentersById: {} },
            articles: { articlesById: {} },
            categories: { categoriesById: {} },
        },
    } as RootState['entities'],
    ui: {
        helpCenter: { currentId: 1, currentLanguage: 'en-US' },
    } as RootState['ui'],
}

const renderComponent = (searchResultArticle: SearchResultArticle) => {
    const store = mockStore(defaultState)

    return render(
        <Provider store={store}>
            <table>
                <tbody>
                    <SearchResultsArticleRow
                        article={searchResultArticle}
                        level={1}
                        onArticleClick={jest.fn()}
                        onArticleClickSettings={jest.fn()}
                    />
                </tbody>
            </table>
        </Provider>,
    )
}

describe('SearchResultsArticleRow', () => {
    describe('visibility status', () => {
        it('should display "Public" when customer_visibility is PUBLIC', () => {
            const article = createArticle({ customer_visibility: 'PUBLIC' })
            renderComponent(createSearchResultArticle(article))

            expect(screen.getByText('Public')).toBeInTheDocument()
        })

        it('should display "Unlisted" when customer_visibility is UNLISTED', () => {
            const article = createArticle({ customer_visibility: 'UNLISTED' })
            renderComponent(createSearchResultArticle(article))

            expect(screen.getByText('Unlisted')).toBeInTheDocument()
        })

        it('should default to "Public" when customer_visibility is undefined', () => {
            const article = createArticle({
                customer_visibility: undefined,
            })
            renderComponent(createSearchResultArticle(article))

            expect(screen.getByText('Public')).toBeInTheDocument()
        })
    })

    describe('draft status', () => {
        it('should display "Draft" when article is not published', () => {
            const article = createArticle({ is_current: false })
            renderComponent(createSearchResultArticle(article))

            expect(screen.getByText('Draft')).toBeInTheDocument()
        })

        it('should not display "Draft" when article is published', () => {
            const article = createArticle({ is_current: true })
            renderComponent(createSearchResultArticle(article))

            expect(screen.queryByText('Draft')).not.toBeInTheDocument()
        })
    })
})
