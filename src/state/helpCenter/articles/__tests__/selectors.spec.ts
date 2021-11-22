import _keyBy from 'lodash/keyBy'

import {createArticleFromDto} from '../../../../models/helpCenter/utils'
import {getArticlesResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import {StoreState} from '../../../types'
import {initialState as categoriesState} from '../../categories/reducer'
import {initialState as uiState} from '../../ui/reducer'

import {
    getArticles,
    getArticleById,
    getArticlesInCategory,
    getUncategorizedArticles,
} from '../selectors'

const articlesResponse =
    getArticlesResponseFixture.data.map(createArticleFromDto)

const store: Partial<StoreState> = {
    helpCenter: {
        articles: {
            articlesById: _keyBy(articlesResponse, 'id'),
        },
        ui: {...uiState, currentLanguage: 'en-US'},
        categories: categoriesState,
    },
}

const emptyStore: Partial<StoreState> = {
    helpCenter: {
        articles: {
            articlesById: {},
        },
        ui: {...uiState, currentLanguage: 'en-US'},
        categories: categoriesState,
    },
}

describe('getArticles()', () => {
    it('returns the articles as list', () => {
        expect(getArticles(store as StoreState)).toEqual(articlesResponse)
    })

    it('returns empty list when there are on articles', () => {
        expect(getArticles(emptyStore as StoreState)).toEqual([])
    })
})

describe('getArticleById()', () => {
    it('returns the article if it is found', () => {
        expect(getArticleById(1)(store as StoreState)).toEqual(
            articlesResponse[0]
        )
    })

    it('returns undefined if it is not found', () => {
        expect(getArticleById(999)(store as StoreState)).not.toBeDefined()
    })
})

describe('getArticlesInCategory()', () => {
    it('returns the list of categories', () => {
        expect(getArticlesInCategory(4)(store as StoreState)).toHaveLength(3)
    })
})

describe('getUncategorizedArticles', () => {
    it('returns the articles without category', () => {
        expect(getUncategorizedArticles(store as StoreState)).toEqual([
            articlesResponse[0],
        ])
    })
})
