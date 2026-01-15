import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { createCsv } from 'utils/file'

import { useSupportAgentChannelPerformanceMetrics } from './useSupportAgentChannelPerformanceMetrics'

const FILE_NAME = 'support-agent-channel-performance'

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

export const useDownloadSupportAgentChannelPerformanceData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isLoading } = useSupportAgentChannelPerformanceMetrics(
        cleanStatsFilters,
        userTimezone,
    )

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return null
        }

        const rows: string[][] = [
            ['channel', 'handover_interactions', 'snoozed_interactions'],
        ]

        data.forEach((item) => {
            rows.push([
                formatChannelName(item.channel),
                formatMetricValue(item.handoverInteractions, 'decimal'),
                formatMetricValue(item.snoozedInteractions, 'decimal'),
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
