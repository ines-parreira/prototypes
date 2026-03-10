import type { Category } from 'models/helpCenter/types'

import { searchResultsResponseFixture } from '../SearchResults.response.fixture'
import {
    getMissingEntities,
    isResultOrAncestorUnlisted,
    searchResultsTreeFromAlgolia,
} from '../utils'

const categoriesById: Record<string, Category> = {
    '0': {
        created_datetime: '2022-03-07T14:46:47.212Z',
        updated_datetime: '2022-03-07T14:46:47.212Z',
        deleted_datetime: null,
        id: 0,
        help_center_id: 1,
        available_locales: [],
        translation: null,
        children: [1],
        unlisted_id: 'my-unlisted-id-0',
        articleCount: 0,
    },
    '28': {
        created_datetime: '2022-03-07T14:46:47.212Z',
        updated_datetime: '2022-03-07T14:46:47.212Z',
        deleted_datetime: null,
        id: 28,
        help_center_id: 1,
        available_locales: ['en-US'],
        translation: {
            image_url: null,
            created_datetime: '2022-03-07T14:47:03.686Z',
            updated_datetime: '2022-03-07T14:47:03.686Z',
            deleted_datetime: null,
            parent_category_id: null,
            description: '',
            slug: 'cat-1-mod',
            title: 'Cat 1 mod',
            category_id: 28,
            locale: 'en-US',
            seo_meta: {
                title: null,
                description: null,
            },
            category_unlisted_id: 'my-unlisted-id-28',
            customer_visibility: 'PUBLIC',
        },
        children: [],
        unlisted_id: 'my-unlisted-id-28',
        articleCount: 0,
    },
}

const articlesById = {}

describe('SearchResults utils', () => {
    describe('searchResultsTreeFromAlgolia', () => {
        it('returns a result tree with lazy articles and categories', () => {
            const resultsTree = searchResultsTreeFromAlgolia(
                searchResultsResponseFixture,
                categoriesById,
                articlesById,
            )

            expect(resultsTree).toMatchSnapshot()
        })
    })

    describe('getNotLoadedEntities', () => {
        it('returns articles and categories that are not yet loaded', () => {
            const notLoaded = getMissingEntities(
                searchResultsTreeFromAlgolia(
                    searchResultsResponseFixture,
                    categoriesById,
                    articlesById,
                ),
            )

            expect(notLoaded).toEqual({
                missingCategoriesIds: new Set([39, 38, 37, 35, 36, 29, 30, 31]),
                missingArticlesIds: new Set([34, 32, 31, 29]),
            })
        })

        it('returns hasUncategorizedNotLoadedArticles to true if any uncategorized article is not loaded', () => {
            const notLoaded = getMissingEntities(
                searchResultsTreeFromAlgolia(
                    [
                        ...searchResultsResponseFixture,
                        {
                            gorgias_domain: 'goose.gorgias.docker',
                            custom_domain: '',
                            title: 'Sub uncategorized',
                            preview: '',
                            slug: 'sub-uncategorized',
                            title_draft: 'Sub uncategorized',
                            preview_draft: '',
                            slug_draft: 'sub-uncategorized',
                            article_content: 'content',
                            article_content_draft: 'content',
                            parent_category_1: null,
                            parent_category_2: null,
                            parent_category_3: null,
                            parent_category_4: null,
                            customer_visibility: 'PUBLIC',
                            id: 100,
                            help_center_id: 8,
                            locale: 'en-US',
                            type: 'article',
                            _tags: ['level1', 'latest_draft', 'current'],
                            objectID: 'article-100/en-US',
                            _highlightResult: {
                                title: {
                                    value: '<span class="search-highlight">Sub</span> uncategorized',
                                    matchLevel: 'full',
                                    fullyHighlighted: false,
                                    matchedWords: ['sub'],
                                },
                                preview: {
                                    value: '',
                                    matchLevel: 'none',
                                    matchedWords: [],
                                },
                                title_draft: {
                                    value: '<span class="search-highlight">Sub</span> uncategorized',
                                    matchLevel: 'full',
                                    fullyHighlighted: false,
                                    matchedWords: ['sub'],
                                },
                                preview_draft: {
                                    value: '',
                                    matchLevel: 'none',
                                    matchedWords: [],
                                },
                            },
                        },
                    ],
                    categoriesById,
                    articlesById,
                ),
            )

            expect(notLoaded).toEqual({
                missingCategoriesIds: new Set([39, 38, 37, 35, 36, 29, 30, 31]),
                missingArticlesIds: new Set([34, 32, 31, 29, 100]),
            })
        })
    })

    describe('isResultOrAncestorUnlisted', () => {
        it('uses customer_visibility from category hits', () => {
            const [searchResultCategory] = searchResultsTreeFromAlgolia(
                [
                    {
                        objectID: 'category-39/en-US',
                        id: 39,
                        type: 'category',
                        locale: 'en-US',
                        help_center_id: 8,
                        title: 'Sub cat 5 mod',
                        title_draft: 'Sub cat 5 mod',
                        slug: 'sub-cat-5-mod',
                        slug_draft: 'sub-cat-5-mod',
                        preview: '',
                        preview_draft: '',
                        gorgias_domain: 'goose.gorgias.docker',
                        custom_domain: '',
                        customer_visibility: 'UNLISTED',
                        parent_category_1: null,
                        parent_category_2: null,
                        parent_category_3: null,
                        _tags: ['level1', 'latest_draft', 'current'],
                    },
                ],
                categoriesById,
                articlesById,
            ).categorized

            expect(
                isResultOrAncestorUnlisted(searchResultCategory, 'en-US'),
            ).toBe(true)
        })

        it('uses customer_visibility from parent category hits', () => {
            const [searchResultCategory] = searchResultsTreeFromAlgolia(
                [
                    {
                        objectID: 'article-1/en-US',
                        id: 1,
                        type: 'article',
                        locale: 'en-US',
                        help_center_id: 8,
                        title: 'Article',
                        title_draft: 'Article',
                        slug: 'article',
                        slug_draft: 'article',
                        preview: '',
                        preview_draft: '',
                        article_content: '',
                        article_content_draft: '',
                        gorgias_domain: 'goose.gorgias.docker',
                        custom_domain: '',
                        customer_visibility: 'PUBLIC',
                        parent_category_1: {
                            id: 28,
                            description: '',
                            title: 'Cat 1 mod',
                            customer_visibility: 'UNLISTED',
                        },
                        parent_category_2: null,
                        parent_category_3: null,
                        parent_category_4: null,
                        _tags: ['current'],
                    },
                ],
                categoriesById,
                articlesById,
            ).categorized
            const [searchResultArticle] = searchResultCategory.children

            expect(
                isResultOrAncestorUnlisted(searchResultArticle, 'en-US'),
            ).toBe(true)
        })
    })
})
