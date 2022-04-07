import {Category} from '../../../../../../models/helpCenter/types'
import {eligibleParentCategories} from '../utils'

const rootCategory: Category = {
    created_datetime: '2022-03-14T13:11:08.813Z',
    updated_datetime: '2022-03-14T13:11:08.813Z',
    deleted_datetime: null,
    id: 0,
    help_center_id: 1,
    available_locales: [],
    translation: null,
    children: [47],
}

const topLevelCategory: Category = {
    created_datetime: '2022-03-17T12:52:14.243Z',
    updated_datetime: '2022-03-17T12:52:14.243Z',
    deleted_datetime: null,
    id: 47,
    help_center_id: 1,
    available_locales: ['en-US', 'fr-FR'],
    translation: {
        created_datetime: '2022-03-17T12:52:14.243Z',
        updated_datetime: '2022-03-17T12:52:14.243Z',
        deleted_datetime: null,
        parent_category_id: null,
        description: '',
        title: 'Top level',
        slug: 'top-level',
        category_id: 47,
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [48, 53],
}

const level1CategoryWithChildren: Category = {
    created_datetime: '2022-03-17T12:52:41.853Z',
    updated_datetime: '2022-03-17T12:52:41.853Z',
    deleted_datetime: null,
    id: 48,
    help_center_id: 1,
    available_locales: ['fr-FR', 'en-US'],
    translation: {
        created_datetime: '2022-03-17T12:53:10.489Z',
        updated_datetime: '2022-03-17T12:53:10.489Z',
        deleted_datetime: null,
        parent_category_id: 47,
        description: '',
        title: 'Level 1',
        slug: 'level-1',
        category_id: 48,
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [49],
}

const level2Category: Category = {
    created_datetime: '2022-03-17T12:53:43.235Z',
    updated_datetime: '2022-03-17T12:54:26.401Z',
    deleted_datetime: null,
    id: 49,
    help_center_id: 1,
    available_locales: ['fr-FR', 'en-US'],
    translation: {
        created_datetime: '2022-03-17T12:53:43.235Z',
        updated_datetime: '2022-03-17T12:54:26.411Z',
        deleted_datetime: null,
        parent_category_id: 48,
        description: '',
        title: 'Level 2',
        slug: 'level-2',
        category_id: 49,
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [50],
}

const level1Category: Category = {
    created_datetime: '2022-03-23T10:34:42.017Z',
    updated_datetime: '2022-03-23T10:34:42.017Z',
    deleted_datetime: null,
    id: 53,
    help_center_id: 1,
    available_locales: ['en-US'],
    translation: {
        created_datetime: '2022-03-23T10:34:42.017Z',
        updated_datetime: '2022-03-23T10:34:42.017Z',
        deleted_datetime: null,
        parent_category_id: 47,
        description: '',
        title: 'level 1 - B',
        slug: 'level-1---b',
        category_id: 53,
        locale: 'en-US',
        seo_meta: {
            title: null,
            description: null,
        },
    },
    children: [],
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
            eligibleParentCategories(categories, 'fr-FR', undefined)
        ).toMatchSnapshot('return non-root categories in the targeted locale')
    })

    it('should return the categories without the children of the provided category', () => {
        expect(
            eligibleParentCategories(categories, 'en-US', topLevelCategory)
        ).toMatchSnapshot('only top level category returned')
    })

    it('should return the categories without the children of the provided level 1 category', () => {
        expect(
            eligibleParentCategories(
                categories,
                'en-US',
                level1CategoryWithChildren
            )
        ).toMatchSnapshot('top level and level 1 nodes returned')
    })

    it('should return the categories including the level 2 node because it is not a children of the provided category', () => {
        expect(
            eligibleParentCategories(categories, 'en-US', level1Category)
        ).toMatchSnapshot('top level and level 1 & level 2 nodes returned')
    })
})
