import React from 'react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'

import { useBannersContext } from '../Context'
import { useBannerCarousel } from '../hooks/useBannerCarousel'
import { AlertBanner } from './AlertBanner'
import { CarouselNavigation } from './CarouselNavigation'

import css from './AlertBanner.less'

const AlertBanners = () => {
    const legacyBanners = useLegacyAlertBanners()
    const banners = useBannersContext()

    const carouselBannerFlag: boolean = useFlag(
        FeatureFlagKey.BannerCarousel,
        false,
    )

    const {
        currentBannerPosition,
        impersonationBanner,
        onPrevious,
        onNext,
        mergedBannersList,
        selectedBanner,
    } = useBannerCarousel({
        legacyBanners,
        banners,
    })

    if (!carouselBannerFlag) {
        return (
            <div>
                {banners?.map((banner) => (
                    <AlertBanner key={banner.instanceId} {...banner} />
                ))}
                {legacyBanners?.map((banner) => (
                    <AlertBanner key={banner.id} {...banner} />
                ))}
            </div>
        )
    }

    if (mergedBannersList.length === 0) {
        return null
    }

    return (
        <div>
            <AlertBanner
                textPosition="left"
                prefix={
                    <CarouselNavigation
                        onPrevious={onPrevious}
                        onNext={onNext}
                        currentIndex={currentBannerPosition + 1}
                        total={mergedBannersList?.length}
                    />
                }
                {...selectedBanner}
            />
            {impersonationBanner && (
                <AlertBanner
                    {...impersonationBanner}
                    textPosition="left"
                    prefix={<div className={css.impersonationBanner}></div>}
                />
            )}
        </div>
    )
}

export default React.memo(AlertBanners)
