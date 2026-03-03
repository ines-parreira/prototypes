import React from 'react'

import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { NonRootCategory } from 'models/helpCenter/types'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import type { RootState, StoreDispatch } from 'state/types'

import type { SearchResultCategory } from '../types'
import { SearchResultsCategoryRow } from './SearchResultsCategoryRow'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
}))

const baseTranslation = {
    created_datetime: '2024-01-01T00:00:00.000Z',
    updated_datetime: '2024-01-01T00:00:00.000Z',
    deleted_datetime: null,
    category_id: 10,
    category_unlisted_id: 'cat-abc123',
    parent_category_id: null,
    locale: 'en-US' as const,
    seo_meta: { title: null, description: null },
    visibility_status: 'PUBLIC' as const,
    image_url: null,
    description: '',
    slug: 'test-category',
    title: 'Test Category',
}

const createCategory = (
    overrides: Partial<NonRootCategory['translation']> = {},
): NonRootCategory =>
    ({
        id: 10,
        help_center_id: 1,
        created_datetime: '2024-01-01T00:00:00.000Z',
        updated_datetime: '2024-01-01T00:00:00.000Z',
        unlisted_id: 'cat-unlisted-abc123',
        available_locales: ['en-US'],
        children: [],
        articles: [],
        articleCount: 0,
        translation: {
            ...baseTranslation,
            ...overrides,
        },
    }) as NonRootCategory

const createSearchResultCategory = (
    category: NonRootCategory,
): SearchResultCategory => ({
    type: 'category',
    id: category.id,
    category,
    algoliaHits: {
        'en-US': {
            objectID: `category-${category.id}`,
            id: category.id,
            type: 'category',
            locale: 'en-US',
            help_center_id: 1,
            title: 'Test Category',
            title_draft: 'Test Category',
            slug: 'test-category',
            slug_draft: 'test-category',
            preview: '',
            preview_draft: '',
            gorgias_domain: 'test.gorgias.com',
            custom_domain: '',
            visibility_status: 'PUBLIC',
            parent_category_1: null,
            parent_category_2: null,
            parent_category_3: null,
            _tags: ['current'] as const,
            _highlightResult: {},
        } as SearchResultCategory['algoliaHits']['en-US'],
    },
    children: [],
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

const renderComponent = (searchResultCategory: SearchResultCategory) => {
    const store = mockStore(defaultState)

    return render(
        <Provider store={store}>
            <table>
                <tbody>
                    <SearchResultsCategoryRow
                        category={searchResultCategory}
                        level={1}
                        onArticleClick={jest.fn()}
                        onArticleClickSettings={jest.fn()}
                        viewLanguage="en-US"
                    />
                </tbody>
            </table>
        </Provider>,
    )
}

describe('SearchResultsCategoryRow', () => {
    describe('visibility status', () => {
        it('should display "Public" when customer_visibility is PUBLIC', () => {
            const category = createCategory({
                customer_visibility: 'PUBLIC',
            })
            renderComponent(createSearchResultCategory(category))

            expect(screen.getByText('Public')).toBeInTheDocument()
        })

        it('should display "Unlisted" when customer_visibility is UNLISTED', () => {
            const category = createCategory({
                customer_visibility: 'UNLISTED',
            })
            renderComponent(createSearchResultCategory(category))

            expect(screen.getByText('Unlisted')).toBeInTheDocument()
        })

        it('should default to "Public" when customer_visibility is undefined', () => {
            const category = createCategory({
                customer_visibility: undefined,
            })
            renderComponent(createSearchResultCategory(category))

            expect(screen.getByText('Public')).toBeInTheDocument()
        })
    })
})
