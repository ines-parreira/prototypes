import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import { createCsv } from '@repo/utils'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'

import { useShoppingAssistantChannelMetrics } from './useShoppingAssistantChannelMetrics'

const FILE_NAME = 'shopping-assistant-channel-performance'

const formatChannelName = (channel: string): string => {
    const channelNames: Record<string, string> = {
        email: 'Email',
        chat: 'Chat',
        sms: 'SMS',
        'contact-form': 'Contact Form',
        contact_form: 'Contact Form',
        'help-center': 'Help Center',
        voice: 'Voice',
    }
    return channelNames[channel] || channel
}

export const useDownloadShoppingAssistantChannelPerformanceData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isLoading } = useShoppingAssistantChannelMetrics(
        cleanStatsFilters,
        userTimezone,
    )

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return null
        }

        const rows: string[][] = [
            [
                'channel',
                'automation_rate',
                'ai_agent_interactions_share',
                'automated_interactions',
                'handover',
                'success_rate',
                'total_sales',
                'orders_influenced',
                'revenue_per_interaction',
            ],
        ]

        data.forEach((item) => {
            rows.push([
                formatChannelName(item.channel),
                formatMetricValue(item.automationRate, 'percent-precision-1'),
                formatMetricValue(
                    item.aiAgentInteractionsShare,
                    'percent-precision-1',
                ),
                formatMetricValue(item.automatedInteractions, 'decimal'),
                formatMetricValue(item.handover, 'decimal'),
                formatMetricValue(item.successRate, 'percent-precision-1'),
                formatMetricValue(item.totalSales, 'currency'),
                formatMetricValue(item.ordersInfluenced, 'decimal'),
                formatMetricValue(item.revenuePerInteraction, 'currency'),
            ])
        })

        return createCsv(rows)
    }, [data])

    const fileName = getCsvFileNameWithDates(
        cleanStatsFilters.period,
        FILE_NAME,
    )

    const files = useMemo(() => {
        if (!csvData) {
            return {}
        }
        return { [fileName]: csvData }
    }, [csvData, fileName])

    return {
        files,
        isLoading,
    }
}
