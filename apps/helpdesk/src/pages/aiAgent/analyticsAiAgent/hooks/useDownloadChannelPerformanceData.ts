import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'
import { createCsv } from '@repo/utils'

import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'

import { useChannelPerformanceMetrics } from './useChannelPerformanceMetrics'

const CHANNEL_PERFORMANCE_FILENAME = 'ai-agent-channel-performance'

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

export const useDownloadChannelPerformanceData = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data, loadingStates } = useChannelPerformanceMetrics(
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
                'Handover interactions',
                'Snoozed interactions',
                'Total sales',
                '% automated by Shopping assistant',
            ],
            ...data.map((row) => [
                formatChannelName(row.channel),
                formatMetricValue(row.handoverInteractions, 'decimal'),
                formatMetricValue(row.snoozedInteractions, 'decimal'),
                formatMetricValue(row.totalSales, 'currency'),
                formatMetricValue(row.automationRate, 'percent-precision-1'),
            ]),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        CHANNEL_PERFORMANCE_FILENAME,
    )

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
