import React from 'react'

import { AlertBanner, AlertBannerTypes } from 'AlertBanners'
import { MergedBanner } from 'AlertBanners/Context/types'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { useBannerCarousel } from '../hooks/useBannerCarousel'
import { ContextBanner } from '../types'
import { CarouselNavigation } from './CarouselNavigation'

const isContextBanner = (banner: MergedBanner): banner is ContextBanner =>
    'instanceId' in banner

export const typeFallbackBanner = (type: AlertBannerTypes | undefined) => {
    if (!type) {
        return AlertBannerTypes.Info
    }

    if (type === AlertBannerTypes.Critical) {
        return AlertBannerTypes.Error
    }

    return type
}

export const AlertBanners = () => {
    const carouselBannerFlag: boolean = useFlag(
        FeatureFlagKey.BannerCarousel,
        false,
    )

    const { currentBannerPosition, onPrevious, onNext, mergedBannersList } =
        useBannerCarousel()

    if (!carouselBannerFlag) {
        return (
            <>
                {mergedBannersList?.map((banner) => (
                    <AlertBanner
                        key={
                            isContextBanner(banner)
                                ? banner?.instanceId
                                : banner?.id
                        }
                        onClose={banner?.onClose}
                        type={typeFallbackBanner(banner?.type)}
                        CTA={banner?.CTA}
                        message={banner?.message}
                    />
                ))}
            </>
        )
    }

    if (mergedBannersList.length === 0) {
        return null
    }

    const selectedBanner = mergedBannersList[currentBannerPosition]

    return (
        <>
            {!!mergedBannersList.length && (
                <AlertBanner
                    type={typeFallbackBanner(selectedBanner?.type)}
                    onClose={selectedBanner?.onClose}
                    CTA={selectedBanner?.CTA}
                    prefix={
                        <CarouselNavigation
                            onPrevious={onPrevious}
                            onNext={onNext}
                            currentIndex={currentBannerPosition + 1}
                            total={mergedBannersList?.length}
                        />
                    }
                    message={selectedBanner?.message}
                />
            )}
        </>
    )
}

export default React.memo(AlertBanners)
