import React, { useState } from 'react'

import { TopProductRecommendationTableStats } from 'pages/stats/aiSalesAgent/components/TopProductRecommendationTableStats'
import { ProductTableContentCell } from 'pages/stats/aiSalesAgent/types/productTable'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/custom-reports/types'

import { ProductTableKeys } from '../constants'

const ITEMS_PER_PAGE = 10

const TopProductRecommendationTable = ({
    chartId,
    dashboard,
}: DashboardChartProps) => {
    const rows: ProductTableContentCell[] = Array.from(
        { length: 20 },
        (_, index) => ({
            product: {
                id: index + 1,
                title: `Product ${index + 1}`,
                handle: `product-${index + 1}`,
                image: null,
                created_at: new Date().toISOString(),
                variants: [],
                images: [],
                options: [],
            },
            metrics: {
                [ProductTableKeys.NumberOfRecommendations]: index,
                [ProductTableKeys.CTR]: (100 - index) / 100,
                [ProductTableKeys.BTR]: (index + 1) / 100,
            },
        }),
    )

    const [offset, setOffset] = useState(0)

    const handleClickNextPage = () => {
        let nextValue = offset + ITEMS_PER_PAGE
        if (nextValue >= rows.length) {
            nextValue = rows.length - 1
        }
        setOffset(nextValue)
    }
    const handleClickPrevPage = () => {
        let nextValue = offset - ITEMS_PER_PAGE
        if (nextValue < 0) {
            nextValue = 0
        }
        setOffset(nextValue)
    }

    return (
        <ChartCard
            title="Top Products Recommended"
            chartId={chartId}
            dashboard={dashboard}
        >
            <TopProductRecommendationTableStats
                isLoading={false}
                rows={rows}
                perPage={ITEMS_PER_PAGE}
                offset={offset}
                onClickNextPage={handleClickNextPage}
                onClickPrevPage={handleClickPrevPage}
            />
        </ChartCard>
    )
}

export default TopProductRecommendationTable
