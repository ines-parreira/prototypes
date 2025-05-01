import { useCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { useTotalProductSentimentTimeSeries } from 'hooks/reporting/voice-of-customer/useTotalProductSentimentTimeSeries'
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

describe('useTotalProductSentimentTimeSeries', () => {
    const sentimentCustomFieldId = 4
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
        sentimentCustomFieldId,
    })

    it('should return intents custom field trend', () => {
        const { result } = renderHook(() =>
            useTotalProductSentimentTimeSeries(),
        )

        expect(useCustomFieldsTrendMock).toHaveBeenCalledWith({
            selectedCustomFieldId: sentimentCustomFieldId,
            ticketFieldsTicketTimeReference: TicketTimeReference.CreatedAt,
            datasetVisibilityItems: 2,
            topAmount: 2,
        })
        expect(result.current).toEqual(response)
    })
})
