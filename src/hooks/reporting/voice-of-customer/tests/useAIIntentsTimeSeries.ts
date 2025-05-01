import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { useAIIntentsTimeSeries } from 'hooks/reporting/voice-of-customer/useAIIntentsTimeSeries'
import { ReportingGranularity } from 'models/reporting/types'
import { TicketTimeReference } from 'models/stat/types'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useCustomFieldsTimeSeries')
const useCustomFieldsTrendMock = assumeMock(useCustomFieldsTimeSeries)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('useAIIntentsTimeSeries', () => {
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
    useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
        intentCustomFieldId: 2,
        outcomeCustomFieldId: 3,
        sentimentCustomFieldId: 4,
    })

    it('should return intents custom field trend', () => {
        const { result } = renderHook(() => useAIIntentsTimeSeries())

        expect(useCustomFieldsTrendMock).toHaveBeenCalledWith({
            selectedCustomFieldId: 2,
            ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
            datasetVisibilityItems: 5,
            topAmount: 5,
        })
        expect(result.current).toEqual(response)
    })
})
