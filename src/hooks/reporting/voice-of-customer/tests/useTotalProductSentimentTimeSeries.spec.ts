import { Sentiments } from 'hooks/reporting/types'
import { useSentimentsCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { useTotalProductSentimentTimeSeries } from 'hooks/reporting/voice-of-customer/useTotalProductSentimentTimeSeries'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('hooks/reporting/useCustomFieldsTimeSeries')
const useCustomFieldsTrendMock = assumeMock(useSentimentsCustomFieldsTimeSeries)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('useTotalProductSentimentTimeSeries', () => {
    const sentimentCustomFieldId = 4
    const response = {
        isFetching: false,
        isError: false,
        data: [],
    }

    useCustomFieldsTrendMock.mockReturnValue(response)
    useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
        intentCustomFieldId: 2,
        outcomeCustomFieldId: 3,
        sentimentCustomFieldId,
    })

    it('should return intents custom field trend', () => {
        const { result } = renderHook(() =>
            useTotalProductSentimentTimeSeries([
                Sentiments.Negative,
                Sentiments.Positive,
            ]),
        )

        expect(useCustomFieldsTrendMock).toHaveBeenCalledWith({
            sentimentCustomFieldId: sentimentCustomFieldId,
            sentimentValueStrings: [Sentiments.Negative, Sentiments.Positive],
        })

        expect(result.current).toEqual(response)
    })
})
