import {
    useNegativeSentimentsPerProductMetricTrend,
    usePositiveSentimentsPerProductMetricTrend,
} from 'domains/reporting/hooks/voice-of-customer/useSentimentPerProduct'
import {
    ticketCountForIntentAndProductDrillDownQueryFactory,
    ticketCountForIntentDrillDownQueryFactory,
} from 'domains/reporting/models/queryFactories/voice-of-customer/ticketCountPerIntent'
import type { InterpretAs } from 'domains/reporting/pages/common/components/TrendBadge'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { MetricTrendFormat } from 'domains/reporting/pages/common/utils'

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
