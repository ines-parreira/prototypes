import _keyBy from 'lodash/keyBy'

import {Category} from '../../../../models/helpCenter/types'
import {createArticleFromDto} from '../../../../models/helpCenter/utils'
import {getArticlesResponseFixture} from '../../../../pages/settings/helpCenter/fixtures/getArticlesResponse.fixture'
import {getCategoriesResponseEnglish} from '../../../../pages/settings/helpCenter/fixtures/getCategoriesResponse.fixtures'

import {StoreState} from '../../../types'

import {readCategories, readCategoriesWithArticles} from '../selectors'

const articlesResponse = getArticlesResponseFixture.data.map(
    createArticleFromDto
)

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

const store: Partial<StoreState> = {
    helpCenter: {
        articles: {
            articlesById: _keyBy(articlesResponse, 'id'),
        },
        categories: {
            categoriesById: _keyBy(categoriesResponse, 'id'),
        },
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
    },
}

describe('readCategories()', () => {
    it('returns the categories as list', () => {
        expect(readCategories(store as StoreState)).toEqual(categoriesResponse)
    })

    it('returns empty list when there are no categories', () => {
        expect(readCategories(emptyStore as StoreState)).toEqual([])
    })
})

describe('readCategoriesWithArticles()', () => {
    it('returns the list of categories with articles', () => {
        const output = readCategoriesWithArticles(store as StoreState)

        output.forEach((category) => {
            expect(category.articles.length).toEqual(3)
        })
    })
})
