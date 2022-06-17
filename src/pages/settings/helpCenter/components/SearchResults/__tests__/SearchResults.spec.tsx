import React from 'react'
import {render, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {RootState, StoreDispatch} from 'state/types'

import {getSingleHelpCenterResponseFixture as helpCenter} from '../../../fixtures/getHelpCentersResponse.fixture'
import {useHelpCenterIdParam} from '../../../hooks/useHelpCenterIdParam'

import {SearchResults} from '../SearchResults'

import {searchResultsResponseFixture} from '../SearchResults.response.fixture'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam')
;(useHelpCenterIdParam as jest.Mock).mockReturnValue(helpCenter.id)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

const mockFetchArticlesByIds = jest.fn().mockResolvedValue(null)

jest.mock('../../../hooks/useArticlesActions', () => {
    return {
        useArticlesActions: () => ({
            fetchArticlesByIds: mockFetchArticlesByIds,
        }),
    }
})

const mockFetchCategories = jest.fn().mockResolvedValue(null)

jest.mock('../../../hooks/useCategoriesActions', () => {
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
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('displays article and category search results', async () => {
        const {container} = render(
            <Provider store={store}>
                <SearchResults
                    helpCenter={helpCenter}
                    results={searchResultsResponseFixture}
                    onArticleClick={jest.fn()}
                    onArticleClickSettings={jest.fn()}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()

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
