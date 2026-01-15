import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv } from 'utils/file'

import { useChannelPerformanceMetrics } from './useChannelPerformanceMetrics'

const FILENAME = 'channel-performance-breakdown'

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
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isLoading } = useChannelPerformanceMetrics(
        cleanStatsFilters,
        userTimezone,
    )

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

    const fileName = getCsvFileNameWithDates(cleanStatsFilters.period, FILENAME)

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
