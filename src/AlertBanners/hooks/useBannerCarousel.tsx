import { useCallback, useEffect, useMemo, useState } from 'react'

import { MergedBanner } from 'AlertBanners/Context/types'

import useLegacyAlertBanners from '../../notifications/hooks/useLegacyAlertBanners'
import { useBannersContext } from '../Context'

export const useBannerCarousel = () => {
    const legacyBanners = useLegacyAlertBanners()
    const banners = useBannersContext()

    const mergedBannersList = useMemo<MergedBanner[]>(() => {
        return [...legacyBanners, ...banners]
    }, [legacyBanners, banners])

    const [currentBannerPosition, setCurrentBannerPosition] =
        useState<number>(0)

    useEffect(() => {
        setCurrentBannerPosition((prev) =>
            Math.max(0, Math.min(prev, mergedBannersList.length - 1)),
        )
    }, [mergedBannersList.length])

    const onPrevious = useCallback(() => {
        setCurrentBannerPosition((prev) => {
            if (prev === 0) {
                return mergedBannersList.length - 1
            }
            return prev - 1
        })
    }, [mergedBannersList.length])

    const onNext = useCallback(() => {
        setCurrentBannerPosition((prev) => {
            if (prev === mergedBannersList.length - 1) {
                return 0
            }
            return prev + 1
        })
    }, [mergedBannersList.length])

    return {
        currentBannerPosition,
        onPrevious,
        onNext,
        mergedBannersList,
    }
}
