import React, { useEffect, useRef } from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { LineChart } from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { getRGB } from 'gorgias-design-system/utils'
import useAppSelector from 'hooks/useAppSelector'
import { ShopifyIntegration } from 'models/integration/types'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'
import TopElementsCard from 'pages/aiAgent/Onboarding/components/TopElementsCard'
import TopProductsCard from 'pages/aiAgent/Onboarding/components/TopProductsCard'
import TrackerCircleCard from 'pages/aiAgent/Onboarding/components/TrackerCircleCard/TrackerCircleCard'
import { useGetKnowledgePreviewData } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData'
import { useTopLocations } from 'pages/aiAgent/Onboarding/hooks/useTopLocations'
import { getShopifyIntegrationByShopName } from 'state/integrations/selectors'
import { compactInteger } from 'utils'

import css from './KnowledgePreview.less'

const ANIMATION_DURATION = 60000

type Props = {
    shopName: string
}

const KnowledgePreview: React.FC<Props> = ({ shopName }) => {
    const shopifyIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName || ''),
    ).toJS()

    const { data } = useGetKnowledgePreviewData({
        shopIntegrationId: shopifyIntegration.id,
        currency: shopifyIntegration?.meta?.currency,
    })

    const { data: topLocationsData, isLoading: isLoadingTopLocations } =
        useTopLocations({ shopName })

    const graphOptions = {
        elements: {
            point: {
                radius: 0,
            },
            line: {
                tension: 0,
            },
        },
    }

    const averageOrdersCard = (
        <Card className={css.chartCard}>
            <CardHeader>
                <CardTitle>Average order per day</CardTitle>
            </CardHeader>
            <CardContent className={css.chartContent}>
                {data?.averageOrders !== undefined ? (
                    <LineChart
                        data={data.averageOrders}
                        options={graphOptions}
                        customColors={[getRGB('--accessory-magenta-25')]}
                        hasBackground
                    />
                ) : (
                    <Skeleton height="190px" width="300px" />
                )}
            </CardContent>
        </Card>
    )

    const averageOrderValueCard = (
        <TrackerCircleCard
            isLoading={data.isAverageOrderValueLoading}
            percentage={100}
            label={`$${compactInteger(data.averageOrderValue).toString()}`}
            title="Average order value"
        />
    )

    const topProductsCard = (
        <TopProductsCard
            className={css.topProducts}
            title="Top Products"
            isLoading={data.isTopProductsLoading}
            products={data.topProducts}
        />
    )

    const topLocationsCard = (
        <TopElementsCard
            title="Top Locations"
            topElements={topLocationsData ?? []}
            isLoading={isLoadingTopLocations}
        />
    )

    const averageDiscountCard = (
        <TrackerCircleCard
            isLoading={data?.averageDiscount === undefined}
            percentage={data.averageDiscount ?? 0}
            label={`${data?.averageDiscount}%`}
            title="Average discount given"
        />
    )

    const repeatRateCard = (
        <TrackerCircleCard
            isLoading={data.isRepeatRateLoading}
            percentage={data.repeatRate ?? 0}
            label={`${data.repeatRate}%`}
            title="Repeat Rate"
        />
    )

    const topRow = [
        topLocationsCard,
        averageOrderValueCard,
        topProductsCard,
        repeatRateCard,
        averageOrdersCard,
        averageDiscountCard,
    ]

    const bottomRow = [
        topProductsCard,
        repeatRateCard,
        averageOrdersCard,
        averageDiscountCard,
        topLocationsCard,
        averageOrderValueCard,
    ]

    const topRowElement = useRef<HTMLDivElement>(null)
    const bottomRowElement = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const topRow = topRowElement.current
        const bottomRow = bottomRowElement.current

        const scroll = (
            element: HTMLDivElement,
            direction: 'left' | 'right',
        ) => {
            const scrollWidth = element.scrollWidth / 2

            const keyframes =
                direction === 'left'
                    ? [
                          { transform: 'translateX(0)' },
                          { transform: `translateX(-${scrollWidth}px)` },
                      ]
                    : [
                          { transform: `translateX(-${scrollWidth}px)` },
                          { transform: 'translateX(0)' },
                      ]

            const options = {
                duration: ANIMATION_DURATION,
                iterations: Infinity,
            }

            // checks if elemment.animate exists because it doesn't exist in tests
            if (element.animate) element.animate(keyframes, options)
        }

        if (topRow && bottomRow) {
            scroll(topRow, 'left')
            scroll(bottomRow, 'right')
        }
    }, [])

    return (
        <div className={css.preview}>
            <div className={css.row} ref={topRowElement}>
                {topRow}
                {topRow}
            </div>
            <div className={css.row} ref={bottomRowElement}>
                {bottomRow}
                {bottomRow}
            </div>
        </div>
    )
}

export default KnowledgePreview
