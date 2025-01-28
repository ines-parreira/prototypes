import React from 'react'

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from 'pages/aiAgent/Onboarding/components/Card'

import TopElementsCard from 'pages/aiAgent/Onboarding/components/TopElementsCard'
import TopProductsCard from 'pages/aiAgent/Onboarding/components/TopProductsCard'
import {useGetKnowledgeDatasQuery} from 'pages/aiAgent/Onboarding/hooks/useGetKnowledgeDatasQuery'
import TrackerCircle from 'pages/common/components/ProgressTracker/TrackerCircle'
import {LineChart} from 'pages/stats/common/components/charts/LineChart/LineChart'

import css from './KnowledgePreview.less'

const KnowledgePreview = () => {
    const {data} = useGetKnowledgeDatasQuery()

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

    return (
        <div className={css.preview}>
            <div className={css.row}>
                {topLocationsCard}
                {scoreCard}
                {topProductsCard}
                {repeatRateCard}
                {averageOrdersCard}
                {topCategoriesCard}
                {averageDiscountCard}
            </div>
            <div className={css.row}>
                {topProductsCard}
                {repeatRateCard}
                {averageOrdersCard}
                {topCategoriesCard}
                {averageDiscountCard}
                {topLocationsCard}
                {scoreCard}
            </div>
        </div>
    )
}

export default KnowledgePreview
