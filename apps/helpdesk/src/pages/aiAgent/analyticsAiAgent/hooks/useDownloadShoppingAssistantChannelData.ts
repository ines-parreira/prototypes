import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { createCsv } from 'utils/file'

import { useShoppingAssistantChannelMetrics } from './useShoppingAssistantChannelMetrics'

const SHOPPING_ASSISTANT_CHANNEL_FILENAME =
    'shopping-assistant-channel-performance'

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

export const useDownloadShoppingAssistantChannelData = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data, loadingStates } = useShoppingAssistantChannelMetrics(
        statsFilters,
        userTimezone,
    )

    const isLoading = Object.values(loadingStates).some((state) => state)

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            [
                'Channel',
                'Automation rate',
                'AI Agent interactions share',
                'Automated interactions',
                'Handover',
                'Success rate',
                'Total sales',
                'Orders influenced',
                'Revenue per interaction',
            ],
            ...data.map((row) => [
                formatChannelName(row.channel),
                formatMetricValue(row.automationRate, 'percent-precision-1'),
                formatMetricValue(
                    row.aiAgentInteractionsShare,
                    'percent-precision-1',
                ),
                formatMetricValue(row.automatedInteractions, 'decimal'),
                formatMetricValue(row.handover, 'decimal'),
                formatMetricValue(row.successRate, 'percent-precision-1'),
                formatMetricValue(row.totalSales, 'currency'),
                formatMetricValue(row.ordersInfluenced, 'decimal'),
                formatMetricValue(row.revenuePerInteraction, 'currency'),
            ]),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        SHOPPING_ASSISTANT_CHANNEL_FILENAME,
    )

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
