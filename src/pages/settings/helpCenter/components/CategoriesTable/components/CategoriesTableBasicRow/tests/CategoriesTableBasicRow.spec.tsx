import React from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider as ReduxProvider} from 'react-redux'
import {DeepPartial} from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'

import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {CategoriesTableBasicRow} from '../../CategoriesTableBasicRow/CategoriesTableBasicRow'

const mockStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

const mockedListArticles = jest.fn().mockResolvedValue({
    data: {data: [], meta: {item_count: 0}},
})
const mockedListCategoryArticles = jest.fn().mockResolvedValue({
    data: {data: [], meta: {item_count: 0}},
})
const mockGetCategoryArticlesPositions = jest.fn().mockResolvedValue({
    data: [],
})
const mockGetUncategorizedArticlesPositions = jest.fn().mockResolvedValue({
    data: [],
})

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                listArticles: mockedListArticles,
                listCategoryArticles: mockedListCategoryArticles,
                getCategoryArticlesPositions: mockGetCategoryArticlesPositions,
                getUncategorizedArticlesPositions:
                    mockGetUncategorizedArticlesPositions,
            },
        }),
    }
})

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

const initialState: DeepPartial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            articles: {
                articlesById: {
                    '18': getSingleArticleEnglish,
                },
            },
            categories: {
                categoriesById: {},
            },
        },
    } as any,
    ui: {
        helpCenter: {
            currentId: 1,
            currentLanguage: 'en-US',
        },
    } as any,
}

describe('<CategoriesTableRow />', () => {
    it("should show the 'Load more' button when the meta.item_count is greater than the number of loaded articles", async () => {
        mockedListArticles.mockResolvedValue({
            data: {
                data: [getSingleArticleEnglish],
                object: 'list',
                meta: {
                    page: 1,
                    per_page: 1,
                    current_page:
                        '/help-centers/1/articles?has_category=false&page=1&per_page=20',
                    item_count: 10,
                    nb_pages: 1,
                },
            },
        })

        const {findByText, getByTestId} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <CategoriesTableBasicRow
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                />
            </ReduxProvider>
        )

        await findByText('Uncategorized articles')

        // expand the category, to get the articles table
        const caret = getByTestId('openCaret')
        fireEvent.click(caret)

        await findByText('Load more')
    })

    it("shouldn't show the 'Load more' button when the loaded articles count is equal to the meta.item_count", async () => {
        mockedListArticles.mockResolvedValue({
            data: {
                data: [getSingleArticleEnglish],
                object: 'list',
                meta: {
                    page: 1,
                    per_page: 1,
                    current_page:
                        '/help-centers/1/articles?has_category=false&page=1&per_page=20',
                    item_count: 1,
                    nb_pages: 1,
                },
            },
        })

        const {findByText, getByTestId, queryByText} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <CategoriesTableBasicRow
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                />
            </ReduxProvider>
        )

        await findByText('Uncategorized articles')

        // expand the category, to get the articles table
        const caret = getByTestId('openCaret')
        fireEvent.click(caret)

        expect(queryByText('Load more')).toBeNull()
    })
})
