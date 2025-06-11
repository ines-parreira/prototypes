import { fireEvent, render, screen } from '@testing-library/react'

import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import TrendBadge from 'pages/stats/common/components/TrendBadge'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
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

jest.mock('hooks/reporting/support-performance/useStatsFilters', () => ({
    useStatsFilters: () => ({
        cleanStatsFilters: {},
        userTimezone: 'UTC',
        granularity: 'day',
    }),
}))

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

jest.mock('pages/stats/common/components/TrendBadge')
const TrendBadgeMock = assumeMock(TrendBadge)

jest.mock('pages/stats/voice-of-customer/side-panel/VoCSidePanelTrigger')
const VoCSidePanelTriggerMock = assumeMock(VoCSidePanelTrigger)

jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductTable',
)
const ProductTableBodyCellMock = assumeMock(ProductTableBodyCell)

jest.mock('pages/stats/common/drill-down/DrillDownModalTrigger')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

describe('ProductInsightsCellContent', () => {
    const product = {
        id: '1',
        name: 'Product 1',
        thumbnail_url: 'https://via.placeholder.com/150',
        intent: 'Intent 1',
    }

    beforeEach(() => {
        VoCSidePanelTriggerMock.mockImplementation(({ children }) => (
            <span>{children}</span>
        ))

        ProductTableBodyCellMock.mockImplementation(({ children }) => (
            <span>{children}</span>
        ))

        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
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
        it('returns `null` when `sentimentCustomFieldId` is missing', () => {
            useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
                sentimentCustomFieldId: null,
            } as any)

            const { container } = render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Product}
                    product={product}
                />,
            )

            expect(container.firstChild).toBeNull()
        })

        it('wraps content in a side panel trigger', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Product}
                    product={product}
                />,
            )

            expect(VoCSidePanelTriggerMock).toHaveBeenCalled()
        })

        it('renders a product image and name', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.Product}
                    product={product}
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
                />,
            )

            expect(screen.getByText(product.intent)).toBeInTheDocument()
        })
    })

    describe('MetricCell', () => {
        it('renders metric data', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.NegativeSentiment}
                    product={product}
                />,
            )

            expect(screen.getByText('123')).toBeInTheDocument()
        })

        it("wraps content in drill-down trigger if it's supported", () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.NegativeSentiment}
                    product={product}
                />,
            )

            expect(DrillDownModalTriggerMock).toHaveBeenCalled()
        })

        it("does not wrap content in drill-down trigger if it's not supported", () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.ReturnMentions}
                    product={product}
                />,
            )

            expect(DrillDownModalTriggerMock).not.toHaveBeenCalled()
        })
    })

    describe('TrendCell', () => {
        it('renders a trend badge', () => {
            render(
                <ProductInsightsCellContent
                    column={ProductInsightsTableColumns.NegativeSentimentDelta}
                    product={product}
                />,
            )

            expect(TrendBadgeMock).toHaveBeenCalled()
        })
    })
})
