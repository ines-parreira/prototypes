import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { useGetHelpCenterArticle } from 'models/helpCenter/queries'

import { useGuidanceArticle } from '../hooks/useGuidanceArticle'

jest.mock('models/helpCenter/queries', () => ({
    useGetHelpCenterArticle: jest.fn(),
    helpCenterKeys: {
        articles: jest.fn(() => ['articles']),
    },
}))

jest.mock('core/flags', () => ({
    useFlag: jest.fn(() => false),
}))

jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        getQueryData: jest.fn(() => undefined),
    }),
}))

const mockedUseGetHelpCenterArticle = jest.mocked(useGetHelpCenterArticle)

describe('useGuidanceArticle', () => {
    const guidanceArticleId = 123
    const guidanceHelpCenterId = 1
    const locale = 'en-US'

    const mockArticleData = {
        id: guidanceArticleId,
        help_center_id: guidanceHelpCenterId,
        unlisted_id: 'test-unlisted-id',
        created_datetime: '2023-01-01T00:00:00Z',
        updated_datetime: '2023-01-02T00:00:00Z',
        available_locales: [locale],
        translation: {
            title: 'Test Article',
            content: 'Test content',
            locale,
            article_id: guidanceArticleId,
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-02T00:00:00Z',
        },
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should fetch guidance article with default versionStatus (current)', async () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
            }),
        )

        await waitFor(() => {
            expect(mockedUseGetHelpCenterArticle).toHaveBeenCalledWith(
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
                'current',
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })

        expect(result.current.guidanceArticle).toBeDefined()
        expect(result.current.isGuidanceArticleLoading).toBe(false)
    })

    it('should fetch guidance article with versionStatus=latest_draft', async () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
                versionStatus: 'latest_draft',
            }),
        )

        await waitFor(() => {
            expect(mockedUseGetHelpCenterArticle).toHaveBeenCalledWith(
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
                'latest_draft',
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })
    })

    it('should fetch guidance article with versionStatus=current', async () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
                versionStatus: 'current',
            }),
        )

        await waitFor(() => {
            expect(mockedUseGetHelpCenterArticle).toHaveBeenCalledWith(
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
                'current',
                expect.objectContaining({
                    enabled: true,
                }),
            )
        })
    })

    it('should not fetch when enabled is false', () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: undefined,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
                enabled: false,
            }),
        )

        expect(mockedUseGetHelpCenterArticle).toHaveBeenCalledWith(
            guidanceArticleId,
            guidanceHelpCenterId,
            locale,
            'current',
            expect.objectContaining({
                enabled: false,
            }),
        )
    })

    it('should return loading state correctly', () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: undefined,
            isLoading: true,
            refetch: refetchMock,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
            }),
        )

        expect(result.current.isGuidanceArticleLoading).toBe(true)
        expect(result.current.guidanceArticle).toBeUndefined()
    })

    it('should return undefined when data is not available', () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: undefined,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
            }),
        )

        expect(result.current.guidanceArticle).toBeUndefined()
        expect(result.current.isGuidanceArticleLoading).toBe(false)
    })

    it('should map article data correctly to guidance article', () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
            }),
        )

        expect(result.current.guidanceArticle).toBeDefined()
        expect(result.current.guidanceArticle?.id).toBe(guidanceArticleId)
    })

    it('should expose refetch function', () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
            }),
        )

        expect(result.current.refetch).toBe(refetchMock)
    })

    it('should update data when refetch is called', async () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        const { result } = renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
            }),
        )

        await act(async () => {
            await result.current.refetch()
        })

        expect(refetchMock).toHaveBeenCalled()
    })

    it('should work with different locales', () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        renderHook(() =>
            useGuidanceArticle({
                guidanceArticleId,
                guidanceHelpCenterId,
                locale: 'fr-FR',
            }),
        )

        expect(mockedUseGetHelpCenterArticle).toHaveBeenCalledWith(
            guidanceArticleId,
            guidanceHelpCenterId,
            'fr-FR',
            'current',
            expect.any(Object),
        )
    })

    it('should pass through all versionStatus values', () => {
        const refetchMock = jest.fn()
        mockedUseGetHelpCenterArticle.mockReturnValue({
            data: mockArticleData,
            isLoading: false,
            refetch: refetchMock,
        } as any)

        const versionStatuses: Array<'current' | 'latest_draft'> = [
            'current',
            'latest_draft',
        ]

        versionStatuses.forEach((versionStatus) => {
            jest.clearAllMocks()

            renderHook(() =>
                useGuidanceArticle({
                    guidanceArticleId,
                    guidanceHelpCenterId,
                    locale,
                    versionStatus,
                }),
            )

            expect(mockedUseGetHelpCenterArticle).toHaveBeenCalledWith(
                guidanceArticleId,
                guidanceHelpCenterId,
                locale,
                versionStatus,
                expect.any(Object),
            )
        })
    })
})
