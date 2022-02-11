import _keyBy from 'lodash/keyBy'

import {
    createArticleFromDto,
    createCategoryFromDto,
} from 'models/helpCenter/utils'
import {getArticlesResponseFixture} from 'pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getCategoriesResponseEnglish} from 'pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'

import {StoreState} from 'state/types'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {initialState as helpCenterInitialState} from 'state/entities/helpCenter/reducer'

import {getCategories, getCategoriesWithArticles} from '../selectors'

const articlesResponse =
    getArticlesResponseFixture.data.map(createArticleFromDto)

const categoriesResponse = getCategoriesResponseEnglish.data.map((category) =>
    createCategoryFromDto(category, 1)
)

const store: Partial<StoreState> = {
    entities: {
        helpCenter: {
            articles: {
                articlesById: _keyBy(articlesResponse, 'id'),
            },
            categories: {
                categoriesById: _keyBy(categoriesResponse, 'id'),
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
        expect(getCategories(emptyStore as StoreState)).toEqual([])
    })
})

describe('getCategoriesWithArticles()', () => {
    it('returns the list of categories with articles', () => {
        const output = getCategoriesWithArticles(store as StoreState)

        output.forEach((category) => {
            expect(category.articles.length).toEqual(3)
        })
    })
})
