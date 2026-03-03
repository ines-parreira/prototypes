import type React from 'react'

import { renderHook } from '@repo/testing'
import { keyBy as _keyBy } from 'lodash'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Category, NonRootCategory } from 'models/helpCenter/types'
import { HELP_CENTER_DEFAULT_LOCALE } from 'pages/settings/helpCenter/constants'
import { getCategoriesFlatSorted } from 'pages/settings/helpCenter/fixtures/getCategoriesTreeFlatSorted.fixtures'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useHelpCenterIdParam } from 'pages/settings/helpCenter/hooks/useHelpCenterIdParam'
import { isNonRootCategory } from 'state/entities/helpCenter/categories'
import { initialState as helpCenterInitialState } from 'state/entities/helpCenter/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'

import useCategoriesOptions, {
    getCategoryDropdownOption,
} from '../hooks/useCategoriesOptions'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterIdParam')
;(useHelpCenterIdParam as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture.id,
)

const mockFetchCategories = jest.fn().mockResolvedValue(null)

jest.mock('../../../../hooks/useCategoriesActions', () => {
    return {
        useCategoriesActions: () => ({
            fetchCategories: mockFetchCategories,
        }),
    }
})

const categories = getCategoriesFlatSorted

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            ...helpCenterInitialState,
            categories: { categoriesById: _keyBy(categories, 'id') },
        },
    } as any,
    ui: { helpCenter: uiState } as any,
}

const dependencyWrapper: React.ComponentType<any> = ({
    children,
}: {
    children: React.ReactNode
}) => <Provider store={mockStore(defaultState)}>{children}</Provider>

describe('useCategoriesOptions()', () => {
    it('returns the category options', () => {
        const { result } = renderHook(
            () =>
                useCategoriesOptions({
                    locale: HELP_CENTER_DEFAULT_LOCALE,
                }),
            {
                wrapper: dependencyWrapper,
            },
        )

        const actualResult = result.current.map((option) => ({
            id: option.id,
            value: option.value,
            textValue: option.textValue,
        }))

        const expectedResult = [
            {
                id: 'no-category',
                value: null,
                textValue: '- no category -',
            },
            ...categories.filter(isNonRootCategory).map((category) => ({
                id: `category-${category.id}`,
                value: category.id,
                textValue:
                    category.translation.customer_visibility === 'UNLISTED'
                        ? `${category.translation.title} (Unlisted)`
                        : category.translation.title,
            })),
        ]

        expect(actualResult).toEqual(expectedResult)
    })
})

describe('getCategoryDropdownOption', () => {
    const createCategory = (
        overrides: Partial<NonRootCategory['translation']> = {},
    ): NonRootCategory =>
        ({
            id: 1,
            unlisted_id: 'test-unlisted-id',
            help_center_id: 3,
            available_locales: ['en-US'],
            children: [],
            articleCount: 0,
            created_datetime: '2024-01-01T00:00:00Z',
            updated_datetime: '2024-01-01T00:00:00Z',
            deleted_datetime: null,
            translation: {
                title: 'Test Category',
                category_id: 1,
                parent_category_id: null,
                visibility_status: 'PUBLIC',
                customer_visibility: 'PUBLIC',
                ...overrides,
            },
        }) as NonRootCategory

    const emptyCategoriesById: Record<string, Category> = {}

    it('does not append (Unlisted) for PUBLIC customer_visibility', () => {
        const category = createCategory({ customer_visibility: 'PUBLIC' })

        const option = getCategoryDropdownOption(category, emptyCategoriesById)

        expect(option.textValue).toBe('Test Category')
        expect(option.label).toBe('Test Category')
    })

    it('appends (Unlisted) for UNLISTED customer_visibility', () => {
        const category = createCategory({ customer_visibility: 'UNLISTED' })

        const option = getCategoryDropdownOption(category, emptyCategoriesById)

        expect(option.textValue).toBe('Test Category (Unlisted)')
        expect(option.label).toBe('Test Category (Unlisted)')
    })

    it('does not append (Unlisted) when customer_visibility is undefined', () => {
        const category = createCategory({
            customer_visibility: undefined,
        })

        const option = getCategoryDropdownOption(category, emptyCategoriesById)

        expect(option.textValue).toBe('Test Category')
        expect(option.label).toBe('Test Category')
    })

    it('includes (Unlisted) alongside parent info in label', () => {
        const parentCategory = createCategory({
            title: 'Parent',
            category_id: 10,
        })
        const childCategory = createCategory({
            title: 'Child',
            category_id: 1,
            parent_category_id: 10,
            customer_visibility: 'UNLISTED',
        })
        childCategory.id = 1

        const categoriesById: Record<string, Category> = {
            '1': { ...childCategory, children: [], articleCount: 0 },
            '10': {
                ...parentCategory,
                id: 10,
                children: [1],
                articleCount: 0,
            },
        }

        const option = getCategoryDropdownOption(childCategory, categoriesById)

        expect(option.textValue).toBe('Child (Unlisted)')
        expect(option.label).toBe('Child (Unlisted) (Parent)')
    })

    it('only reflects own customer_visibility, not parent', () => {
        const parentCategory = createCategory({
            title: 'Unlisted Parent',
            category_id: 10,
            customer_visibility: 'UNLISTED',
        })
        const childCategory = createCategory({
            title: 'Public Child',
            category_id: 1,
            parent_category_id: 10,
            customer_visibility: 'PUBLIC',
        })
        childCategory.id = 1

        const categoriesById: Record<string, Category> = {
            '1': { ...childCategory, children: [], articleCount: 0 },
            '10': {
                ...parentCategory,
                id: 10,
                children: [1],
                articleCount: 0,
            },
        }

        const option = getCategoryDropdownOption(childCategory, categoriesById)

        expect(option.textValue).toBe('Public Child')
        expect(option.label).toBe('Public Child (Unlisted Parent)')
    })
})
