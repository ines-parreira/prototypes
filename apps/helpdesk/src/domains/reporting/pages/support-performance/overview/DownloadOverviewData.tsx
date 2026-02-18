import { useEffect, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

import { useDownloadOverViewData } from 'domains/reporting/hooks/support-performance/overview/useDownloadOverviewData'
import { DownloadDataButton } from 'domains/reporting/pages/support-performance/components/DownloadDataButton'
import { saveZippedFiles } from 'utils/file'

const DOWNLOAD_BUTTON_TITLE = 'Download Performance Overview Data'

export const DownloadOverviewData = () => {
    const isDeferredLoadingEnabled = useFlag<boolean | null>(
        FeatureFlagKey.AnalyticsDeferredLoadingExperiment,
        null,
    )

    const [fetchingEnabled, setFetchingEnable] = useState(
        isDeferredLoadingEnabled === null ? false : !isDeferredLoadingEnabled,
    )
    useEffect(() => {
        setFetchingEnable(
            isDeferredLoadingEnabled === null
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
