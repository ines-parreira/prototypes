import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {getSingleHelpCenterResponseFixture as helpCenter} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useHelpCenterIdParam} from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {RootState, StoreDispatch} from 'state/types'

import {searchResultsResponseFixture as results} from '../SearchResults.response.fixture'
import {SearchResults} from '../SearchResults'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam')
;(useHelpCenterIdParam as jest.Mock).mockReturnValue(helpCenter.id)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useAbilityChecker: () => ({isPassingRulesCheck: () => true}),
}))

const mockFetchArticlesByIds = jest.fn().mockResolvedValue(null)

jest.mock('pages/settings/helpCenter/hooks/useArticlesActions', () => {
    return {
        useArticlesActions: () => ({
            fetchArticlesByIds: mockFetchArticlesByIds,
        }),
    }
})

const mockFetchCategories = jest.fn().mockResolvedValue(null)

jest.mock('pages/settings/helpCenter/hooks/useCategoriesActions', () => {
    return {
        useCategoriesActions: () => ({
            fetchCategories: mockFetchCategories,
        }),
    }
})

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': helpCenter,
                },
            },
            articles: {articlesById: {}},
            categories: {
                categoriesById: {
                    '0': {
                        created_datetime: '2022-03-07T14:46:47.212Z',
                        updated_datetime: '2022-03-07T14:46:47.212Z',
                        deleted_datetime: null,
                        id: 0,
                        help_center_id: 1,
                        available_locales: [],
                        translation: null,
                        children: [1],
                        articles: [],
                    },
                    '28': {
                        created_datetime: '2022-03-07T14:46:47.212Z',
                        updated_datetime: '2022-03-07T14:46:47.212Z',
                        deleted_datetime: null,
                        id: 28,
                        help_center_id: 1,
                        available_locales: ['en-US'],
                        translation: {
                            created_datetime: '2022-03-07T14:47:03.686Z',
                            updated_datetime: '2022-03-07T14:47:03.686Z',
                            deleted_datetime: null,
                            parent_category_id: null,
                            description: '',
                            slug: 'cat-1-mod',
                            title: 'Cat 1 mod',
                            category_id: 28,
                            locale: 'en-US',
                            seo_meta: {
                                title: null,
                                description: null,
                            },
                        },
                        children: [],
                        articles: [],
                    },
                },
            },
        },
    } as any,
    ui: {helpCenter: {currentId: 1, currentLanguage: 'en-US'}} as any,
}

const store = mockStore(defaultState)

describe('SearchResults', () => {
    it('displays article and category search results', async () => {
        const {container} = render(
            <Provider store={store}>
                <SearchResults
                    helpCenter={helpCenter}
                    results={results}
                    onArticleClick={jest.fn()}
                    onArticleClickSettings={jest.fn()}
                />
            </Provider>
        )

        expect(
            screen.getByText(results[0].parent_category_1!.title)
        ).toBeInTheDocument()
        expect(screen.getAllByLabelText('open article')).toHaveLength(
            results.filter((result) => result.type === 'article').length
        )
        const levels: Record<string, number> = {}

        // for each mocked item, get their level of nesting
        for (let i = 0; i < results.length; i++) {
            const depth = Object.entries(results[i]).filter(
                ([key, value]) => key.startsWith('parent_category_') && !!value
            ).length
            levels[depth] = (levels[depth] ?? 0) + 1
        }

        for (let i = 1; i <= Object.keys(levels).length; i++) {
            expect(
                container.querySelectorAll(`.nesting-level-${i}`)
            ).toHaveLength(levels[i])
        }

        await waitFor(() => {
            expect(mockFetchArticlesByIds).toHaveBeenCalledTimes(1)
            expect(mockFetchArticlesByIds).toHaveBeenNthCalledWith(
                1,
                [34, 32, 31, 29]
            )

            expect(mockFetchCategories).toHaveBeenCalledTimes(8)
        })
    })
})
