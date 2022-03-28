import _keyBy from 'lodash/keyBy'

import {createArticleFromDto} from 'models/helpCenter/utils'
import {getArticlesResponseFixture} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import {StoreState} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'
import {getCategoriesFlatSorted} from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import {
    getInitialRootCategory,
    getRootCategory,
} from 'pages/settings/helpCenter/fixtures/getCategoriesTree.fixtures'

import {getCategories, getCategoriesWithArticles} from '../selectors'
import {
    getCategoryById,
    getNonRootCategoriesById,
    getParentCategories,
} from '..'

const articlesResponse =
    getArticlesResponseFixture.data.map(createArticleFromDto)

const categoriesResponse = getCategoriesFlatSorted

const store: Partial<StoreState> = {
    entities: {
        helpCenter: {
            articles: {
                articlesById: _keyBy(articlesResponse, 'id'),
            },
            categories: {
                categoriesById: _keyBy(getCategoriesFlatSorted, 'id'),
            },
        },
    } as any,
    ui: {helpCenter: {...uiState, currentLanguage: 'en-US'}} as any,
}

const emptyStore: Partial<StoreState> = {
    entities: {
        helpCenter: helpCenterInitialState,
    } as any,
    ui: {helpCenter: {...uiState, currentLanguage: 'en-US'}} as any,
}

describe('getCategories()', () => {
    it('returns the categories as list', () => {
        expect(getCategories(store as StoreState)).toEqual(categoriesResponse)
    })

    it('returns empty list when there are no categories', () => {
        expect(getCategories(emptyStore as StoreState)).toEqual([
            getInitialRootCategory,
        ])
    })
})

describe('getNonRootCategoriesById()', () => {
    it('returns all the categories except for the root category', () => {
        expect(
            getNonRootCategoriesById(store as StoreState)
        ).not.toHaveProperty('0')
    })
})

describe('getParentCategories()', () => {
    it('returns all categories except level 4', () => {
        const parentCategories = getParentCategories(store as StoreState)
        const parentCategoriesIds = parentCategories.map(
            (category) => category.id
        )
        expect(parentCategoriesIds).not.toContain(143)
    })
})

describe('getCategoryById()', () => {
    it('returns the requested category', () => {
        expect(getCategoryById(0)(store as StoreState)).toEqual(getRootCategory)
    })
})

describe('getCategoriesWithArticles()', () => {
    it('returns the list of categories with articles', () => {
        const output = getCategoriesWithArticles(store as StoreState)

        output
            .filter((category) => category.id > 0)
            .forEach((category) => {
                expect(category.articles.length).toEqual(1)
            })
    })
})
