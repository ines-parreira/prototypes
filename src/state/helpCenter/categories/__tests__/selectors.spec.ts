import _keyBy from 'lodash/keyBy'

import {Category} from '../../../../models/helpCenter/types'
import {
    createArticleFromDto,
    createCategoryFromDto,
} from '../../../../models/helpCenter/utils'
import {getArticlesResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getCategoriesResponseEnglish} from '../../../../pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'

import {StoreState} from '../../../types'
import {initialState as uiState} from '../../ui/reducer'

import {getCategories, getCategoriesWithArticles} from '../selectors'

const articlesResponse = getArticlesResponseFixture.data.map(
    createArticleFromDto
)

const categoriesResponse: Category[] = getCategoriesResponseEnglish.data.map(
    (category) => createCategoryFromDto(category, 1)
)

const store: Partial<StoreState> = {
    helpCenter: {
        articles: {
            articlesById: _keyBy(articlesResponse, 'id'),
        },
        categories: {
            categoriesById: _keyBy(categoriesResponse, 'id'),
        },
        ui: {...uiState, currentLanguage: 'en-US'},
    },
}

const emptyStore: Partial<StoreState> = {
    helpCenter: {
        articles: {
            articlesById: {},
        },
        categories: {
            categoriesById: {},
        },
        ui: {...uiState, currentLanguage: 'en-US'},
    },
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
