import React from 'react'

import {CarouselData} from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import {assetsUrl} from 'utils'

export enum ConvertFeatures {
    Default = 'Default',
}

export type PaywallFeature = {
    headerTitle: string
    greyButtonText: string
    primaryButtonText: string
    paywallTitle: string
    descriptions: string[]
    slidesData: CarouselData[]
}

export const PaywallConfig: Record<ConvertFeatures, PaywallFeature> = {
    [ConvertFeatures.Default]: {
        headerTitle: 'Convert',
        greyButtonText: 'Learn more',
        primaryButtonText: 'Select plan to get started',
        paywallTitle:
            'Meet Gorgias Convert - Your onsite revenue generation toolkit 🤩',
        descriptions: [
            'Transform visitors into loyal customers.',
            'Increase average customer spend per order.',
            'Reduce cart abandonment and turn missed opportunities into sales.',
        ],
        slidesData: [
            {
                imageUrl: assetsUrl(
                    '/img/paywalls/screens/convert-tmlewin.png'
                ),
                description: (
                    <>
                        As{' '}
                        <a
                            target="blank"
                            rel="noopener noreferrer"
                            href="https://tmlewin.co.uk/"
                        >
                            T.M.Lewin
                        </a>
                        , encourage customers to add additional products to
                        their carts before completing the order
                    </>
                ),
            },
            {
                imageUrl: assetsUrl('/img/paywalls/screens/convert-tushy.png'),
                description: (
                    <>
                        With everything from welcome to cart abandonment
                        campaigns, get ready to engage shoppers across your
                        entire website and drive revenue, like{' '}
                        <a
                            target="blank"
                            rel="noopener noreferrer"
                            href="https://hellotushy.com/"
                        >
                            Tushy
                        </a>
                    </>
                ),
            },
            {
                imageUrl: assetsUrl('/img/paywalls/screens/convert-setup.png'),
                description:
                    'Set up campaigns in minutes without fussing over code. Deploy campaigns fast and improve your conversion strategy without relying on a developer',
            },
            {
                imageUrl: assetsUrl('/img/paywalls/screens/convert-stats.png'),
                description:
                    'Track performance, test campaigns, and iterate to perfection',
            },
        ],
    },
}
