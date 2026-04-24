import { useMemo } from 'react'

import { formatMetricValue } from '@repo/reporting'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { createCsv } from 'utils/file'

import { useSupportAgentChannelPerformanceMetrics } from './useSupportAgentChannelPerformanceMetrics'

const SUPPORT_AGENT_CHANNEL_FILENAME = 'support-agent-channel-performance'

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
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const { data, loadingStates } = useSupportAgentChannelPerformanceMetrics(
        statsFilters,
        userTimezone,
    )

    const isLoading = Object.values(loadingStates).some((state) => state)

    const csvData = useMemo(() => {
        if (!data || data.length === 0) {
            return []
        }

        return [
            ['Channel', 'Handover interactions', 'Snoozed interactions'],
            ...data.map((row) => [
                formatChannelName(row.channel),
                formatMetricValue(row.handoverInteractions, 'decimal'),
                formatMetricValue(row.snoozedInteractions, 'decimal'),
            ]),
        ]
    }, [data])

    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        SUPPORT_AGENT_CHANNEL_FILENAME,
    )

    return {
        files: {
            [fileName]: createCsv(csvData),
        },
        fileName,
        isLoading,
    }
}
