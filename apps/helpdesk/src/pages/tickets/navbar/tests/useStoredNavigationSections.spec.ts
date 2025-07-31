import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import type { AccordionValues } from 'components/Accordion/utils/types'
import type { ViewCategoryNavbar } from 'models/view/types'
import { ViewVisibility } from 'models/view/types'

import { ViewCategories } from '../constants'
import { useStoredNavigationSections } from '../useStoredNavigationSections'

// Mock useLocalStorage
const mockStorage: Record<string, any> = {}
let mockSetCollapsedFirstLevelView = jest.fn()
let mockSetCollapsedSections = jest.fn()

jest.mock('hooks/useLocalStorage', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation((key: string, initialValue: any) => {
        if (!(key in mockStorage)) {
            mockStorage[key] = initialValue
        }

        if (key === 'collapsed-first-level-view') {
            mockSetCollapsedFirstLevelView = jest.fn((value) => {
                mockStorage[key] = value
            })
            return [mockStorage[key], mockSetCollapsedFirstLevelView]
        }
        if (key === 'collapsed-view-sections') {
            mockSetCollapsedSections = jest.fn((value) => {
                mockStorage[key] = value
            })
            return [mockStorage[key], mockSetCollapsedSections]
        }
        // Default mock return for other keys if any
        const setState = jest.fn((value) => {
            mockStorage[key] = value
        })
        return [mockStorage[key], setState]
    }),
}))

describe('useStoredNavigationSections', () => {
    const initialCategories: ViewCategoryNavbar[] = [
        ViewVisibility.Public,
        ViewVisibility.Private,
    ]
    const initialViewCategoryValues: AccordionValues = [
        ViewCategories[ViewVisibility.Public],
        ViewCategories[ViewVisibility.Private],
    ]

    beforeEach(() => {
        // Reset mocks and storage before each test
        jest.clearAllMocks()
        // Reset storage based on hook's logic
        mockStorage['collapsed-first-level-view'] = [
            ...initialViewCategoryValues,
        ]
        mockStorage['collapsed-view-sections'] = []
    })

    it('should initialize with default navigation values based on categories', () => {
        const { result } = renderHook(() =>
            useStoredNavigationSections(initialCategories),
        )

        expect(result.current.navigationValues).toEqual(
            initialViewCategoryValues,
        )
        expect(require('hooks/useLocalStorage').default).toHaveBeenCalledWith(
            'collapsed-first-level-view',
            initialViewCategoryValues,
        )
        expect(require('hooks/useLocalStorage').default).toHaveBeenCalledWith(
            'collapsed-view-sections',
            [],
        )
    })

    it('should update collapsed sections and first level views when handleNavigationStateChange is called', () => {
        const { result } = renderHook(() =>
            useStoredNavigationSections(initialCategories),
        )

        const publicViewName = ViewCategories[ViewVisibility.Public]
        const newNavigationValue: AccordionValues = [
            publicViewName,
            'section-1',
            'section-2',
        ]

        act(() => {
            result.current.handleNavigationStateChange(newNavigationValue)
        })

        expect(mockSetCollapsedFirstLevelView).toHaveBeenCalledWith([
            publicViewName,
        ])
        expect(mockSetCollapsedSections).toHaveBeenCalledWith([
            'section-1',
            'section-2',
        ])

        const expectedCombinedValues = Array.from(
            new Set([
                ...mockStorage['collapsed-view-sections'],
                ...mockStorage['collapsed-first-level-view'],
            ]),
        )

        const { result: updatedResult } = renderHook(() =>
            useStoredNavigationSections(initialCategories),
        )

        expect(updatedResult.current.navigationValues).toEqual(
            expect.arrayContaining(expectedCombinedValues),
        )
        expect(updatedResult.current.navigationValues.length).toBe(
            expectedCombinedValues.length,
        )
    })

    it('should handle removing sections correctly', () => {
        const { result } = renderHook(() =>
            useStoredNavigationSections(initialCategories),
        )

        const publicViewName = ViewCategories[ViewVisibility.Public]
        const privateViewName = ViewCategories[ViewVisibility.Private]

        const firstUpdate: AccordionValues = [
            publicViewName,
            'section-1',
            'section-2',
        ]
        act(() => {
            result.current.handleNavigationStateChange(firstUpdate)
        })

        const secondUpdate: AccordionValues = ['section-1', privateViewName]
        act(() => {
            result.current.handleNavigationStateChange(secondUpdate)
        })

        expect(mockSetCollapsedFirstLevelView).toHaveBeenCalledWith([
            privateViewName,
        ])
        expect(mockSetCollapsedSections).toHaveBeenCalledWith(['section-1'])

        const { result: finalResult } = renderHook(() =>
            useStoredNavigationSections(initialCategories),
        )

        const expectedFinalValues = Array.from(
            new Set(['section-1', privateViewName]),
        )

        expect(finalResult.current.navigationValues).toEqual(
            expect.arrayContaining(expectedFinalValues),
        )
        expect(finalResult.current.navigationValues.length).toBe(
            expectedFinalValues.length,
        )
    })

    it('should return unique values in navigationValues', () => {
        const { result } = renderHook(() =>
            useStoredNavigationSections(initialCategories),
        )

        const publicViewName = ViewCategories[ViewVisibility.Public]
        const duplicateValues: AccordionValues = [
            publicViewName,
            'section-1',
            'section-1',
            publicViewName,
        ]

        act(() => {
            result.current.handleNavigationStateChange(duplicateValues)
        })

        const { result: updatedResult } = renderHook(() =>
            useStoredNavigationSections(initialCategories),
        )

        const expectedUniqueValues = Array.from(
            new Set([publicViewName, 'section-1']),
        )

        expect(updatedResult.current.navigationValues).toEqual(
            expect.arrayContaining(expectedUniqueValues),
        )
        expect(updatedResult.current.navigationValues.length).toBe(
            expectedUniqueValues.length,
        )
    })
})
