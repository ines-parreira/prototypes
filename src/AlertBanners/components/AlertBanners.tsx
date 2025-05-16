import { memo } from 'react'

import { noop } from 'lodash'

import { typeFallbackBanner } from 'AlertBanners/AlertBanner.utils'
import { AlertBanner } from 'AlertBanners/components/AlertBanner'
import { MergedBanner } from 'AlertBanners/Context/types'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { useBannerCarousel } from '../hooks/useBannerCarousel'
import type { ContextBanner } from '../types'
import { CarouselNavigation } from './CarouselNavigation'

const isContextBanner = (banner: MergedBanner): banner is ContextBanner =>
    'instanceId' in banner

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
                        onClose={banner?.onClose ?? noop}
                        isClosable={!!banner?.onClose}
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
                    onClose={selectedBanner?.onClose ?? noop}
                    isClosable={!!selectedBanner?.onClose}
                    CTA={selectedBanner?.CTA}
                    suffix={
                        <CarouselNavigation
                            onPrevious={() => {
                                logEvent(
                                    SegmentEvent.BannerCarouselNavigationClicked,
                                )
                                onPrevious()
                            }}
                            onNext={() => {
                                logEvent(
                                    SegmentEvent.BannerCarouselNavigationClicked,
                                )
                                onNext()
                            }}
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

export default memo(AlertBanners)
