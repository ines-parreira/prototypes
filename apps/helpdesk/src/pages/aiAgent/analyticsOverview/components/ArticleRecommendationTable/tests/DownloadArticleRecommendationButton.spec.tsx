import { render } from '@testing-library/react'

import { DownloadArticleRecommendationButton } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/DownloadArticleRecommendationButton'

const mockDownloadTableButton = jest.fn((__props: unknown) => null)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadArticleRecommendationData',
)

const mockUseDownloadArticleRecommendationData = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownloadArticleRecommendationData',
).useDownloadArticleRecommendationData as jest.Mock

const mockFiles = {
    'report.csv': '"Article recommendation"\r\n"https://example.com/article-1"',
}
const mockFileName = '2024-01-01_2024-01-31-article_recommendation_table.csv'

beforeEach(() => {
    mockUseDownloadArticleRecommendationData.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('DownloadArticleRecommendationButton', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<DownloadArticleRecommendationButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownloadArticleRecommendationData.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<DownloadArticleRecommendationButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<DownloadArticleRecommendationButton />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName:
                    'ai-agent_overview_article-recommendation-table',
            }),
        )
    })
})
