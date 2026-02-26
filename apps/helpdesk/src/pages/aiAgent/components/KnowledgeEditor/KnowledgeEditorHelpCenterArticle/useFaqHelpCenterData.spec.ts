import { renderHook } from '@testing-library/react'

import {
    useGetHelpCenter,
    useGetHelpCenterCategoryTree,
} from 'models/helpCenter/queries'

import { useFaqHelpCenterData } from './useFaqHelpCenterData'

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenter: jest.fn(),
    useGetHelpCenterCategoryTree: jest.fn(),
}))

const mockUseGetHelpCenter = useGetHelpCenter as jest.Mock
const mockUseGetHelpCenterCategoryTree =
    useGetHelpCenterCategoryTree as jest.Mock

const mockHelpCenter = {
    id: 123,
    name: 'Test Help Center',
    default_locale: 'en-US',
}

describe('useFaqHelpCenterData', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseGetHelpCenter.mockReturnValue({
            data: mockHelpCenter,
            isLoading: false,
        })
        mockUseGetHelpCenterCategoryTree.mockReturnValue({
            data: {
                children: [
                    {
                        id: 1,
                        children: [{ id: 11 }, { id: 12 }],
                    },
                    {
                        id: 2,
                        children: [],
                    },
                ],
            },
            isLoading: false,
        })
    })

    it('fetches help center by id', () => {
        renderHook(() => useFaqHelpCenterData(123))

        expect(mockUseGetHelpCenter).toHaveBeenCalledWith(
            123,
            {},
            { enabled: true },
        )
    })

    it('does not fetch help center when id is 0', () => {
        renderHook(() => useFaqHelpCenterData(0))

        expect(mockUseGetHelpCenter).toHaveBeenCalledWith(
            0,
            {},
            { enabled: false },
        )
    })

    it('fetches category tree with correct params', () => {
        renderHook(() => useFaqHelpCenterData(123))

        expect(mockUseGetHelpCenterCategoryTree).toHaveBeenCalledWith(
            123,
            0,
            {
                locale: 'en-US',
                order_by: 'position',
                order_dir: 'asc',
            },
            { enabled: true },
        )
    })

    it('does not fetch category tree when help center is not available', () => {
        mockUseGetHelpCenter.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(() => useFaqHelpCenterData(123))

        expect(mockUseGetHelpCenterCategoryTree).toHaveBeenCalledWith(
            0,
            0,
            expect.objectContaining({ locale: 'en-US' }),
            { enabled: false },
        )
    })

    it('derives categories with mapped children IDs and articleCount: 0', () => {
        const { result } = renderHook(() => useFaqHelpCenterData(123))

        expect(result.current.categories).toHaveLength(2)
        expect(result.current.categories[0]).toEqual(
            expect.objectContaining({
                id: 1,
                children: [11, 12],
                articleCount: 0,
            }),
        )
        expect(result.current.categories[1]).toEqual(
            expect.objectContaining({
                id: 2,
                children: [],
                articleCount: 0,
            }),
        )
    })

    it('returns empty categories when category tree is undefined', () => {
        mockUseGetHelpCenterCategoryTree.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() => useFaqHelpCenterData(123))

        expect(result.current.categories).toEqual([])
    })

    it('derives locales from help center default_locale', () => {
        const { result } = renderHook(() => useFaqHelpCenterData(123))

        expect(result.current.locales).toEqual([
            { code: 'en-US', name: 'en-US' },
        ])
    })

    it('returns empty locales when help center is not available', () => {
        mockUseGetHelpCenter.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(() => useFaqHelpCenterData(123))

        expect(result.current.locales).toEqual([])
    })

    it('returns isLoading true when help center is loading', () => {
        mockUseGetHelpCenter.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useFaqHelpCenterData(123))

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isLoading true when category tree is loading', () => {
        mockUseGetHelpCenterCategoryTree.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(() => useFaqHelpCenterData(123))

        expect(result.current.isLoading).toBe(true)
    })

    it('returns isLoading false when both are loaded', () => {
        const { result } = renderHook(() => useFaqHelpCenterData(123))

        expect(result.current.isLoading).toBe(false)
    })

    it('uses fallback locale en-US when help center locale is undefined', () => {
        mockUseGetHelpCenter.mockReturnValue({
            data: { ...mockHelpCenter, default_locale: undefined },
            isLoading: false,
        })

        renderHook(() => useFaqHelpCenterData(123))

        expect(mockUseGetHelpCenterCategoryTree).toHaveBeenCalledWith(
            123,
            0,
            expect.objectContaining({ locale: 'en-US' }),
            expect.any(Object),
        )
    })
})
