import { assumeMock, renderHook } from '@repo/testing'

import { useTicketsFieldTimeSeries } from 'domains/reporting/hooks/ticket-insights/useTicketsFieldTimeSeries'
import { useCustomFieldsTimeSeries } from 'domains/reporting/hooks/useCustomFieldsTimeSeries'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/useCustomFieldsTimeSeries')
const useCustomFieldsTrendMock = assumeMock(useCustomFieldsTimeSeries)

describe('useTicketsFieldTimeSeries', () => {
    const response: ReturnType<typeof useCustomFieldsTimeSeries> = {
        isFetching: false,
        data: [],
        granularity: ReportingGranularity.Hour,
        legendInfo: {
            labels: ['Subcategory'],
            tooltips: ['Category > Subcategory'],
        },
        legendDatasetVisibility: { 0: true },
    }

    useCustomFieldsTrendMock.mockReturnValue(response)

    it('should return tickets trend', () => {
        const { result } = renderHook(() => useTicketsFieldTimeSeries(2))

        expect(useCustomFieldsTrendMock).toHaveBeenCalledWith({
            selectedCustomFieldId: 2,
            ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
        })
        expect(result.current).toEqual(response)
    })
})
