import React from 'react'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from 'utils/testing'
import {RootState, StoreDispatch} from 'state/types'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getSingleCategoryEnglish} from 'pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'

import {CategoriesViews} from '../CategoriesView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const useHelpCenterApiMock = useHelpCenterApi as jest.Mock

const mockedListArticles = jest.fn().mockResolvedValue({
    data: {data: [], meta: {item_count: 0}},
})
const mockedListCategoryArticles = jest.fn().mockResolvedValue({
    data: {data: [], meta: {item_count: 0}},
})

useHelpCenterApiMock.mockImplementation(() => ({
    isReady: true,
    client: {
        listCategories: jest.fn().mockResolvedValue({
            data: {data: [], meta: {item_count: 0}},
        }),
        listArticles: mockedListArticles,
        listCategoryArticles: mockedListCategoryArticles,
        getUncategorizedArticlesPositions: jest.fn().mockResolvedValue({
            data: [],
        }),
        getCategoriesPositions: jest.fn().mockResolvedValue({
            data: [],
        }),
        getCategoryArticlesPositions: jest.fn().mockResolvedValue({
            data: [],
        }),
    },
}))

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<CategoriesViews />', () => {
    it('should show starter screen', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenter: {
                    helpCenters: {
                        helpCentersById: {
                            '1': getSingleHelpCenterResponseFixture,
                        },
                    },
                    articles: {
                        articlesById: {},
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

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <CategoriesViews
                    helpCenter={getSingleHelpCenterResponseFixture}
                    renderArticleList={() => <div />}
                    onCreateArticle={jest.fn()}
                    onCreateCategory={jest.fn()}
                />
            </Provider>
        )

        await screen.findByText('Start your Help Center here')

        expect(screen.queryByText('Uncategorized articles')).toBe(null)
    })

    it('should show uncategorized row', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenter: {
                    helpCenters: {
                        helpCentersById: {
                            '1': getSingleHelpCenterResponseFixture,
                        },
                    },
                    articles: {
                        articlesById: {},
                    },
                    categories: {
                        categoriesById: {
                            1: getSingleCategoryEnglish,
                        },
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

        mockedListArticles.mockResolvedValue({
            data: {
                data: [getSingleArticleEnglish],
                object: 'list',
                meta: {
                    page: 1,
                    per_page: 20,
                    current_page:
                        '/help-centers/1/articles?has_category=false&page=1&per_page=20',
                    item_count: 1,
                    nb_pages: 1,
                },
            },
        })

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesViews
                        helpCenter={getSingleHelpCenterResponseFixture}
                        renderArticleList={() => <div />}
                        onCreateArticle={jest.fn()}
                        onCreateCategory={jest.fn()}
                    />
                </DndProvider>
            </Provider>
        )

        await screen.findByText('Uncategorized articles')
    })

    it('should show uncategorized row and category row', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenter: {
                    helpCenters: {
                        helpCentersById: {
                            '1': getSingleHelpCenterResponseFixture,
                        },
                    },
                    articles: {
                        articlesById: {},
                    },
                    categories: {
                        categoriesById: {
                            1: getSingleCategoryEnglish,
                        },
                        positions: [1],
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

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesViews
                        helpCenter={getSingleHelpCenterResponseFixture}
                        renderArticleList={() => <div />}
                        onCreateArticle={jest.fn()}
                        onCreateCategory={jest.fn()}
                    />
                </DndProvider>
            </Provider>
        )

        await screen.findByText('Uncategorized articles')
        await screen.findByText('Orders')
    })
})
