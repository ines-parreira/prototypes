import {
    useNegativeSentimentsPerProductMetricTrend,
    usePositiveSentimentsPerProductMetricTrend,
} from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import {
    ticketCountForIntentAndProductDrillDownQueryFactory,
    ticketCountForIntentDrillDownQueryFactory,
} from 'models/reporting/queryFactories/voice-of-customer/ticketCountPerIntent'
import { InterpretAs } from 'pages/stats/common/components/TrendBadge'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricTrendFormat } from 'pages/stats/common/utils'

export enum VoiceOfCustomerMetric {
    NegativeSentimentsPerProduct = 'negative_sentiments_per_product',
    PositiveSentimentsPerProduct = 'positive_sentiments_per_product',
}

export enum VoiceOfCustomerMetricWithDrillDown {
    IntentPerProduct = 'intent_per_product',
    IntentPerProducts = 'intent_per_products',
}

const integer: MetricTrendFormat = 'decimal'
const lessIsBetter: InterpretAs = 'less-is-better'
const moreIsBetter: InterpretAs = 'more-is-better'

export const VoiceOfCustomerMetricConfig = {
    [VoiceOfCustomerMetric.NegativeSentimentsPerProduct]: {
        useTrend: useNegativeSentimentsPerProductMetricTrend,
        interpretAs: lessIsBetter,
        metricFormat: integer,
        showMetric: false,
        domain: Domain.Ticket,
    },
    [VoiceOfCustomerMetric.PositiveSentimentsPerProduct]: {
        useTrend: usePositiveSentimentsPerProductMetricTrend,
        interpretAs: moreIsBetter,
        metricFormat: integer,
        showMetric: false,
        domain: Domain.Ticket,
    },
}

export const VoiceOfCustomerMetricWithDrillDownConfig = {
    [VoiceOfCustomerMetricWithDrillDown.IntentPerProduct]: {
        title: 'Intent per product',
        metricFormat: integer,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: ticketCountForIntentAndProductDrillDownQueryFactory,
    },
    [VoiceOfCustomerMetricWithDrillDown.IntentPerProducts]: {
        title: 'Intent per products',
        metricFormat: integer,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: ticketCountForIntentDrillDownQueryFactory,
    },
}
