import { Sentiments } from 'hooks/reporting/types'
import { useSentimentsCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

export const useTotalProductSentimentTimeSeries = (
    sentimentValueStrings: Sentiments[],
) => {
    const { sentimentCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    return useSentimentsCustomFieldsTimeSeries({
        sentimentCustomFieldId,
        sentimentValueStrings,
    })
}
