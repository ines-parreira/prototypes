import { fireEvent, render, screen } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useReturnMentionsPerProduct } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import {
    useNegativeSentimentsPerProductMetricTrend,
    usePositiveSentimentsPerProductMetricTrend,
    useSentimentPerProduct,
} from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { useTopIntentPerProduct } from 'hooks/reporting/voice-of-customer/useTopIntentPerProduct'
import { ReportingGranularity } from 'models/reporting/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import { WithDrillDownTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { ProductInsightsCellContent } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsCellContent'
import { ProductTableBodyCell } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable'
import { VoCSidePanelTrigger } from 'pages/stats/voice-of-customer/side-panel/VoCSidePanelTrigger'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig',
    () => ({
        ...jest.requireActual(
            'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableConfig',
        ),
        getUseMetricQuery: () => () => ({ data: { value: 123 } }),
        getUseTrendQuery: () => () => ({
            data: { value: 123, prevValue: 321 },
        }),
    }),
)

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)
jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFilterMock = assumeMock(useStatsFilters)
jest.mock('pages/stats/common/components/TrendBadge')
const TrendBadgeMock = assumeMock(TrendBadge)
jest.mock('pages/stats/voice-of-customer/side-panel/VoCSidePanelTrigger')
const VoCSidePanelTriggerMock = assumeMock(VoCSidePanelTrigger)
jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable',
)
const ProductTableBodyCellMock = assumeMock(ProductTableBodyCell)
jest.mock('pages/stats/common/drill-down/DrillDownModalTrigger')
const WithDrillDownTriggerMock = assumeMock(WithDrillDownTrigger)
jest.mock('hooks/reporting/voice-of-customer/useTopIntentPerProduct')
const useTopIntentPerProductMock = assumeMock(useTopIntentPerProduct)
jest.mock('hooks/reporting/voice-of-customer/useSentimentPerProduct')
const useSentimentPerProductMock = assumeMock(useSentimentPerProduct)
const useNegativeSentimentsPerProductMetricTrendMock = assumeMock(
    useNegativeSentimentsPerProductMetricTrend,
)
const usePositiveSentimentsPerProductMetricTrendMock = assumeMock(
    usePositiveSentimentsPerProductMetricTrend,
)
jest.mock('hooks/reporting/voice-of-customer/metricsPerProduct')
const useReturnMentionsPerProductMock = assumeMock(useReturnMentionsPerProduct)

describe('ProductInsightsCellContent', () => {
    const product = {
        id: '1',
        name: 'Product 1',
        thumbnail_url: 'https://via.placeholder.com/150',
    }
    const intent = 'Intent 1'
    const sentimentCustomFieldId = 123
    const intentCustomFieldId = 456
    const negativeSentiment = 5
    const returnMentions = 15

    beforeEach(() => {
        useStatsFilterMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00+01:00',
                    end_datetime: '2024-01-01T23:59:59+01:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        useTopIntentPerProductMock.mockReturnValue({
            data: {
                value: intent,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })
        useSentimentPerProductMock.mockReturnValue({
            data: {
                value: negativeSentiment,
                allData: [] as any,
            },
            isFetching: false,
            isError: false,
        })
        useNegativeSentimentsPerProductMetricTrendMock.mockReturnValue({
            data: {
                value: 5,
                prevValue: 1,
            },
            isFetching: false,
            isError: false,
        })
        usePositiveSentimentsPerProductMetricTrendMock.mockReturnValue({
            data: {
                value: 3,
                prevValue: 2,
            },
            isFetching: false,
            isError: false,
        })
        useReturnMentionsPerProductMock.mockReturnValue({
            data: {
                value: returnMentions,
                decile: 5,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })
        VoCSidePanelTriggerMock.mockImplementation(({ children }) => (
            <span>{children}</span>
        ))

        ProductTableBodyCellMock.mockImplementation(({ children }) => (
            <span>{children}</span>
        ))

        WithDrillDownTriggerMock.mockImplementation(({ children }) => (
            <span>{children}</span>
        ))

        TrendBadgeMock.mockImplementation(({ children }: any) => (
            <span>{children}</span>
        ))

        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: 123,
        } as any)
    })

    describe('ProductCell', () => {
        it('wraps content in a side panel trigger', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Product}
                    product={product}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            expect(VoCSidePanelTriggerMock).toHaveBeenCalled()
        })

        it('renders a product image and name', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Product}
                    product={product}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            const img = screen.getByAltText(product.name) as HTMLImageElement
            expect(img).toBeInTheDocument()
            expect(img.src).toBe(product.thumbnail_url)
            expect(screen.getByAltText(product.name)).toBeInTheDocument()
        })

        it('renders placeholder image is missing', () => {
            const productWithoutThumbnail = {
                ...product,
                thumbnail_url: undefined,
            }

            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Product}
                    product={productWithoutThumbnail}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            const img = screen.getByAltText(product.name) as HTMLImageElement
            expect(img.src).toContain('test-file-stub')
        })

        it('renders placeholder image if product image cannot load', () => {
            const productWithInvalidThumbnail = {
                ...product,
                thumbnail_url: 'missing.png',
            }

            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Product}
                    product={productWithInvalidThumbnail}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            const img = screen.getByAltText(product.name) as HTMLImageElement
            expect(img.src).toContain(productWithInvalidThumbnail.thumbnail_url)

            fireEvent.error(img)

            expect(img.src).toContain('test-file-stub')
        })
    })

    describe('ProductFeedbackCell', () => {
        it('renders product intent', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Feedback}
                    product={product}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            expect(screen.getByText(intent)).toBeInTheDocument()
        })
    })

    describe('MetricCell', () => {
        it('renders metric data', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.NegativeSentiment}
                    product={product}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            expect(screen.getByText(negativeSentiment)).toBeInTheDocument()
        })

        it("wraps content in drill-down trigger if it's supported", () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.NegativeSentiment}
                    product={product}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            expect(WithDrillDownTriggerMock).toHaveBeenCalled()
        })
    })

    describe('TrendCell', () => {
        it('renders a trend badge', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.NegativeSentimentDelta}
                    product={product}
                    sentimentCustomFieldId={sentimentCustomFieldId}
                    intentCustomFieldId={intentCustomFieldId}
                />,
            )

            expect(TrendBadgeMock).toHaveBeenCalled()
        })
    })
})
