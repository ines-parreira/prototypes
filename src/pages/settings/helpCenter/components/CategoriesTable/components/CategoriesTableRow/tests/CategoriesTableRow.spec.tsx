import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from '../../../../../../../../state/types'
import {getSingleHelpCenterResponseFixture} from '../../../../../fixtures/getHelpCentersResponse.fixture'
import {getSingleArticleEnglish} from '../../../../../fixtures/getArticlesResponse.fixture'
import {getSingleCategoryEnglish} from '../../../../../fixtures/getCategoriesResponse.fixtures'

import {CategoriesTableRow} from '../CategoriesTableRow'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../../../../hooks/useHelpCenterIdParam', () => {
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

jest.mock('../../../../../hooks/useHelpCenterApi', () => {
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

describe('<CategoriesTableRow />', () => {
    it('should render null if shouldRenderRowWithoutArticles is false and there are no articles', () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenters: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            } as any,
            helpCenter: {
                articles: {
                    articlesById: {},
                },
                categories: {
                    categoriesById: {},
                },
                ui: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        const {container} = render(
            <Provider store={mockStore(initialState)}>
                <CategoriesTableRow
                    categoryId={null}
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render "Uncategorized articles" row when shouldRenderRowWithoutArticles is false but there are some uncategorized articles', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenters: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            } as any,
            helpCenter: {
                articles: {
                    articlesById: {},
                },
                categories: {
                    categoriesById: {},
                },
                ui: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
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
            <Provider store={mockStore(initialState)}>
                <CategoriesTableRow
                    categoryId={null}
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                />
            </Provider>
        )

        await findByText('Uncategorized articles')

        expect(container).toMatchSnapshot()
    })

    it('should render category row loading then idle', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenters: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            } as any,
            helpCenter: {
                articles: {
                    articlesById: {},
                },
                categories: {
                    categoriesById: {
                        '1': getSingleCategoryEnglish,
                    },
                },
                ui: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        const {container, findByText} = render(
            <Provider store={mockStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesTableRow
                        categoryId={getSingleCategoryEnglish.id}
                        category={getSingleCategoryEnglish}
                        position={0}
                        renderArticleList={() => <div />}
                        title={getSingleCategoryEnglish.translation.title}
                    />
                </DndProvider>
            </Provider>
        )

        expect(container).toMatchSnapshot('Loading state')

        await findByText(getSingleCategoryEnglish.translation.title)

        expect(container).toMatchSnapshot('Idle state')
    })
})
