import _keyBy from 'lodash/keyBy'

import {createArticleFromDto} from 'models/helpCenter/utils'
import {getArticlesResponseFixture} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'

import {StoreState} from 'state/types'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import {
    getArticles,
    getArticleById,
    getArticlesInCategory,
    getUncategorizedArticles,
} from '../selectors'

const articlesResponse =
    getArticlesResponseFixture.data.map(createArticleFromDto)

const store: Partial<StoreState> = {
    entities: {
        helpCenter: {
            articles: {
                articlesById: _keyBy(articlesResponse, 'id'),
            },
            categories: categoriesState,
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
        expect(getArticleById(10)(store as StoreState)).toEqual(
            articlesResponse[0]
        )
    })

    it('returns undefined if it is not found', () => {
        expect(getArticleById(999)(store as StoreState)).not.toBeDefined()
    })
})

describe('getArticlesInCategory()', () => {
    it('returns the list of categories', () => {
        expect(getArticlesInCategory(6)(store as StoreState)).toHaveLength(1)
    })
})

describe('getUncategorizedArticles', () => {
    it('returns the articles without category', () => {
        expect(getUncategorizedArticles(store as StoreState)).toEqual([
            articlesResponse[articlesResponse.length - 1],
        ])
    })
})
