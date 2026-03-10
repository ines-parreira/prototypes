import type { Category } from '../../../../../../models/helpCenter/types'
import { eligibleParentCategories, isOneOfParentsUnlisted } from '../utils'

const rootCategory: Category = {
    created_datetime: '2022-03-14T13:11:08.813Z',
    updated_datetime: '2022-03-14T13:11:08.813Z',
    deleted_datetime: null,
    id: 0,
    unlisted_id: '857b667102204bca88d57979fcde0bab',
    help_center_id: 1,
    available_locales: [],
    translation: null,
    children: [47],
    articleCount: 0,
}

const topLevelCategory: Category = {
    created_datetime: '2022-03-17T12:52:14.243Z',
    updated_datetime: '2022-03-17T12:52:14.243Z',
    deleted_datetime: null,
    id: 47,
    unlisted_id: 'd5e41b205f974b0b8ae28103712b865b',
    help_center_id: 1,
    available_locales: ['en-US', 'fr-FR'],
    translation: {
        image_url: null,
        created_datetime: '2022-03-17T12:52:14.243Z',
        updated_datetime: '2022-03-17T12:52:14.243Z',
        deleted_datetime: null,
        parent_category_id: null,
        customer_visibility: 'PUBLIC',
        description: '',
        title: 'Top level',
        slug: 'top-level',
        category_id: 47,
        category_unlisted_id: 'd5e41b205f974b0b8ae28103712b865b',
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [48, 53],
    articleCount: 0,
}

const level1CategoryWithChildren: Category = {
    created_datetime: '2022-03-17T12:52:41.853Z',
    updated_datetime: '2022-03-17T12:52:41.853Z',
    deleted_datetime: null,
    id: 48,
    unlisted_id: '7e4c2e95803f4918bac6ae0d57734002',
    help_center_id: 1,
    available_locales: ['fr-FR', 'en-US'],
    translation: {
        image_url: null,
        created_datetime: '2022-03-17T12:53:10.489Z',
        updated_datetime: '2022-03-17T12:53:10.489Z',
        deleted_datetime: null,
        parent_category_id: 47,
        customer_visibility: 'PUBLIC',
        description: '',
        title: 'Level 1',
        slug: 'level-1',
        category_id: 48,
        category_unlisted_id: '7e4c2e95803f4918bac6ae0d57734002',
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [49],
    articleCount: 0,
}

const level2Category: Category = {
    created_datetime: '2022-03-17T12:53:43.235Z',
    updated_datetime: '2022-03-17T12:54:26.401Z',
    deleted_datetime: null,
    id: 49,
    unlisted_id: 'c28645f2d381483ea08a0f0d21a7a84f',
    help_center_id: 1,
    available_locales: ['fr-FR', 'en-US'],
    translation: {
        image_url: null,
        created_datetime: '2022-03-17T12:53:43.235Z',
        updated_datetime: '2022-03-17T12:54:26.411Z',
        deleted_datetime: null,
        parent_category_id: 48,
        customer_visibility: 'PUBLIC',
        description: '',
        title: 'Level 2',
        slug: 'level-2',
        category_id: 49,
        category_unlisted_id: 'c28645f2d381483ea08a0f0d21a7a84f',
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [50],
    articleCount: 0,
}

const level1Category: Category = {
    created_datetime: '2022-03-23T10:34:42.017Z',
    updated_datetime: '2022-03-23T10:34:42.017Z',
    deleted_datetime: null,
    id: 53,
    unlisted_id: 'df865d37bbc74135a355b56c20b40e46',
    help_center_id: 1,
    available_locales: ['en-US'],
    translation: {
        image_url: null,
        created_datetime: '2022-03-23T10:34:42.017Z',
        updated_datetime: '2022-03-23T10:34:42.017Z',
        deleted_datetime: null,
        parent_category_id: 47,
        customer_visibility: 'PUBLIC',
        description: '',
        title: 'level 1 - B',
        slug: 'level-1---b',
        category_id: 53,
        category_unlisted_id: 'df865d37bbc74135a355b56c20b40e46',
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [],
    articleCount: 0,
}
const categories: Category[] = [
    rootCategory,
    topLevelCategory,
    level1CategoryWithChildren,
    level2Category,
    level1Category,
]

describe('eligibleParentCategories()', () => {
    it('should return an empty array if the category is undefined', () => {
        expect(
            eligibleParentCategories(categories, 'fr-FR', undefined),
        ).toMatchSnapshot('return non-root categories in the targeted locale')
    })

    it('should return the categories without the children of the provided category', () => {
        expect(
            eligibleParentCategories(categories, 'en-US', topLevelCategory),
        ).toMatchSnapshot('only top level category returned')
    })

    it('should return the categories without the children of the provided level 1 category', () => {
        expect(
            eligibleParentCategories(
                categories,
                'en-US',
                level1CategoryWithChildren,
            ),
        ).toMatchSnapshot('top level and level 1 nodes returned')
    })

    it('should return the categories including the level 2 node because it is not a children of the provided category', () => {
        expect(
            eligibleParentCategories(categories, 'en-US', level1Category),
        ).toMatchSnapshot('top level and level 1 & level 2 nodes returned')
    })
})

describe('isOneOfParentsUnlisted()', () => {
    it('uses customer_visibility on parent categories', () => {
        const parentCategories: Category[] = [
            {
                ...topLevelCategory,
                translation: {
                    ...topLevelCategory.translation!,
                    customer_visibility: 'UNLISTED',
                },
            },
            {
                ...level1CategoryWithChildren,
                translation: {
                    ...level1CategoryWithChildren.translation!,
                    customer_visibility: 'PUBLIC',
                },
            },
            {
                ...level2Category,
                translation: {
                    ...level2Category.translation!,
                    customer_visibility: 'PUBLIC',
                },
            },
        ]

        expect(isOneOfParentsUnlisted(parentCategories, 49)).toBe(true)
    })
})
