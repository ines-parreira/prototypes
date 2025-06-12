import React from 'react'

import { act, render, screen } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { useIntentTicketCountsAndDelta } from 'hooks/reporting/voice-of-customer/useIntentTicketCountsAndDelta'
import { useNotify } from 'hooks/useNotify'
import { OrderDirection } from 'models/api/types'
import { ReportingGranularity } from 'models/reporting/types'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { TableLoadingFallback } from 'pages/stats/ticket-insights/ticket-fields/TableLoadingFallback'
import {
    TopProductsPerIntentColumn,
    TopProductsPerIntentColumnConfig,
} from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentConfig'
import { TopProductsPerIntentTable } from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentTable'
import { assumeMock } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

jest.mock('hooks/reporting/voice-of-customer/useIntentTicketCountsAndDelta')
const useIntentTicketCountsAndDeltaMock = assumeMock(
    useIntentTicketCountsAndDelta,
)
jest.mock('pages/stats/ticket-insights/ticket-fields/TableLoadingFallback')
const TableLoadingFallbackMock = assumeMock(TableLoadingFallback)

jest.mock('pages/stats/common/drill-down/DrillDownModalTrigger')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

describe('TopProductsPerIntentTable', () => {
    const statsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    const notifyMock = jest.fn()
    const mockData = [
        {
            category: 'intent1',
            value: '50',
            prevValue: '40',
        },
        {
            category: 'intent2',
            value: '30',
            prevValue: '25',
        },
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: statsFilters,
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        useNotifyMock.mockReturnValue({ info: notifyMock } as any)
        useIntentTicketCountsAndDeltaMock.mockReturnValue({
            data: mockData,
            isFetching: false,
            isError: false,
        })
        TableLoadingFallbackMock.mockReturnValue(<div>Loading...</div>)
        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
    })

    it('should render data correctly', () => {
        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        expect(screen.getByText('Intent Topic')).toBeInTheDocument()
        expect(screen.getByText('Ticket Volume')).toBeInTheDocument()
        expect(screen.getByText('Delta')).toBeInTheDocument()

        expect(screen.getByText('intent1')).toBeInTheDocument()
        expect(screen.getByText('intent2')).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()

        expect(screen.getByText('25%')).toBeInTheDocument()
        expect(screen.getByText('20%')).toBeInTheDocument()
    })

    it('should show loading state', () => {
        useIntentTicketCountsAndDeltaMock.mockReturnValue({
            data: [],
            isFetching: true,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('should show no data state', () => {
        useIntentTicketCountsAndDeltaMock.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should show error state', () => {
        useIntentTicketCountsAndDeltaMock.mockReturnValue({
            data: [],
            isFetching: false,
            isError: true,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('should handle sorting in both directions', async () => {
        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        const headerCell = screen.getByText(
            TopProductsPerIntentColumnConfig[TopProductsPerIntentColumn.Intent]
                .title,
        )

        await act(async () => {
            await userEvent.click(headerCell)
        })

        expect(useIntentTicketCountsAndDeltaMock).toHaveBeenCalledWith(
            '123',
            OrderDirection.Desc,
            expect.any(String),
        )

        await act(async () => {
            await userEvent.click(headerCell)
        })

        expect(useIntentTicketCountsAndDeltaMock).toHaveBeenCalledWith(
            '123',
            OrderDirection.Asc,
            expect.any(String),
        )
    })

    it('should render trend indicators correctly', () => {
        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        const positiveTrend = screen.getByText('25%')
        expect(positiveTrend).toBeInTheDocument()

        const negativeTrend = screen.getByText('20%')
        expect(negativeTrend).toBeInTheDocument()
    })
})
