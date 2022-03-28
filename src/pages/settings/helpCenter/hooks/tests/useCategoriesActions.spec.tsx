import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {
    deleteCategory,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    saveCategories,
    updateCategoryTranslation,
    savePositions,
} from 'state/entities/helpCenter/categories'

import {useCategoriesActions} from '../useCategoriesActions'
import {useHelpCenterApi} from '../useHelpCenterApi'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpCenterId: '1',
})

jest.mock('../useHelpCenterApi', () => {
    return {
        useHelpCenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
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
                getCategoryTree: jest.fn().mockResolvedValue({data: {}}),
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
                deleteCategory: jest.fn().mockResolvedValue({}),
                deleteCategoryArticles: jest.fn().mockResolvedValue({}),
                setSubCategoriesPositions: jest.fn().mockReturnValue({
                    data: [],
                }),
            },
        }),
    }
})

jest.mock('state/entities/helpCenter/categories', () => ({
    saveCategories: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/SAVE_CATEGORIES',
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
            parent_category_id: null,
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
            parent_category_id: null,
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
    ui: {helpCenter: uiState} as any,
}

// TODO: This should be extracted in a tests utils folder
const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: Element
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useCategoriesActions', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('getCategoryTranslation()', () => {
        it('calls the getCategory with correct locale', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.getCategoryTranslation(1, 'en-US')

            expect(useHelpCenterApi().client?.getCategory).toHaveBeenCalledWith(
                {
                    help_center_id: 1,
                    id: 1,
                    locale: 'en-US',
                }
            )
        })
    })

    describe('createCategory()', () => {
        it('dispatches saveCategories action', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createCategory({
                translation: {
                    locale: 'en-US',
                    title: '',
                    slug: '',
                    description: '',
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
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateCategoryTranslation(1, 'en-US', {
                title: '',
                slug: '',
                description: '',
            })

            expect(updateCategoryTranslation).toHaveBeenCalled()
        })
    })

    describe('createCategoryTranslation()', () => {
        it('calls only pushCategorySupportedLocales if locale param is different from view language', async () => {
            const {result} = renderHook(useCategoriesActions, {
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
            const {result} = renderHook(useCategoriesActions, {
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
            const {result} = renderHook(useCategoriesActions, {
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
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategoryTranslation(1, 'fr-FR')

            expect(removeLocaleFromCategory).toHaveBeenCalledWith({
                categoryId: 1,
                locale: 'fr-FR',
            })
        })

        it('dispatches updateCategoryTranslation if locale param is the same as view language', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategoryTranslation(1, 'en-US')

            expect(updateCategoryTranslation).toHaveBeenCalled()
        })

        it("doesn't dispatch deleteCategory if locale param is the same as view language", async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategoryTranslation(1, 'fr-FR')

            expect(updateCategoryTranslation).not.toHaveBeenCalled()
        })
    })

    describe('deleteCategory()', () => {
        it('dispatches deleteCategory', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategory(1)

            expect(deleteCategory).toHaveBeenCalledWith(1)
        })
    })
})
