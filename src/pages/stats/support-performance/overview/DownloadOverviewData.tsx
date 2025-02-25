import React, { useEffect, useState } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useDownloadOverViewData } from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import { DownloadDataButton } from 'pages/stats/support-performance/components/DownloadDataButton'
import { saveZippedFiles } from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Download Performance Overview Data'

export const DownloadOverviewData = () => {
    const isDeferredLoadingEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsDeferredLoadingExperiment]

    const [fetchingEnabled, setFetchingEnable] = useState(
        isDeferredLoadingEnabled === undefined
            ? false
            : !isDeferredLoadingEnabled,
    )
    useEffect(() => {
        setFetchingEnable(
            isDeferredLoadingEnabled === undefined
                ? false
                : !isDeferredLoadingEnabled,
        )
    }, [isDeferredLoadingEnabled])
    const [waitForTheReportData, setWaitForTheReportData] = useState(false)

    const { files, fileName, isLoading } =
        useDownloadOverViewData(fetchingEnabled)

    useEffect(() => {
        const saveReportAsync = async () => {
            await saveZippedFiles(files, fileName)
        }
        if (fetchingEnabled && !isLoading && waitForTheReportData) {
            void saveReportAsync()
            setFetchingEnable(false)
            setWaitForTheReportData(false)
        }
    }, [fetchingEnabled, isLoading, waitForTheReportData, files, fileName])

    return (
        <DownloadDataButton
            onClick={() => {
                logEvent(SegmentEvent.StatDownloadClicked, {
                    name: 'all-metrics',
                })
                setFetchingEnable(true)
                setWaitForTheReportData(true)
            }}
            disabled={isLoading}
            title={DOWNLOAD_BUTTON_TITLE}
        />
    )
}
