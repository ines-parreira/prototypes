import { useCallback, useEffect, useState } from 'react'

import { BannerNotification } from '../../state/notifications/types'
import { BannerCategories, ContextBanner } from '../types'

type UseBannerCarouselProps = {
    legacyBanners: BannerNotification[]
    banners: ContextBanner[]
}

export const useBannerCarousel = ({
    legacyBanners,
    banners,
}: UseBannerCarouselProps) => {
    const [mergedBannersList, setMergedBannersList] = useState<
        (BannerNotification | ContextBanner)[]
    >([])

    const [currentBannerPosition, setCurrentBannerPosition] =
        useState<number>(0)

    const [impersonationBanner, setImpersonationBanner] =
        useState<ContextBanner | null>(null)

    useEffect(() => {
        if (mergedBannersList.length === 1) {
            setCurrentBannerPosition(0)
        }
    }, [mergedBannersList.length])

    useEffect(() => {
        const updatedBanners = [...legacyBanners, ...banners]
        const impersonationIndex = updatedBanners?.findIndex(
            (banner) =>
                'instanceId' in banner &&
                banner?.category === BannerCategories.IMPERSONATION,
        )

        if (impersonationIndex !== -1) {
            setImpersonationBanner(
                updatedBanners[impersonationIndex] as ContextBanner,
            )
            updatedBanners.splice(impersonationIndex, 1)
        }

        setMergedBannersList([...updatedBanners])
    }, [legacyBanners, banners])

    const selectedBanner = mergedBannersList[currentBannerPosition]

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
        impersonationBanner,
        selectedBanner,
        onPrevious,
        onNext,
        mergedBannersList,
    }
}
