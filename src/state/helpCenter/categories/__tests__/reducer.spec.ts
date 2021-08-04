import _keyBy from 'lodash/keyBy'
import produce from 'immer'

import {
    getCategoriesResponseEnglish,
    getSingleCategoryEnglish,
} from '../../../../pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'

import {Category} from '../../../../models/helpCenter/types'

import reducer, {initialState} from '../reducer'
import {
    saveCategories,
    updateCategory,
    deleteCategory,
    resetCategories,
} from '../actions'

import {CategoriesAction} from '../types'

const categoriesResponse: Category[] = getCategoriesResponseEnglish.data.map(
    (category) => ({
        ...category,
        articles: [],
        translation: {
            ...category.translation,
            locale: 'en-US',
        },
    })
)

const categoryResponse: Category = {
    ...getSingleCategoryEnglish,
    articles: [],
    translation: {
        ...getSingleCategoryEnglish.translation,
        locale: 'en-US',
    },
}

describe('Help Center/Categories reducer', () => {
    it('has the correct initial state', () => {
        expect(reducer(undefined, {} as CategoriesAction)).toEqual(initialState)
    })

    describe('dispatch saveCategories', () => {
        it('saves the categories by key', () => {
            const nextState = reducer(
                undefined,
                saveCategories(categoriesResponse)
            )
            const categoriesId = Object.keys(
                nextState.categoriesById
            ).map((id) => parseInt(id, 10))

            // We have the same number of entities
            expect(categoriesId.length).toEqual(categoriesResponse.length)

            // We have the same keys
            expect(
                categoriesId.every((id) => {
                    return !!categoriesResponse.find(
                        (category) => category.id === id
                    )
                })
            ).toBeTruthy()
        })
    })

    describe('dispatch updateCategory', () => {
        it('updates the current article', () => {
            const updatedCategory = produce(categoryResponse, (draft) => {
                if (draft.translation) {
                    draft.translation.title = 'New Title'
                }
            })

            const nextState = reducer(
                {
                    categoriesById: {
                        [categoryResponse.id]: categoryResponse,
                    },
                },
                updateCategory(updatedCategory)
            )

            expect(nextState).toEqual({
                categoriesById: {
                    [categoryResponse.id]: updatedCategory,
                },
            })
        })
    })

    describe('dispatch deleteCategory', () => {
        it('removes the current article', () => {
            const nextState = reducer(
                {
                    categoriesById: {
                        [categoryResponse.id]: categoryResponse,
                    },
                },
                deleteCategory(categoryResponse.id)
            )

            expect(nextState).toEqual({
                categoriesById: {},
            })
        })
    })

    describe('dispatch resetCategories', () => {
        it('restores the initial state', () => {
            const nextState = reducer(
                {
                    categoriesById: _keyBy(categoriesResponse, 'id'),
                },
                resetCategories()
            )

            expect(nextState).toEqual(initialState)
        })
    })
})
