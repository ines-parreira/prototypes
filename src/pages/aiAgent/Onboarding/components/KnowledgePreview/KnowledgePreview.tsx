import React, { useEffect, useRef } from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'
import TopElementsCard from 'pages/aiAgent/Onboarding/components/TopElementsCard'
import TopProductsCard from 'pages/aiAgent/Onboarding/components/TopProductsCard'
import { useGetKnowledgeDatasQuery } from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeDatasQuery'
import TrackerCircle from 'pages/common/components/ProgressTracker/TrackerCircle'
import { LineChart } from 'pages/stats/common/components/charts/LineChart/LineChart'

import css from './KnowledgePreview.less'

const ANIMATION_DURATION = 60000

const KnowledgePreview = () => {
    const { data } = useGetKnowledgeDatasQuery()

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
                <LineChart
                    data={data?.averageOrders ?? []}
                    options={graphOptions}
                    customColors={['#C34CED']}
                    hasBackground
                />
            </CardContent>
        </Card>
    )

    const scoreCard = (
        <Card className={css.score}>
            <CardHeader>
                <CardTitle>Experience score</CardTitle>
            </CardHeader>
            <CardContent>
                <TrackerCircle
                    radius={54}
                    percentage={data?.experienceScore ?? 0}
                    color="#FD9B5A"
                    backgroundColor="#FD9B5A3D"
                    label={data?.experienceScore.toString()}
                    strokeWidth={9}
                />
            </CardContent>
        </Card>
    )

    const topProductsCard = (
        <TopProductsCard
            className={css.topProducts}
            title="Top Products"
            products={data?.products ?? []}
        />
    )

    const topLocationsCard = (
        <TopElementsCard
            title="Top Locations"
            topElements={data?.locations ?? []}
        />
    )

    const topCategoriesCard = (
        <TopElementsCard
            title="Top Categories"
            topElements={data?.categories ?? []}
        />
    )

    const averageDiscountCard = (
        <Card className={css.score}>
            <CardHeader>
                <CardTitle>Average discount given</CardTitle>
            </CardHeader>
            <CardContent>
                <TrackerCircle
                    radius={54}
                    percentage={data?.averageDiscount ?? 0}
                    color="#FD9B5A"
                    backgroundColor="#FD9B5A3D"
                    label={data?.averageDiscount.toString()}
                    strokeWidth={9}
                />
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
                    percentage={data?.repeatRate ?? 0}
                    color="#FD9B5A"
                    backgroundColor="#FD9B5A3D"
                    label={data?.repeatRate.toString()}
                    strokeWidth={9}
                />
            </CardContent>
        </Card>
    )

    const topRow = [
        topLocationsCard,
        scoreCard,
        topProductsCard,
        repeatRateCard,
        averageOrdersCard,
        topCategoriesCard,
        averageDiscountCard,
    ]

    const bottomRow = [
        topProductsCard,
        repeatRateCard,
        averageOrdersCard,
        topCategoriesCard,
        averageDiscountCard,
        topLocationsCard,
        scoreCard,
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
