import _keyBy from 'lodash/keyBy'

import {createArticleFromDto} from '../../../../models/helpCenter/utils'
import {getArticlesResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import {StoreState} from '../../../types'
import {initialState as categoriesState} from '../../categories/reducer'
import {initialState as uiState} from '../../ui/reducer'

import {
    readArticles,
    readArticleById,
    readArticlesInCategory,
    readUncategorizedArticles,
} from '../selectors'

const articlesResponse = getArticlesResponseFixture.data.map(
    createArticleFromDto
)

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

describe('readArticles()', () => {
    it('returns the articles as list', () => {
        expect(readArticles(store as StoreState)).toEqual(articlesResponse)
    })

    it('returns empty list when there are on articles', () => {
        expect(readArticles(emptyStore as StoreState)).toEqual([])
    })
})

describe('readArticleById()', () => {
    it('returns the article if it is found', () => {
        expect(readArticleById(1)(store as StoreState)).toEqual(
            articlesResponse[0]
        )
    })

    it('returns undefined if it is not found', () => {
        expect(readArticleById(999)(store as StoreState)).not.toBeDefined()
    })
})

describe('readArticlesInCategory()', () => {
    it('returns the list of categories', () => {
        expect(readArticlesInCategory(4)(store as StoreState)).toHaveLength(3)
    })
})

describe('readUncategorizedArticles', () => {
    it('returns the articles without category', () => {
        expect(readUncategorizedArticles(store as StoreState)).toEqual([
            articlesResponse[0],
        ])
    })
})
