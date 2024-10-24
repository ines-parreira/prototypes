import {screen} from '@testing-library/react'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getSingleCategoryEnglish} from 'pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'
import {getInitialRootCategory} from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import {useHelpCenterApi} from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import {SearchContextProvider} from 'pages/settings/helpCenter/providers/SearchContext'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'

import {CategoriesViews} from '../CategoriesView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: jest.fn(),
    useAbilityChecker: () => ({isPassingRulesCheck: () => true}),
}))

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
        getCategoryTree: jest
            .fn()
            .mockResolvedValue({data: getInitialRootCategory}),
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

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
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
                        categoriesById: {
                            '0': getInitialRootCategory,
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

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <SearchContextProvider
                    helpCenter={getSingleHelpCenterResponseFixture}
                >
                    <CategoriesViews
                        helpCenter={getSingleHelpCenterResponseFixture}
                        renderArticleList={() => <div />}
                        onCreateArticle={jest.fn()}
                        onCreateCategory={jest.fn()}
                        onCreateArticleWithTemplate={jest.fn()}
                        onShowTemplates={jest.fn()}
                    />
                </SearchContextProvider>
            </Provider>
        )

        await screen.findByText('Start your help center here')

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
                            '0': {...getInitialRootCategory, articleCount: 1},
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
                <SearchContextProvider
                    helpCenter={getSingleHelpCenterResponseFixture}
                >
                    <DndProvider backend={HTML5Backend}>
                        <CategoriesViews
                            helpCenter={getSingleHelpCenterResponseFixture}
                            renderArticleList={() => <div />}
                            onCreateArticle={jest.fn()}
                            onCreateCategory={jest.fn()}
                            onCreateArticleWithTemplate={jest.fn()}
                            onShowTemplates={jest.fn()}
                        />
                    </DndProvider>
                </SearchContextProvider>
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
                            '0': {
                                ...getInitialRootCategory,
                                children: [1],
                            },
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

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <SearchContextProvider
                    helpCenter={getSingleHelpCenterResponseFixture}
                >
                    <DndProvider backend={HTML5Backend}>
                        <CategoriesViews
                            helpCenter={getSingleHelpCenterResponseFixture}
                            renderArticleList={() => <div />}
                            onCreateArticle={jest.fn()}
                            onCreateCategory={jest.fn()}
                            onCreateArticleWithTemplate={jest.fn()}
                            onShowTemplates={jest.fn()}
                        />
                    </DndProvider>
                </SearchContextProvider>
            </Provider>
        )

        await screen.findByText('Uncategorized articles')
        await screen.findByText('Orders')
    })
})
