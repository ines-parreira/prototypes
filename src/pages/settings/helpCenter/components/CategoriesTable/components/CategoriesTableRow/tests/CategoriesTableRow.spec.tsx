import React from 'react'
import {render} from '@testing-library/react'
import {Provider as ReduxProvider} from 'react-redux'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {DeepPartial} from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {isNonRootCategory} from 'state/entities/helpCenter/categories'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getSingleArticleEnglish} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import {getCategoriesFlatSorted} from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import {Category} from 'models/helpCenter/types'
import {CategoriesTableRow} from '../CategoriesTableRow'
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

describe('<CategoriesTableRow />', () => {
    it('should render null if shouldRenderRowWithoutArticles is false and there are no articles', () => {
        const initialState: DeepPartial<RootState> = {
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
            },
            ui: {
                helpCenter: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        const {container} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <CategoriesTableBasicRow
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                />
            </ReduxProvider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render "Uncategorized articles" row when shouldRenderRowWithoutArticles is false but there are some uncategorized articles', async () => {
        const initialState: DeepPartial<RootState> = {
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
                <CategoriesTableBasicRow
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
        const nonRootCategories =
            getCategoriesFlatSorted.filter(isNonRootCategory)
        const category = nonRootCategories[0]
        const initialState: DeepPartial<RootState> = {
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
                            '2': category,
                        },
                    },
                },
            },
            ui: {
                helpCenter: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        const {container, findByText} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesTableRow
                        categoryId={category.id}
                        category={category}
                        position={0}
                        level={0}
                        isUnlisted={false}
                        childCategories={[]}
                        renderArticleList={() => <div />}
                        onMoveEntity={() => {
                            return null
                        }}
                        onDragStart={() => {
                            return null
                        }}
                        title={category.translation.title}
                    />
                </DndProvider>
            </ReduxProvider>
        )

        expect(container).toMatchSnapshot('Loading state')

        await findByText(category.translation.title)

        expect(container).toMatchSnapshot('Idle state')
    })

    it('should render category that has children', async () => {
        const rootCategory = getCategoriesFlatSorted[0]
        const categories = getCategoriesFlatSorted.filter(isNonRootCategory)
        const categoriesById: Record<string, Category> = {}
        categories.forEach((category) => {
            categoriesById[category.id.toString()] = category
        })
        const initialState: DeepPartial<RootState> = {
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
                            '0': rootCategory,
                            ...categoriesById,
                        },
                    },
                },
            },
            ui: {
                helpCenter: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        const {container, findByText} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesTableRow
                        categoryId={categories[0].id}
                        category={categories[0]}
                        position={0}
                        level={0}
                        isUnlisted={false}
                        childCategories={categories[0].children}
                        renderArticleList={() => <div />}
                        onMoveEntity={() => {
                            return null
                        }}
                        onDragStart={() => {
                            return null
                        }}
                        title={categories[0].translation.title}
                    />
                </DndProvider>
            </ReduxProvider>
        )

        await findByText(categories[0].translation.title)
        expect(container).toMatchSnapshot()
    })

    it('should display Create Category button', () => {
        const rootCategory = getCategoriesFlatSorted[0]
        const categories = getCategoriesFlatSorted.filter(isNonRootCategory)
        const categoriesById: Record<string, Category> = {}
        categories.forEach((category) => {
            categoriesById[category.id.toString()] = category
        })
        const initialState: DeepPartial<RootState> = {
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
                            '0': rootCategory,
                            ...categoriesById,
                        },
                    },
                },
            },
            ui: {
                helpCenter: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        const {getByTestId} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesTableRow
                        categoryId={categories[0].id}
                        category={categories[0]}
                        position={0}
                        level={0}
                        isUnlisted={false}
                        childCategories={categories[0].children}
                        renderArticleList={() => <div />}
                        onMoveEntity={() => {
                            return null
                        }}
                        onDragStart={() => {
                            return null
                        }}
                        title={categories[0].translation.title}
                    />
                </DndProvider>
            </ReduxProvider>
        )

        expect(getByTestId('createNestedCategory')).toBeTruthy()
    })

    it('should not display Create Category because the parent is a category at the deepest possible level', () => {
        const rootCategory = getCategoriesFlatSorted[0]
        const categories = getCategoriesFlatSorted.filter(isNonRootCategory)
        const categoriesById: Record<string, Category> = {}
        categories.forEach((category) => {
            categoriesById[category.id.toString()] = category
        })
        const initialState: DeepPartial<RootState> = {
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
                            '0': rootCategory,
                            ...categoriesById,
                        },
                    },
                },
            },
            ui: {
                helpCenter: {
                    currentId: 1,
                    currentLanguage: 'en-US',
                },
            },
        }

        const {getByTestId} = render(
            <ReduxProvider store={mockStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesTableRow
                        categoryId={categories[0].id}
                        category={categories[0]}
                        position={0}
                        level={3}
                        isUnlisted={false}
                        childCategories={categories[0].children}
                        renderArticleList={() => <div />}
                        onMoveEntity={() => {
                            return null
                        }}
                        onDragStart={() => {
                            return null
                        }}
                        title={categories[0].translation.title}
                    />
                </DndProvider>
            </ReduxProvider>
        )
        expect(
            getByTestId('categorySettings')
                .closest('button')
                ?.getAttribute('disabled')
        ).toBe(null)
        expect(
            getByTestId('createNestedCategory')
                .closest('button')
                ?.getAttribute('disabled')
        ).not.toBe(null)
        expect(
            getByTestId('createNestedArticle')
                .closest('button')
                ?.getAttribute('disabled')
        ).toBe(null)
    })
})
