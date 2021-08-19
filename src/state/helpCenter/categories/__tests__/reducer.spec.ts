import _keyBy from 'lodash/keyBy'
import produce from 'immer'

import {createCategoryFromDto} from '../../../../models/helpCenter/utils'
import {
    getCategoriesResponseEnglish,
    getSingleCategoryEnglish as categoryResponse,
} from '../../../../pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'

import {Category} from '../../../../models/helpCenter/types'

import reducer, {initialState} from '../reducer'
import {
    saveCategories,
    updateCategory,
    deleteCategory,
    resetCategories,
    pushCategorySupportedLocales,
} from '../actions'

import {CategoriesAction} from '../types'

const categoriesResponse: Category[] = getCategoriesResponseEnglish.data.map(
    (category) => createCategoryFromDto(category, 1)
)

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

    describe('dispatch pushCategorySupportedLocales', () => {
        const nextState = reducer(
            {
                categoriesById: {
                    [categoryResponse.id]: categoryResponse,
                },
            },
            pushCategorySupportedLocales({
                categoryId: 1,
                supportedLocales: ['fr-FR'],
            })
        )

        expect(nextState).toEqual({
            categoriesById: {
                1: {
                    ...categoryResponse,
                    articles: [],
                    available_locales: ['en-US', 'fr-FR'],
                    translation: {
                        ...categoryResponse.translation,
                        locale: 'en-US',
                    },
                },
            },
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
