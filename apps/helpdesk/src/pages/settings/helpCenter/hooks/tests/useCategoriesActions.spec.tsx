import type React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getHelpCenterClient } from 'rest_api/help_center_api/index'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import {
    deleteCategory,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    saveCategories,
    savePositions,
    updateCategoriesArticleCount,
    updateCategoryTranslation,
} from 'state/entities/helpCenter/categories'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import { HELP_CENTER_ROOT_CATEGORY_ID } from '../../constants'
import { useCategoriesActions } from '../useCategoriesActions'
import { useHelpCenterApi } from '../useHelpCenterApi'

jest.mock('../useCurrentHelpCenter', () => ({
    __esModule: true,
    default: jest.fn().mockReturnValue({
        id: 1,
    }),
}))

function mockHelpCenterApiClient() {
    return {
        createCategory: jest.fn().mockResolvedValue({
            data: {
                translation: {},
            },
        }),
        getCategory: jest.fn().mockResolvedValue({
            data: {
                translation: {},
            },
        }),
        getCategoryTree: () =>
            Promise.resolve({
                data: {
                    created_datetime: '2022-03-07T14:46:47.212Z',
                    updated_datetime: '2022-03-07T14:46:47.212Z',
                    deleted_datetime: null,
                    id: 0,
                    help_center_id: 3,
                    available_locales: [],
                    children: [],
                    articles: [],
                    articleCount: 0,
                    translation: null,
                },
            }),
        createCategoryTranslation: jest
            .fn()
            .mockResolvedValueOnce({
                data: {
                    category_id: 1,
                    locale: 'fr-FR',
                    title: '',
                    description: '',
                    slug: '',
                },
            })
            .mockResolvedValue({
                data: {
                    category_id: 1,
                    locale: 'en-US',
                    title: '',
                    description: '',
                    slug: '',
                },
            }),
        updateCategoryTranslation: jest.fn().mockResolvedValue({
            data: {},
        }),
        setCategoriesPositions: jest.fn().mockResolvedValue({
            data: [],
        }),
        getCategoriesPositions: jest.fn().mockResolvedValue({
            data: [],
        }),
        deleteCategoryTranslation: jest.fn().mockResolvedValue({}),
        listArticles: jest.fn().mockResolvedValue({
            data: { data: [] },
        }),
        deleteCategory: jest.fn().mockResolvedValue({}),
        deleteCategoryArticles: jest.fn().mockResolvedValue({}),
        setSubCategoriesPositions: jest.fn().mockReturnValue({
            data: [],
        }),
    }
}

jest.mock('rest_api/help_center_api/index', () => {
    const mockedClient = mockHelpCenterApiClient()
    return {
        getHelpCenterClient: jest.fn().mockResolvedValue({
            client: mockedClient,
            agentAbility: undefined,
        }),
    }
})

jest.mock('../useHelpCenterApi', () => {
    const mockedClient = mockHelpCenterApiClient()
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: mockedClient,
        }),
    }
})

jest.mock('state/entities/helpCenter/categories', () => ({
    saveCategories: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/SAVE_CATEGORIES',
        payload: {},
    }),
    updateCategoriesArticleCount: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/UPDATE_CATEGORIES_ARTICLE_COUNT',
        payload: {},
    }),
    savePositions: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/SAVE_POSITIONS',
        payload: {},
    }),
    updateCategoryTranslation: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/UPDATE_CATEGORY_TRANSLATION',
        payload: {},
    }),
    pushCategorySupportedLocales: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/PUSH_CATEGORY_LOCALES',
        payload: {},
    }),
    deleteCategory: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/DELETE_CATEGORY',
        payload: {},
    }),
    removeLocaleFromCategory: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/REMOVE_CATEGORY_LOCALE',
        payload: {},
    }),
    getCategoriesById: jest.fn().mockReturnValue({
        '0': {
            created_datetime: '2022-03-07T14:46:47.212Z',
            updated_datetime: '2022-03-07T14:46:47.212Z',
            deleted_datetime: null,
            id: 0,
            help_center_id: 3,
            available_locales: [],
            translation: null,
            children: [1],
            articles: [],
        },
        '1': {
            created_datetime: '2022-03-07T14:46:47.212Z',
            updated_datetime: '2022-03-07T14:46:47.212Z',
            deleted_datetime: null,
            id: 1,
            help_center_id: 3,
            available_locales: ['en-US', 'fr-FR'],
            translation: {
                created_datetime: '2022-03-07T14:47:03.686Z',
                updated_datetime: '2022-03-07T14:47:03.686Z',
                deleted_datetime: null,
                parent_category_id: null,
                description: '',
                title: 'Category 1',
                slug: 'category-1',
                category_id: 5,
                locale: 'en-US',
                seo_meta: {
                    title: null,
                    description: null,
                },
            },
            children: [],
            articles: [],
        },
    }),
}))

