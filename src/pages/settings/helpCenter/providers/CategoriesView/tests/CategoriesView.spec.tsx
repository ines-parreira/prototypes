import React from 'react'
import {screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'

import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {renderWithRouter} from '../../../../../../utils/testing'
import {RootState, StoreDispatch} from '../../../../../../state/types'
import {getSingleHelpCenterResponseFixture as helpCenterMock} from '../../../fixtures/getHelpCentersResponse.fixture'
import {getSingleArticleEnglish as articleMock} from '../../../fixtures/getArticlesResponse.fixture'
import {getSingleCategoryEnglish as categoryMock} from '../../../fixtures/getCategoriesResponse.fixtures'
import {useHelpCenterApi} from '../../../hooks/useHelpCenterApi'

import {CategoriesViews} from '../CategoriesView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('../../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})
jest.mock('../../../hooks/useHelpCenterApi')
const useHelpCenterApiMock = useHelpCenterApi as jest.Mock

useHelpCenterApiMock.mockImplementation(() => ({
    isReady: true,
    client: {
        listCategories: jest.fn().mockResolvedValue({
            data: {data: [], meta: {}},
        }),
        listArticles: jest.fn().mockResolvedValue({
            data: {data: [], meta: {}},
        }),
        listCategoryArticles: jest.fn().mockResolvedValue({
            data: {data: [], meta: {}},
        }),
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

describe('<CategoriesViews />', () => {
    it('should show starter screen', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenters: {
                    '1': helpCenterMock,
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

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <CategoriesViews
                    helpCenter={helpCenterMock}
                    renderArticleList={() => <div />}
                    createArticle={jest.fn()}
                    createCategory={jest.fn()}
                />
            </Provider>
        )

        await screen.findByText('Start your Help Center here')
        expect(screen.queryByText('Uncategorized articles')).toBe(null)
    })

    it('should show uncategorized row', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenters: {
                    '1': helpCenterMock,
                },
            } as any,
            helpCenter: {
                articles: {
                    articlesById: {
                        1: articleMock,
                    },
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

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <CategoriesViews
                    helpCenter={helpCenterMock}
                    renderArticleList={() => <div />}
                    createArticle={jest.fn()}
                    createCategory={jest.fn()}
                />
            </Provider>
        )

        await screen.findByText('Uncategorized articles')
    })

    it('should show uncategorized row and category row', async () => {
        const initialState: Partial<RootState> = {
            entities: {
                helpCenters: {
                    '1': helpCenterMock,
                },
            } as any,
            helpCenter: {
                articles: {
                    articlesById: {},
                },
                categories: {
                    categoriesById: {
                        1: categoryMock,
                    },
                },
                ui: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        renderWithRouter(
            <Provider store={mockedStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesViews
                        helpCenter={helpCenterMock}
                        renderArticleList={() => <div />}
                        createArticle={jest.fn()}
                        createCategory={jest.fn()}
                    />
                </DndProvider>
            </Provider>
        )

        await screen.findByText('Uncategorized articles')
        await screen.findByText('Orders')
    })
})
