import { useEffect, useMemo, useState } from 'react'

import moment from 'moment-timezone'

interface UseWorkflowAnalyticsDisplayBannerProps {
    flowUpdateDatetime: string
    startDatetime: string | null
    hasDataAvailable: boolean
    previousRoute: string
}

export const PERFORMANCE_BY_FEATURE_ROUTE =
    'stats-automate-performance-by-features'

export interface WorkflowAnalyticsDisplayBanner {
    displayMultipleVersionsBanner: boolean
    displayNoDataAvailableBanner: boolean
    displayLegacyDataBanner: boolean
    onClose: () => void
}

const initialBannerState = {
    displayNoDataAvailableBanner: false,
    displayMultipleVersionsBanner: false,
    displayLegacyDataBanner: false,
}

const useWorkflowAnalyticsDisplayBanner = ({
    flowUpdateDatetime,
    startDatetime,
    hasDataAvailable,
    previousRoute,
}: UseWorkflowAnalyticsDisplayBannerProps): WorkflowAnalyticsDisplayBanner => {
    const [banners, setBanners] =
        useState<Omit<WorkflowAnalyticsDisplayBanner, 'onClose'>>(
            initialBannerState,
        )

    const onClose = () => {
        setBanners(initialBannerState)
    }

    useEffect(() => {
        const flowUpdateDate = moment(flowUpdateDatetime)
        const startDate = moment(startDatetime)

        if (!hasDataAvailable) {
            setBanners({
                ...initialBannerState,
                displayNoDataAvailableBanner: true,
            })
        } else if (previousRoute.includes(PERFORMANCE_BY_FEATURE_ROUTE)) {
            if (flowUpdateDate.isAfter(startDate)) {
                setBanners({
                    ...initialBannerState,
                    displayMultipleVersionsBanner: true,
                })
            } else {
                setBanners({
                    ...initialBannerState,
                    displayLegacyDataBanner: true,
                })
            }
        } else {
            setBanners(initialBannerState)
        }
    }, [flowUpdateDatetime, startDatetime, hasDataAvailable, previousRoute])

    return useMemo(() => ({ ...banners, onClose }), [banners])
}

export default useWorkflowAnalyticsDisplayBanner
