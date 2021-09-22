import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {useParams} from 'react-router-dom'

import {renderHook} from 'react-hooks-testing-library'
import configureMockStore from 'redux-mock-store'

import {createCategoryFromDto} from '../../../../../models/helpCenter/utils'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {
    deleteCategory,
    pushCategorySupportedLocales,
    removeLocaleFromCategory,
    saveCategories,
    updateCategoriesOrder,
    updateCategoryTranslation,
} from '../../../../../state/helpCenter/categories'

import {getSingleCategoryEnglish} from '../../fixtures/getCategoriesResponse.fixtures'

import {useCategoriesActions} from '../useCategoriesActions'
import {useHelpcenterApi} from '../useHelpcenterApi'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpcenterId: '1',
})

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
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
            },
        }),
    }
})

jest.mock('../../../../../state/helpCenter/categories', () => ({
    saveCategories: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/SAVE_CATEGORIES',
        payload: {},
    }),
    updateCategoriesOrder: jest.fn().mockReturnValue({
        type: 'HELPCENTER/CATEGORIES/UPDATE_CATEGORIES_ORDER',
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
}))

jest.mock('../../../../../state/helpCenter/ui/selectors', () => ({
    readViewLanguage: () => 'en-US',
}))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    helpCenter: {
        ui: uiState,
        articles: articlesState,
        categories: categoriesState,
    },
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

            expect(useHelpcenterApi().client?.getCategory).toHaveBeenCalledWith(
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
                category_id: 1,
                title: '',
                slug: '',
                description: '',
            })

            expect(updateCategoryTranslation).toHaveBeenCalled()
        })
    })

    describe('createCategoryTranslation()', () => {
        it('calls pushCategorySupportedLocales if locale param is different from view language', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createCategoryTranslation(1, {
                locale: 'fr-FR',
                title: ',',
                description: ',',
                slug: ',',
            })

            expect(pushCategorySupportedLocales).toHaveBeenCalledWith({
                categoryId: 1,
                supportedLocales: ['fr-FR'],
            })
        })

        it("doesn't call pushCategorySupportedLocales if locale param is the same as view language", async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.createCategoryTranslation(1, {
                locale: 'en-US',
                title: ',',
                description: ',',
                slug: ',',
            })

            expect(pushCategorySupportedLocales).not.toHaveBeenCalled()
        })
    })

    describe('updateCategoriesPositions()', () => {
        it('dispatches updateCategoriesOrder action', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateCategoriesPositions([
                createCategoryFromDto(getSingleCategoryEnglish, 1),
            ])

            expect(updateCategoriesOrder).toHaveBeenCalled()
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

        it('dispatches deleteCategory if locale param is the same as view language', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.deleteCategoryTranslation(1, 'en-US')

            expect(deleteCategory).toHaveBeenCalledWith(1)
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
