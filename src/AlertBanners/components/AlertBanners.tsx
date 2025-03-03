import React from 'react'

import { Banner } from '@gorgias/merchant-ui-kit'

import { AlertBannerTypes } from 'AlertBanners'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useLegacyAlertBanners from 'notifications/hooks/useLegacyAlertBanners'

import { useBannersContext } from '../Context'
import { useBannerCarousel } from '../hooks/useBannerCarousel'
import { CarouselNavigation } from './CarouselNavigation'
import { CTA } from './CTA'

import css from './AlertBanner.less'

const AlertBanners = () => {
    const legacyBanners = useLegacyAlertBanners()
    const banners = useBannersContext()

    const carouselBannerFlag: boolean = useFlag(
        FeatureFlagKey.BannerCarousel,
        true,
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

    const typeFallbackBanner = (type: AlertBannerTypes | undefined) => {
        if (!type) {
            return AlertBannerTypes.Info
        }

        if (type === AlertBannerTypes.Critical) {
            return AlertBannerTypes.Error
        }
        return type
    }

    if (!carouselBannerFlag) {
        return (
            <>
                {banners?.map((banner) => (
                    <Banner
                        key={banner.instanceId}
                        variant="full"
                        fillStyle="fill"
                        onClose={banner?.onClose}
                        type={typeFallbackBanner(banner?.type)}
                        action={banner?.CTA && <CTA {...banner?.CTA} />}
                    >
                        {banner.message}
                    </Banner>
                ))}
                {legacyBanners?.map((banner) => (
                    <Banner
                        key={banner?.id}
                        onClose={banner?.onClose}
                        variant="full"
                        fillStyle="fill"
                        type={typeFallbackBanner(banner?.type)}
                        action={banner?.CTA && <CTA {...banner?.CTA} />}
                    >
                        {banner?.message}
                    </Banner>
                ))}
            </>
        )
    }

    if (mergedBannersList.length === 0 && !impersonationBanner) {
        return null
    }

    return (
        <>
            {!!mergedBannersList.length && (
                <Banner
                    variant="full"
                    fillStyle="fill"
                    type={typeFallbackBanner(selectedBanner?.type)}
                    onClose={selectedBanner?.onClose}
                    action={
                        selectedBanner?.CTA && <CTA {...selectedBanner?.CTA} />
                    }
                    prefix={
                        <CarouselNavigation
                            onPrevious={onPrevious}
                            onNext={onNext}
                            currentIndex={currentBannerPosition + 1}
                            total={mergedBannersList?.length}
                        />
                    }
                >
                    {selectedBanner?.message}
                </Banner>
            )}
            {impersonationBanner && (
                <Banner
                    variant="full"
                    fillStyle="fill"
                    type={AlertBannerTypes.Warning}
                    onClose={impersonationBanner?.onClose}
                    prefix={<div className={css.impersonationBanner}></div>}
                >
                    {impersonationBanner?.message}
                </Banner>
            )}
        </>
    )
}

export default React.memo(AlertBanners)
