import { useNegativeSentimentsPerProductMetricTrend } from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { InterpretAs } from 'pages/stats/common/components/TrendBadge'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricTrendFormat } from 'pages/stats/common/utils'

export enum VoiceOfCustomerMetric {
    NegativeSentimentsPerProduct = 'negative_sentiments_per_product',
}

const integer: MetricTrendFormat = 'decimal'
const lessIsBetter: InterpretAs = 'less-is-better'

export const VoiceOfCustomerMetricConfig = {
    [VoiceOfCustomerMetric.NegativeSentimentsPerProduct]: {
        title: 'Negative sentiments',
        hint: {
            title: 'AI classified negative sentiment including threatening, negative, and offensive categorizations.',
        },
        useTrend: useNegativeSentimentsPerProductMetricTrend,
        interpretAs: lessIsBetter,
        metricFormat: integer,
        showMetric: false,
        domain: Domain.Ticket,
    },
}
