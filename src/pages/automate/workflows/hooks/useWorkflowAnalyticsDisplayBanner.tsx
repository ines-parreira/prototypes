import {useState, useEffect} from 'react'

interface WorkflowAnalyticsDisplayBanner {
    displayMultipleVersionsBanner: boolean
    displayNoDataAvailableBanner: boolean
    displayLegacyDataBanner: boolean
}

interface UseWorkflowAnalyticsDisplayBannerProps {
    flowUpdateDatetime: string
    startDatetime: string
    hasDataAvailable: boolean
    previousRoute: string
}

export const PERFORMANCE_BY_FEATURE_ROUTE = 'app/stats/performance-by-features'
export const FLOWS_EDITOR_ROUTE = '/flows/edit/'

const useWorkflowAnalyticsDisplayBanner = ({
    flowUpdateDatetime,
    startDatetime,
    hasDataAvailable,
    previousRoute,
}: UseWorkflowAnalyticsDisplayBannerProps): WorkflowAnalyticsDisplayBanner => {
    const [displayMultipleVersionsBanner, setDisplayMultipleVersionsBanner] =
        useState<boolean>(false)
    const [displayNoDataAvailableBanner, setDisplayNoDataAvailableBanner] =
        useState<boolean>(false)
    const [displayLegacyDataBanner, setDisplayLegacyDataBanner] =
        useState<boolean>(false)

    const updateBanners = (banners: {
        noData: boolean
        multipleVersions: boolean
        legacyData: boolean
    }) => {
        setDisplayNoDataAvailableBanner(banners.noData)
        setDisplayMultipleVersionsBanner(banners.multipleVersions)
        setDisplayLegacyDataBanner(banners.legacyData)
    }

    useEffect(() => {
        const flowUpdateDate = new Date(flowUpdateDatetime)
        const startDate = new Date(startDatetime)

        if (!hasDataAvailable) {
            updateBanners({
                noData: true,
                multipleVersions: false,
                legacyData: false,
            })
        } else if (previousRoute.includes(PERFORMANCE_BY_FEATURE_ROUTE)) {
            if (flowUpdateDate > startDate) {
                updateBanners({
                    noData: false,
                    multipleVersions: false,
                    legacyData: true,
                })
            } else {
                updateBanners({
                    noData: false,
                    multipleVersions: true,
                    legacyData: false,
                })
            }
        } else {
            if (flowUpdateDate > startDate) {
                updateBanners({
                    noData: false,
                    multipleVersions: false,
                    legacyData: false,
                })
            } else {
                updateBanners({
                    noData: false,
                    multipleVersions: true,
                    legacyData: false,
                })
            }
        }
    }, [flowUpdateDatetime, startDatetime, hasDataAvailable, previousRoute])

    return {
        displayMultipleVersionsBanner,
        displayNoDataAvailableBanner,
        displayLegacyDataBanner,
    }
}

export default useWorkflowAnalyticsDisplayBanner
