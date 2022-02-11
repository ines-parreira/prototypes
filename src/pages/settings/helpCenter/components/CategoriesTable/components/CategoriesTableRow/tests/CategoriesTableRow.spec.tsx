import React from 'react'
import {render} from '@testing-library/react'
import {Provider as ReduxProvider} from 'react-redux'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getSingleCategoryEnglish} from 'pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'

import {CategoriesTableRow} from '../CategoriesTableRow'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

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

describe('<CategoriesTableRow />', () => {
    it('should render null if shouldRenderRowWithoutArticles is false and there are no articles', () => {
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

        const {container} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <CategoriesTableRow
                    categoryId={null}
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                />
            </ReduxProvider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render "Uncategorized articles" row when shouldRenderRowWithoutArticles is false but there are some uncategorized articles', async () => {
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

        const {container, findByText} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <CategoriesTableRow
                    categoryId={null}
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                />
            </ReduxProvider>
        )

        await findByText('Uncategorized articles')

        expect(container).toMatchSnapshot()
    })

    it('should render category row loading then idle', async () => {
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
                            '1': getSingleCategoryEnglish,
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

        const {container, findByText} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesTableRow
                        categoryId={getSingleCategoryEnglish.id}
                        category={getSingleCategoryEnglish}
                        position={0}
                        renderArticleList={() => <div />}
                        title={getSingleCategoryEnglish.translation.title}
                    />
                </DndProvider>
            </ReduxProvider>
        )

        expect(container).toMatchSnapshot('Loading state')

        await findByText(getSingleCategoryEnglish.translation.title)

        expect(container).toMatchSnapshot('Idle state')
    })
})
