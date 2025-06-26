import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useReturnMentionsPerProduct } from 'hooks/reporting/voice-of-customer/metricsPerProduct'
import { OrderDirection } from 'models/api/types'
import { ReportingGranularity } from 'models/reporting/types'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import { ReturnMentionsMetricCell } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ReturnMentionsMetricCell'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('hooks/reporting/voice-of-customer/metricsPerProduct')
const useReturnMentionsPerProductMock = assumeMock(useReturnMentionsPerProduct)

jest.mock('pages/stats/common/drill-down/DrillDownModalTrigger')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

describe('ReturnMentionsMetricCell', () => {
    const product = {
        id: '1',
        name: 'Product 1',
        thumbnail_url: 'https://via.placeholder.com/150',
    }
    const intentCustomFieldId = 456
    const returnMentionsValue = 15

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01T00:00:00+01:00',
                    end_datetime: '2024-01-01T23:59:59+01:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        useReturnMentionsPerProductMock.mockReturnValue({
            data: {
                value: returnMentionsValue,
                decile: 4,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })

        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
            <span>{children}</span>
        ))
    })

    it('renders return mentions value', () => {
        render(
            <ReturnMentionsMetricCell
                product={product}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

        expect(
            screen.getByText(returnMentionsValue.toString()),
        ).toBeInTheDocument()
    })

    it('passes correct parameters to useReturnMentionsPerProduct', () => {
        const statsFilters = {
            period: {
                start_datetime: '2024-01-01T00:00:00+01:00',
                end_datetime: '2024-01-01T23:59:59+01:00',
            },
        }
        const timezone = 'UTC'

        render(
            <table>
                <tbody>
                    <tr>
                        <ReturnMentionsMetricCell
                            product={product}
                            intentCustomFieldId={intentCustomFieldId}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(useReturnMentionsPerProductMock).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            intentCustomFieldId,
            OrderDirection.Desc,
            product.id,
        )
    })

    it('wraps content in drill-down trigger with correct metric data', () => {
        render(
            <table>
                <tbody>
                    <tr>
                        <ReturnMentionsMetricCell
                            product={product}
                            intentCustomFieldId={intentCustomFieldId}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(DrillDownModalTriggerMock).toHaveBeenCalledWith(
            expect.objectContaining({
                metricData: {
                    metricName: ProductInsightsTableColumns.ReturnMentions,
                    productId: product.id,
                    intentCustomFieldId,
                },
            }),
            expect.anything(),
        )
    })

    it('shows loading state', () => {
        useReturnMentionsPerProductMock.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        render(
            <table>
                <tbody>
                    <tr>
                        <ReturnMentionsMetricCell
                            product={product}
                            intentCustomFieldId={intentCustomFieldId}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(useReturnMentionsPerProductMock).toHaveBeenCalled()
    })

    it('shows placeholder when data is null', () => {
        useReturnMentionsPerProductMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        render(
            <table>
                <tbody>
                    <tr>
                        <ReturnMentionsMetricCell
                            product={product}
                            intentCustomFieldId={intentCustomFieldId}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('shows placeholder when data value is null', () => {
        useReturnMentionsPerProductMock.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })

        render(
            <table>
                <tbody>
                    <tr>
                        <ReturnMentionsMetricCell
                            product={product}
                            intentCustomFieldId={intentCustomFieldId}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
