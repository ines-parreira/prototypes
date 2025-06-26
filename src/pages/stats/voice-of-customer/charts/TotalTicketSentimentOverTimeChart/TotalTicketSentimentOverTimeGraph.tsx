import analyticsColors from 'assets/css/new/stats/modern.json'
import { useSentimentsCustomFieldsTimeSeries } from 'hooks/reporting/useCustomFieldsTimeSeries'
import { Sentiment } from 'models/stat/types'
import { BarChart } from 'pages/stats/common/components/charts/BarChart/BarChart'

export const CHART_COLORS = [
    analyticsColors['analytics'].data.pink.value,
    analyticsColors['analytics'].data['dark-blue'].value,
]

enum SentimentFields {
    Negative = 'negative',
    Positive = 'positive',
}

export const TOTAL_PRODUCTS_SENTIMENTS_CHART_FIELDS = [
    {
        field: SentimentFields.Negative,
        label: 'Negative',
    },
    {
        field: SentimentFields.Positive,
        label: 'Positive',
    },
]

const PRODUCT_SENTIMENT_VALUE_STRINGS = [Sentiment.Negative, Sentiment.Positive]

export const TotalTicketSentimentOverTimeGraph = ({
    sentimentCustomFieldId,
}: {
    sentimentCustomFieldId: number
}) => {
    const { data, isFetching } = useSentimentsCustomFieldsTimeSeries({
        sentimentCustomFieldId,
        sentimentValueStrings: PRODUCT_SENTIMENT_VALUE_STRINGS,
    })

    return (
        <BarChart
            data={data}
            isStacked={true}
            isLoading={isFetching}
            hasBackground
            withTooltipTotal
            displayLegend
            legendOnLeft
            customColors={CHART_COLORS}
        />
    )
}
