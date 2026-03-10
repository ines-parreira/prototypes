import React from 'react'

import { render, screen } from '@testing-library/react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider as ReduxProvider } from 'react-redux'
import type { DeepPartial } from 'redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Category, NonRootCategory } from 'models/helpCenter/types'
import { CategoriesTableBasicRow } from 'pages/settings/helpCenter/components/CategoriesTable/components/CategoriesTableBasicRow/CategoriesTableBasicRow'
import {
    CATEGORY_ROW_ACTIONS,
    CATEGORY_TREE_MAX_LEVEL,
} from 'pages/settings/helpCenter/constants'
import { getSingleArticleEnglish } from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import { getCategoriesFlatSorted } from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { isNonRootCategory } from 'state/entities/helpCenter/categories'
import type { RootState, StoreDispatch } from 'state/types'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { CategoriesTableRow } from '../CategoriesTableRow'

const mockStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({
        id: 1,
    }),
}))

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: jest.fn(),
    }),
}))

const mockedListArticles = jest.fn().mockResolvedValue({
    data: { data: [], meta: { item_count: 0 } },
})
const mockedListCategoryArticles = jest.fn().mockResolvedValue({
    data: { data: [], meta: { item_count: 0 } },
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
        useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
    }
})

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<CategoriesTableRow />', () => {
    it('should render null if shouldRenderRowWithoutArticles is false and there are no articles', () => {
        const rootCategory = getCategoriesFlatSorted[0]

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
                            '0': { ...rootCategory, articleCount: 0 },
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

        const { container } = render(
            <ReduxProvider store={mockStore(initialState)}>
                <CategoriesTableBasicRow
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                    isCountBadgeLoading={false}
                />
            </ReduxProvider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render "Uncategorized articles" row when shouldRenderRowWithoutArticles is false but there are some uncategorized articles', async () => {
        const rootCategory = getCategoriesFlatSorted[0]

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
                            '0': { ...rootCategory, articleCount: 1 },
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

        const { container, findByText } = render(
            <ReduxProvider store={mockStore(initialState)}>
                <CategoriesTableBasicRow
                    renderArticleList={() => <div />}
                    title="Uncategorized articles"
                    shouldRenderRowWithoutArticles={false}
                    isCountBadgeLoading={false}
                />
            </ReduxProvider>,
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

        const { container, findByText } = render(
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
                        isCountBadgeLoading={false}
                    />
                </DndProvider>
            </ReduxProvider>,
        )

        expect(container).toMatchSnapshot('Loading state')

        await findByText(category.translation.title)

        expect(container).toMatchSnapshot('Idle state')
    })

    it('should display visibility based on customer_visibility, not visibility_status', async () => {
        const nonRootCategories =
            getCategoriesFlatSorted.filter(isNonRootCategory)
        const baseCategory = nonRootCategories[0]
        const category: NonRootCategory = {
            ...baseCategory,
            translation: {
                ...baseCategory.translation,
                customer_visibility: 'UNLISTED',
            },
        }

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
                            [category.id.toString()]: category,
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

        render(
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
                        isCountBadgeLoading={false}
                    />
                </DndProvider>
            </ReduxProvider>,
        )

        await screen.findByText(category.translation.title)

        expect(screen.getByText('Unlisted')).toBeInTheDocument()
        expect(screen.getByText('visibility_off')).toBeInTheDocument()
        expect(screen.queryByText('Public')).not.toBeInTheDocument()
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

        const { container, findByText } = render(
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
                        isCountBadgeLoading={false}
                    />
                </DndProvider>
            </ReduxProvider>,
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

        render(
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
                        isCountBadgeLoading={false}
                    />
                </DndProvider>
            </ReduxProvider>,
        )

        expect(screen.getByText('playlist_add')).toBeInTheDocument()
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

        render(
            <ReduxProvider store={mockStore(initialState)}>
                <DndProvider backend={HTML5Backend}>
                    <CategoriesTableRow
                        categoryId={categories[0].id}
                        category={categories[0]}
                        position={0}
                        level={CATEGORY_TREE_MAX_LEVEL}
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
                        isCountBadgeLoading={false}
                    />
                </DndProvider>
            </ReduxProvider>,
        )
        expect(
            screen.getByLabelText(CATEGORY_ROW_ACTIONS[0].name),
        ).toBeAriaEnabled()
        expect(
            screen.getByLabelText(CATEGORY_ROW_ACTIONS[1].name),
        ).toBeAriaDisabled()
        expect(
            screen.getByLabelText(CATEGORY_ROW_ACTIONS[2].name),
        ).toBeAriaEnabled()
    })
})
