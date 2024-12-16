import {useEffect, useState} from 'react'

import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {StatsFilters} from 'models/stat/types'
import {
    NOT_AVAILABLE_LABEL,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'

type WorkloadData = {
    data: {label: string; value: number}[]
}

type OptionalWorkloadData = {
    data: {label: string; value: number}[] | null
}

export const formatWorkloadData = (
    workloadPerChannel: WorkloadData,
    workloadPerChannelPrevious: OptionalWorkloadData
) => {
    return [
        ...workloadPerChannel.data.map((channelData) => ({
            label: `${WORKLOAD_BY_CHANNEL_LABEL} - ${channelData.label}`,
            value: channelData.value,
            prevValue:
                workloadPerChannelPrevious.data?.find(
                    (row) => row.label === channelData.label
                )?.value || NOT_AVAILABLE_LABEL,
        })),
    ]
}

export const useWorkloadChannelReport = (
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
    fetchingEnabled = true
) => {
    const [workloadChannelData, setWorkloadChannelData] = useState<{
        isFetching: boolean
        data: {
            label: string
            value: number | string | null | undefined
            prevValue: number | string | null | undefined
        }[]
    }>({
        isFetching: true,
        data: [],
    })

    useEffect(() => {
        void Promise.all([
            fetchWorkloadPerChannelDistribution(
                cleanStatsFilters,
                userTimezone
            ),
            fetchingEnabled
                ? fetchWorkloadPerChannelDistributionForPreviousPeriod(
                      cleanStatsFilters,
                      userTimezone
                  )
                : Promise.resolve({data: null}),
        ])
            .then(([workloadPerChannel, workloadPerChannelPrevious]) => {
                setWorkloadChannelData({
                    isFetching: false,
                    data: formatWorkloadData(
                        workloadPerChannel,
                        workloadPerChannelPrevious
                    ),
                })
            })
            .catch(() => setWorkloadChannelData({isFetching: false, data: []}))
    }, [cleanStatsFilters, fetchingEnabled, userTimezone])

    return workloadChannelData
}
