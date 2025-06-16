import { useGetArticleIngestionArticlesTitleAndStatus } from 'models/helpCenter/queries'
import { useGetIngestedUrlArticles } from 'pages/aiAgent/hooks/useGetIngestedUrlArticles'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('models/helpCenter/queries')
const useGetArticleIngestionArticleTitlesMock = jest.mocked(
    useGetArticleIngestionArticlesTitleAndStatus,
)

const helpCenterId = 1
describe('useGetIngestedUrlArticles', () => {
    it('returns data and loading state correctly when query succeeds', () => {
        const mockData = [
            { id: 1, title: 'Article 1', visibilityStatus: 'PUBLIC' },
        ]
        useGetArticleIngestionArticleTitlesMock.mockReturnValue({
            data: mockData,
            isLoading: false,
        } as unknown as ReturnType<
            typeof useGetArticleIngestionArticlesTitleAndStatus
        >)

        const { result } = renderHook(() =>
            useGetIngestedUrlArticles(1, 2, { enabled: true }),
        )

        expect(result.current.data).toEqual(mockData)
        expect(result.current.isLoading).toBe(false)
    })

    it('returns loading state correctly when query is loading', () => {
        useGetArticleIngestionArticleTitlesMock.mockReturnValue({
            data: null,
            isLoading: true,
        } as unknown as ReturnType<
            typeof useGetArticleIngestionArticlesTitleAndStatus
        >)

        const { result } = renderHook(() =>
            useGetIngestedUrlArticles(helpCenterId, 2, { enabled: true }),
        )

        expect(result.current.data).toBeNull()
        expect(result.current.isLoading).toBe(true)
    })
})
