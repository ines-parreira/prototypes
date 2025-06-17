import { useSentimentsCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { Sentiment } from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'

export const useTotalProductSentimentTimeSeries = (
    sentimentCustomFieldId: number,
    sentimentValueStrings: Sentiment[],
) => {
    return useSentimentsCustomFieldsTimeSeries({
        sentimentCustomFieldId,
        sentimentValueStrings,
    })
}
