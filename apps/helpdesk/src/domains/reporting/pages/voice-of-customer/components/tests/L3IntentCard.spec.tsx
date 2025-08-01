import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTicketCountPerProduct } from 'domains/reporting/hooks/voice-of-customer/metricsPerProduct'
import { useTicketCountPerIntentForProduct } from 'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { IntentCard } from 'domains/reporting/pages/common/components/IntentCard'
import { useOpenDrillDownModal } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { L3IntentCard } from 'domains/reporting/pages/voice-of-customer/components/L3IntentCard'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

jest.mock('domains/reporting/utils/reporting')
const getPreviousPeriodMock = assumeMock(getPreviousPeriod)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModalTrigger')
const useOpenDrillDownModalMock = assumeMock(useOpenDrillDownModal)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/hooks/voice-of-customer/metricsPerProduct')
const useTicketCountPerProductMock = assumeMock(useTicketCountPerProduct)

jest.mock(
    'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent',
)
const useTicketCountPerIntentForProductMock = assumeMock(
    useTicketCountPerIntentForProduct,
)

jest.mock('domains/reporting/pages/common/components/IntentCard')
const IntentCardMock = assumeMock(IntentCard)

describe('L3IntentCard', () => {
    const periodStart = '2025-06-04T12:00:00.000'
    const periodEnd = '2025-06-11T12:00:00.000'
    const currentPeriod = {
        start_datetime: periodStart,
        end_datetime: periodEnd,
    }
    const cleanStatsFilters: StatsFilters = {
        period: currentPeriod,
    }
    const prevPeriodStart = '2025-05-28T12:00:00.000'
    const prevPeriodEnd = '2025-06-04T12:00:00.000'
    const prevPeriod = {
        start_datetime: prevPeriodStart,
        end_datetime: prevPeriodEnd,
    }
    const userTimezone = 'userTimezone'

    const product = {
        id: '123',
        name: 'SonicWave Pro Noise-Canceling Headphones SWP-NC500',
    }

    const intentCustomFieldId = 456
    const intent =
        'Return::Request::Connection stability issues are causing a lot of frustration for return'

    const ticketCount = 13
    const prevTicketCount = 3
    const totalTicketCount = 31

    const openDrillDownModal = jest.fn()

    beforeEach(() => {
        getPreviousPeriodMock.mockReturnValue(prevPeriod)

        useOpenDrillDownModalMock.mockReturnValue(openDrillDownModal)

        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters,
            userTimezone,
        } as any)

        useTicketCountPerProductMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: totalTicketCount, decile: 1, allData: [] },
        })

        useTicketCountPerIntentForProductMock
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: {
                    value: ticketCount,
                    decile: 1,
                    allData: [
                        { 'TicketProductsEnriched.ticketCount': '13' },
                        { 'TicketProductsEnriched.ticketCount': '5' },
                        { 'TicketProductsEnriched.ticketCount': '2' },
                    ],
                },
            })
            .mockReturnValueOnce({
                isFetching: false,
                isError: false,
                data: { value: prevTicketCount, decile: 1, allData: [] },
            })

        IntentCardMock.mockImplementation(() => <div />)
    })

    it('calls `useTicketCountPerIntentForProduct` with correct arguments', () => {
        const cleanStatsFiltersForPrevPeriod = {
            ...cleanStatsFilters,
            period: prevPeriod,
        }

        render(
            <L3IntentCard
                product={product}
                intentCustomFieldId={intentCustomFieldId}
                intent={intent}
            />,
        )

        expect(useTicketCountPerIntentForProductMock).toHaveBeenCalledTimes(2)
        expect(useTicketCountPerIntentForProductMock).toHaveBeenNthCalledWith(
            1,
            cleanStatsFilters,
            userTimezone,
            intentCustomFieldId,
            product.id,
            undefined,
            intent,
        )
        expect(useTicketCountPerIntentForProductMock).toHaveBeenNthCalledWith(
            2,
            cleanStatsFiltersForPrevPeriod,
            userTimezone,
            intentCustomFieldId,
            product.id,
            undefined,
            intent,
        )
    })

    it('calls `IntentCard` with correct arguments', () => {
        render(
            <L3IntentCard
                product={product}
                intentCustomFieldId={intentCustomFieldId}
                intent={intent}
            />,
        )

        expect(IntentCardMock).toHaveBeenCalledWith(
            {
                intent,
                ticketCount,
                prevTicketCount,
                onViewTickets: expect.any(Function),
                totalTicketCount,
                isLoading: false,
            },
            expect.anything(),
        )
    })
})