jest.mock('state/ui/helpCenter/selectors', () => ({
    getViewLanguage: () => 'en-US',
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    ui: { helpCenter: uiState } as any,
}

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: React.ReactNode
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useCategoriesActions', () => {
    describe('fetchCategoryArticleCount', () => {
        it('calls the listArticles with correct params', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.fetchCategoryArticleCount(
                HELP_CENTER_ROOT_CATEGORY_ID,
                'en-US',
            )

            expect(updateCategoriesArticleCount).toHaveBeenLastCalledWith([
                { articleCount: 0, categoryId: 0 },
            ])
        })
    })

    describe('getCategoryTranslation()', () => {
        it('calls the getCategory with correct locale', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.getCategoryTranslation(1, 'en-US')

            expect(useHelpCenterApi().client?.getCategory).toHaveBeenCalledWith(
                {
                    help_center_id: 1,
                    id: 1,
                    locale: 'en-US',
                },
            )
        })
    })

    describe('createCategory()', () => {
        it('dispatches saveCategories action', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createCategory({
                translation: {
                    locale: 'en-US',
                    title: '',
                    slug: '',
                    description: '',
                    customer_visibility: 'PUBLIC',
                    seo_meta: {
                        title: null,
                        description: null,
                    },
                },
            })

            expect(saveCategories).toHaveBeenCalled()
        })
    })

    describe('updateCategoryTranslation()', () => {
        it('dispatches updateCategoryTranslation action', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateCategoryTranslation(1, 'en-US', {
                title: '',
                slug: '',
                description: '',
                customer_visibility: 'PUBLIC',
            })

            expect(updateCategoryTranslation).toHaveBeenCalled()
        })
    })

    describe('createCategoryTranslation()', () => {
        it('calls only pushCategorySupportedLocales if locale param is different from view language', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createCategoryTranslation(1, {
                locale: 'fr-FR',
                title: ',',
                description: ',',
                slug: ',',
                seo_meta: {
                    title: null,
                    description: null,
                },
            })

            expect(pushCategorySupportedLocales).toHaveBeenCalledWith({
                categoryId: 1,
                supportedLocales: ['fr-FR'],
            })
            expect(updateCategoryTranslation).not.toHaveBeenCalled()
        })

        it('calls pushCategorySupportedLocales and updateCategoryTranslation if locale param is the same as view language', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createCategoryTranslation(1, {
                locale: 'en-US',
                title: ',',
                description: ',',
                slug: ',',
                seo_meta: {
                    title: null,
                    description: null,
                },
            })

            expect(pushCategorySupportedLocales).toHaveBeenCalled()
            expect(updateCategoryTranslation).toHaveBeenCalled()
        })
    })

    describe('updateCategoriesPositions()', () => {
        it('dispatches savePositions action', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateCategoriesPositions({
                categories: [1, 2, 3],
                categoryId: 4,
                defaultSiblingsPositions: [1, 2, 3],
            })

            expect(savePositions).toHaveBeenCalled()
        })
    })

    describe('deleteCategoryTranslation()', () => {
        it('dispatches removeLocaleFromCategory', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategoryTranslation(1, 'fr-FR')

            expect(removeLocaleFromCategory).toHaveBeenCalledWith({
                categoryId: 1,
                locale: 'fr-FR',
            })
            const { client: apiClient } = await getHelpCenterClient()
            expect(apiClient.listArticles).toHaveBeenCalled()
        })

        it('dispatches updateCategoryTranslation if locale param is the same as view language', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategoryTranslation(1, 'en-US')

            expect(updateCategoryTranslation).toHaveBeenCalled()
        })

        it("doesn't dispatch deleteCategory if locale param is the same as view language", async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategoryTranslation(1, 'fr-FR')

            expect(updateCategoryTranslation).not.toHaveBeenCalled()
        })
    })

    describe('deleteCategory()', () => {
        it('dispatches deleteCategory', async () => {
            const { result } = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategory(1)

            expect(deleteCategory).toHaveBeenCalledWith(1)
        })
    })

    describe('fetchCategories()', () => {
        it('saves the categories once they are fetched', async () => {
            const { result } = renderHook(() => useCategoriesActions(), {
                wrapper: dependencyWrapper,
            })
            await result.current.fetchCategories('en-US', 0, true)

            expect(saveCategories).toHaveBeenLastCalledWith({
                categories: [
                    {
                        articles: [],
                        articleCount: 0,
                        available_locales: [],
                        children: [],
                        created_datetime: '2022-03-07T14:46:47.212Z',
                        deleted_datetime: null,
                        help_center_id: 3,
                        id: 0,
                        translation: null,
                        updated_datetime: '2022-03-07T14:46:47.212Z',
                    },
                ],
                shouldReset: true,
            })
        })
    })
})
