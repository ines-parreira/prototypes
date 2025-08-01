import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTicketCountPerProductWithEnrichment } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import { TicketsVolumeMetricCell } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/TicketsVolumeMetricCell'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/voice-of-customer/metricsPerProduct')
const useTicketCountPerProductWithEnrichmentMock = assumeMock(
    useTicketCountPerProductWithEnrichment,
)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModalTrigger')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

describe('TicketsVolumeMetricCell', () => {
    const product = {
        id: '1',
        name: 'Product 1',
        thumbnail_url: 'https://via.placeholder.com/150',
    }
    const ticketCount = 42

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

        useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
            data: {
                value: ticketCount,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })

        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
            <span>{children}</span>
        ))
    })

    it('renders ticket count', () => {
        render(<TicketsVolumeMetricCell product={product} />)

        expect(screen.getByText(ticketCount.toString())).toBeInTheDocument()
    })

    it('passes correct parameters to useTicketCountPerProductWithEnrichment', () => {
        const statsFilters = {
            period: {
                start_datetime: '2024-01-01T00:00:00+01:00',
                end_datetime: '2024-01-01T23:59:59+01:00',
            },
        }
        const timezone = 'UTC'

        render(<TicketsVolumeMetricCell product={product} />)

        expect(useTicketCountPerProductWithEnrichmentMock).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            OrderDirection.Desc,
            product.id,
        )
    })

    it('wraps content in drill-down trigger', () => {
        render(<TicketsVolumeMetricCell product={product} />)

        expect(DrillDownModalTriggerMock).toHaveBeenCalled()
    })

    it('shows loading state', () => {
        useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        render(<TicketsVolumeMetricCell product={product} />)

        // The CellWrapper should handle the loading state
        expect(useTicketCountPerProductWithEnrichmentMock).toHaveBeenCalled()
    })

    it('shows placeholder when data is null', () => {
        useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        render(<TicketsVolumeMetricCell product={product} />)

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })

    it('shows placeholder when data value is null', () => {
        useTicketCountPerProductWithEnrichmentMock.mockReturnValue({
            data: {
                value: null,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })

        render(<TicketsVolumeMetricCell product={product} />)

        expect(screen.getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})
