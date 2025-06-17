import { useTicketsFieldTimeSeries } from 'hooks/reporting/ticket-insights/useTicketsFieldTimeSeries'
import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { TicketTimeReference } from 'models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useCustomFieldsTimeSeries')
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
            ticketFieldsTicketTimeReference: TicketTimeReference.TaggedAt,
        })
        expect(result.current).toEqual(response)
    })
})
