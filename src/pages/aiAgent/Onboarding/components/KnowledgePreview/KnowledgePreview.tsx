import React, { useEffect, useRef } from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { gorgiasColors } from 'gorgias-design-system/styles'
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
import { useGetAverageOrderValueLastMonth } from 'pages/aiAgent/Onboarding/hooks/useGetAverageOrderValueLastMonth'
import { useGetKnowledgePreviewData } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgePreviewData'
import { useGetRepeatRateLastMonth } from 'pages/aiAgent/Onboarding/hooks/useGetRepeatRateLastMonth'
import TrackerCircle from 'pages/common/components/ProgressTracker/TrackerCircle'
import { LineChart } from 'pages/stats/common/components/charts/LineChart/LineChart'
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
    })
    const { data: repeatRate } = useGetRepeatRateLastMonth({
        shopIntegrationId: shopifyIntegration.id,
    })

    const { data: averageOrderValue, isLoading: isAverageOrderValueLoading } =
        useGetAverageOrderValueLastMonth({
            shopIntegrationId: shopifyIntegration.id,
        })

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
        <Card className={css.score}>
            <CardHeader>
                {isAverageOrderValueLoading && (
                    <Skeleton width={180} height={20} />
                )}
                {!isAverageOrderValueLoading && (
                    <CardTitle>Average order value</CardTitle>
                )}
            </CardHeader>
            <CardContent>
                {isAverageOrderValueLoading && (
                    <Skeleton width={180} height={180} />
                )}
                {!isAverageOrderValueLoading && (
                    <TrackerCircle
                        radius={54}
                        percentage={100}
                        color={gorgiasColors.secondaryOrange}
                        label={compactInteger(averageOrderValue)}
                        strokeWidth={9}
                    />
                )}
            </CardContent>
        </Card>
    )

    const topProductsCard = (
        <TopProductsCard
            className={css.topProducts}
            integration={shopifyIntegration}
            title="Top Products"
        />
    )

    const topLocationsCard = (
        <TopElementsCard
            title="Top Locations"
            topElements={data?.locations ?? []}
        />
    )

    const averageDiscountCard = (
        <Card className={css.score}>
            <CardHeader>
                <CardTitle>Average discount given</CardTitle>
            </CardHeader>
            <CardContent>
                {data?.averageDiscount !== undefined ? (
                    <TrackerCircle
                        radius={54}
                        percentage={data.averageDiscount ?? 0}
                        color={gorgiasColors.secondaryOrange}
                        label={data?.averageDiscount.toString() + '%'}
                        strokeWidth={9}
                    />
                ) : (
                    <Skeleton height="150px" width="175px" />
                )}
            </CardContent>
        </Card>
    )

    const repeatRateCard = (
        <Card className={css.score}>
            <CardHeader>
                <CardTitle>Repeat Rate</CardTitle>
            </CardHeader>
            <CardContent>
                <TrackerCircle
                    radius={54}
                    percentage={repeatRate ?? 0}
                    color={gorgiasColors.secondaryOrange}
                    label={`${repeatRate}%`}
                    strokeWidth={9}
                />
            </CardContent>
        </Card>
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
