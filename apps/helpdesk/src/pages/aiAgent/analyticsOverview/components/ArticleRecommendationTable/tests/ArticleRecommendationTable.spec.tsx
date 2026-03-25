import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { ArticleRecommendationTable } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/ArticleRecommendationTable'
import { ARTICLE_RECOMMENDATION_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import type { ArticleRecommendationRow } from 'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/DownloadArticleRecommendationButton',
    () => ({
        DownloadArticleRecommendationButton: () => (
            <div>Download Article Recommendation</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics',
)

const mockUseArticleRecommendationMetrics = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics',
).useArticleRecommendationMetrics as jest.Mock

const defaultLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
}

const defaultData: ArticleRecommendationRow[] = [
    {
        entity: 'https://example.com/article-1',
        automationRate: 75,
        automatedInteractions: 150,
        handoverInteractions: 50,
    },
    {
        entity: 'https://example.com/article-2',
        automationRate: 60,
        automatedInteractions: 90,
        handoverInteractions: 60,
    },
]

const defaultDisplayNames: Record<string, string> = {
    'https://example.com/article-1': 'Article One',
    'https://example.com/article-2': 'Article Two',
}

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
    displayNames = defaultDisplayNames,
) => {
    mockUseArticleRecommendationMetrics.mockReturnValue({
        data,
        loadingStates,
        displayNames,
        isLoading: false,
        isError: false,
    })
    return render(<ArticleRecommendationTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: ArticleRecommendationRow[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: ArticleRecommendationRow) => string
        DownloadButton: React.ReactNode
        nameColumns: {
            accessor: string
            label: string
            displayNames?: Record<string, string>
            getHref?: (value: string) => string | undefined
        }[]
    }

describe('ArticleRecommendationTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useArticleRecommendationMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes ARTICLE_RECOMMENDATION_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            ARTICLE_RECOMMENDATION_COLUMNS,
        )
    })

    it('passes getRowKey that returns the entity value', () => {
        renderComponent()

        const { getRowKey } = getLastCallProps()
        expect(getRowKey(defaultData[0])).toBe('https://example.com/article-1')
    })

    it('passes nameColumns with entity accessor, Article name label, displayNames, and getHref', () => {
        renderComponent()

        const nameColumn = getLastCallProps().nameColumns[0]
        expect(nameColumn.accessor).toBe('entity')
        expect(nameColumn.label).toBe('Article name')
        expect(nameColumn.displayNames).toBe(defaultDisplayNames)
        expect(nameColumn.getHref?.('https://example.com/article-1')).toBe(
            'https://example.com/article-1',
        )
    })

    it('passes displayNames from the hook dynamically', () => {
        const displayNames = { 'https://example.com/new': 'New Article' }
        mockUseArticleRecommendationMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
            displayNames,
            isLoading: false,
            isError: false,
        })
        render(<ArticleRecommendationTable />)

        expect(getLastCallProps().nameColumns[0].displayNames).toBe(
            displayNames,
        )
    })

    it('renders DownloadArticleRecommendationButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Article Recommendation'),
        ).toBeInTheDocument()
    })
})
