import _keyBy from 'lodash/keyBy'
import {produce} from 'immer'

import {getSingleCategoryEnglish as categoryResponse} from 'pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'

import {Category} from 'models/helpCenter/types'
import {getCategoriesFlatSorted} from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import {
    getRootCategory,
    getSingleCategory,
} from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'

import {HELP_CENTER_ROOT_CATEGORY_ID} from 'pages/settings/helpCenter/constants'
import reducer, {initialState} from '../reducer'
import {
    saveCategories,
    savePositions,
    updateCategory,
    deleteCategory,
    resetCategories,
    pushCategorySupportedLocales,
    updateCategoriesArticleCount,
} from '../actions'

import {CategoriesAction} from '../types'

const categoriesResponse: Category[] = getCategoriesFlatSorted

describe('Help Center/Categories reducer', () => {
    it('has the correct initial state', () => {
        expect(reducer(undefined, {} as CategoriesAction)).toEqual(initialState)
    })

    describe('dispatch saveCategories', () => {
        it('saves the categories by key', () => {
            const nextState = reducer(
                undefined,
                saveCategories({
                    categories: categoriesResponse,
                    shouldReset: true,
                })
            )
            const categoriesId = Object.keys(nextState.categoriesById).map(
                (id) => parseInt(id, 10)
            )

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

        it('keeps the article count if the category is already in the state', () => {
            const nextState = reducer(
                {
                    categoriesById: {
                        [categoryResponse.id]: {
                            ...categoryResponse,
                            articleCount: 2,
                        },
                    },
                },
                saveCategories({
                    categories: categoriesResponse,
                    shouldReset: true,
                })
            )

            expect(
                nextState.categoriesById[categoryResponse.id].articleCount
            ).toEqual(2)
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
        it('removes the current category', () => {
            const singleCategory = getSingleCategory
            const rootCategory = getRootCategory
            const nextState = reducer(
                {
                    categoriesById: {
                        [singleCategory.id]: singleCategory,
                        '0': rootCategory,
                    },
                },
                deleteCategory(singleCategory.id)
            )

            expect(nextState).toEqual({
                categoriesById: {
                    '0': {
                        ...rootCategory,
                        children: rootCategory.children.filter(
                            (categoryId) => categoryId !== singleCategory.id
                        ),
                    },
                },
            })
        })
    })

    describe('dispatch savePositions', () => {
        it('saves positions for the children', () => {
            const rootCategory = getRootCategory
            const nextState = reducer(
                {
                    categoriesById: {
                        '0': rootCategory,
                    },
                },
                savePositions({categoryId: 0, children: [7, 6, 5]})
            )

            expect(nextState).toEqual({
                categoriesById: {
                    '0': {...rootCategory, children: [7, 6, 5]},
                },
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
                categoryId: categoryResponse.id,
                supportedLocales: ['fr-FR'],
            })
        )

        expect(nextState).toEqual({
            categoriesById: {
                [categoryResponse.id]: {
                    ...categoryResponse,
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

    describe('dispatch updateCategoriesArticleCount', () => {
        it('should save new categories article count', () => {
            const nextState = reducer(
                {
                    categoriesById: {
                        [categoryResponse.id]: categoryResponse,
                    },
                },
                updateCategoriesArticleCount([
                    {
                        categoryId: categoryResponse.id,
                        articleCount: 10,
                    },
                ])
            )

            expect(nextState).toEqual({
                categoriesById: {
                    [categoryResponse.id]: {
                        ...categoryResponse,
                        articleCount: 10,
                    },
                },
            })
        })
        it('should update default category article count when cattegory id is null', () => {
            const nextState = reducer(
                {
                    categoriesById: {
                        [HELP_CENTER_ROOT_CATEGORY_ID]: categoryResponse,
                    },
                },
                updateCategoriesArticleCount([
                    {
                        categoryId: null,
                        articleCount: 10,
                    },
                ])
            )

            expect(nextState).toEqual({
                categoriesById: {
                    [HELP_CENTER_ROOT_CATEGORY_ID]: {
                        ...categoryResponse,
                        articleCount: 10,
                    },
                },
            })
        })
    })
})
