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
    saveCategories,
    updateCategoriesOrder,
    updateCategoryTranslation,
} from '../../../../../state/helpCenter/categories'

import {getSingleCategoryEnglish} from '../../fixtures/getCategoriesResponse.fixtures'

import {useCategoriesActions} from '../useCategoriesActions'

jest.mock('react-router')
;(useParams as jest.MockedFunction<typeof useParams>).mockReturnValue({
    helpcenterId: '1',
})

jest.mock('../useHelpcenterApi', () => {
    return {
        useHelpcenterApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                createCategory: () =>
                    Promise.resolve({
                        data: {
                            translation: {},
                        },
                    }),
                updateCategoryTranslation: () =>
                    Promise.resolve({
                        data: {},
                    }),
                setCategoriesPositions: () =>
                    Promise.resolve({
                        data: [],
                    }),
                getCategoriesPositions: () =>
                    Promise.resolve({
                        data: [],
                    }),
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

    describe('updateCategoriesPosition()', () => {
        it('dispatches updateCategoriesOrder action', async () => {
            const {result} = renderHook(useCategoriesActions, {
                wrapper: dependencyWrapper,
            })

            await result.current.updateCategoriesPosition([
                createCategoryFromDto(getSingleCategoryEnglish, 1),
            ])

            expect(updateCategoriesOrder).toHaveBeenCalled()
        })
    })
})
