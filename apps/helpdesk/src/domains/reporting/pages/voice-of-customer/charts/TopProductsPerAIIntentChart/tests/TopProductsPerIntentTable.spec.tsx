import React from 'react'

import { logEvent } from '@repo/logging'
import { assumeMock, userEvent } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useIntentTicketCountsAndDelta } from 'domains/reporting/hooks/voice-of-customer/useIntentTicketCountsAndDelta'
import { useProductsTicketCountsPerIntentDistribution } from 'domains/reporting/hooks/voice-of-customer/useProductsTicketCountsPerIntentDistribution'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import {
    TopIntentsColumns,
    TopProductsPerIntentColumnConfig,
} from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentConfig'
import { TopProductsPerIntentTable } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerIntentTable'
import { VoCSidePanelTrigger } from 'domains/reporting/pages/voice-of-customer/components/VoCSidePanelTrigger/VoCSidePanelTrigger'
import { useNotify } from 'hooks/useNotify'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('hooks/useNotify')
const useNotifyMock = assumeMock(useNotify)

jest.mock(
    'domains/reporting/hooks/voice-of-customer/useIntentTicketCountsAndDelta',
)
const useIntentTicketCountsAndDeltaMock = assumeMock(
    useIntentTicketCountsAndDelta,
)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModalTrigger')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

jest.mock(
    'domains/reporting/hooks/voice-of-customer/useProductsTicketCountsPerIntentDistribution',
)
const useProductsTicketCountsPerIntentDistributionMock = assumeMock(
    useProductsTicketCountsPerIntentDistribution,
)
jest.mock(
    'domains/reporting/pages/voice-of-customer/components/VoCSidePanelTrigger/VoCSidePanelTrigger',
)
const VoCSidePanelTriggerMock = assumeMock(VoCSidePanelTrigger)
jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)

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

    const mockProductData = [
        {
            name: 'iPhone 15',
            value: 25,
            prevValue: 20,
            productId: 'product-1',
            productUrl: 'https://example.com/iphone.jpg',
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
        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
        useProductsTicketCountsPerIntentDistributionMock.mockReturnValue({
            data: [],
            isFetching: false,
            isError: false,
        })
        VoCSidePanelTriggerMock.mockImplementation(({ children }) => (
            <span>{children}</span>
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
            TopProductsPerIntentColumnConfig[TopIntentsColumns.Intent].title,
        )

        await act(async () => {
            await userEvent.click(headerCell)
        })

        expect(useIntentTicketCountsAndDeltaMock).toHaveBeenCalledWith(
            123,
            OrderDirection.Desc,
            expect.any(String),
        )

        await act(async () => {
            await userEvent.click(headerCell)
        })

        expect(useIntentTicketCountsAndDeltaMock).toHaveBeenCalledWith(
            123,
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

    it('should render intent delta fallback', () => {
        const mockData = [
            {
                category: 'intent1',
                value: '5',
                prevValue: '0',
            },
        ]
        useIntentTicketCountsAndDeltaMock.mockReturnValue({
            data: mockData,
            isFetching: false,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        const undefinedVariationText = screen.getByText('-%')
        expect(undefinedVariationText).toBeInTheDocument()
    })

    it('should render product delta fallback', () => {
        const mockProductData = [
            {
                name: 'iPhone 15',
                value: 25,
                prevValue: 0,
                productId: 'product-1',
                productUrl: 'https://example.com/iphone.jpg',
            },
        ]
        useProductsTicketCountsPerIntentDistributionMock.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        const undefinedVariationText = screen.getByText('-%')
        expect(undefinedVariationText).toBeInTheDocument()
    })

    it('should check the expanded row data', async () => {
        useProductsTicketCountsPerIntentDistributionMock.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        expect(screen.getByText('iPhone 15')).toBeInTheDocument()

        expect(
            useProductsTicketCountsPerIntentDistributionMock,
        ).toHaveBeenCalledWith(123, 'intent1')
    })

    it('should collapse row when expand button is clicked', async () => {
        useProductsTicketCountsPerIntentDistributionMock.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        const collapseButton = screen.getByText('arrow_drop_down')
        await act(async () => {
            await userEvent.click(collapseButton)
        })

        expect(screen.getAllByText('arrow_right')).toHaveLength(2)
        expect(screen.queryByText('arrow_drop_down')).not.toBeInTheDocument()
        expect(screen.queryByText('iPhone 15')).not.toBeInTheDocument()
    })

    it('should expand row when collapsed button is clicked and report a Segment event', async () => {
        useProductsTicketCountsPerIntentDistributionMock.mockReturnValue({
            data: mockProductData,
            isFetching: false,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        const expandButton = screen.getByText('arrow_right')
        await act(async () => {
            await userEvent.click(expandButton)
        })

        expect(screen.getAllByText('arrow_drop_down')).toHaveLength(2)
        expect(logEventMock).toHaveBeenCalled()
    })

    it('should show loading state when expanding row and product data is loading', async () => {
        useProductsTicketCountsPerIntentDistributionMock.mockReturnValue({
            data: [],
            isFetching: true,
            isError: false,
        })

        render(<TopProductsPerIntentTable intentCustomFieldId={123} />)

        expect(screen.getByText('arrow_drop_down')).toBeInTheDocument()
        expect(
            useProductsTicketCountsPerIntentDistributionMock,
        ).toHaveBeenCalledWith(123, 'intent1')
    })
})
