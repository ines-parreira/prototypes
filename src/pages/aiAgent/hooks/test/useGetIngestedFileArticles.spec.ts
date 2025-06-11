import { useGetFileIngestionArticleTitlesAndStatus } from 'models/helpCenter/queries'
import { renderHook } from 'utils/testing/renderHook'

import { useGetIngestedFileArticles } from '../useGetIngestedFileArticles'

jest.mock('models/helpCenter/queries')

const useGetFileIngestionArticleTitlesMock = jest.mocked(
    useGetFileIngestionArticleTitlesAndStatus,
)

describe('useGetIngestedFileArticles', () => {
    it('returns data and loading state correctly when query succeeds', () => {
        const mockData = [
            { id: 1, title: 'File Article 1', visibilityStatus: 'PUBLIC' },
        ]
        useGetFileIngestionArticleTitlesMock.mockReturnValue({
            data: mockData,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGetIngestedFileArticles(1, '2', { enabled: true }),
        )

        expect(result.current.data).toEqual(mockData)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns loading state correctly when query is loading', () => {
        useGetFileIngestionArticleTitlesMock.mockReturnValue({
            data: null,
            isLoading: true,
        } as any)

        const { result } = renderHook(() =>
            useGetIngestedFileArticles(1, '2', { enabled: true }),
        )

        expect(result.current.data).toBeNull()
        expect(result.current.isLoading).toBe(true)
    })

    it('does not fetch data when helpCenterId is missing', () => {
        useGetFileIngestionArticleTitlesMock.mockReturnValue({
            data: null,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGetIngestedFileArticles(undefined as any, '2', {
                enabled: true,
            }),
        )

        expect(result.current.data).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it('does not fetch data when fileIngestionId is missing', () => {
        useGetFileIngestionArticleTitlesMock.mockReturnValue({
            data: null,
            isLoading: false,
        } as any)

        const { result } = renderHook(() =>
            useGetIngestedFileArticles(1, undefined as any, { enabled: true }),
        )

        expect(result.current.data).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })
})
