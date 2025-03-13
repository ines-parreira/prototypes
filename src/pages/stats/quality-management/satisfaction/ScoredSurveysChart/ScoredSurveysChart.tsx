import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
    ScoredSurveyDataKey,
    useScoredSurveys,
} from 'hooks/reporting/quality-management/satisfaction/useScoredSurveys'
import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { opposite, OrderDirection } from 'models/api/types'
import { NumberedPagination } from 'pages/common/components/Paginations'
import ChartCard from 'pages/stats/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { NoDataAvailable } from 'pages/stats/NoDataAvailable'
import ScoredSurveysTable, {
    TableState,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable'
import css from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable.less'
import {
    SCORED_SURVEYS,
    sortScoredSurveyData,
    SURVEYS_PER_PAGE,
} from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/utils'

const initialTableState: TableState = {
    currentPage: 1,
    orderBy: ScoredSurveyDataKey.SURVEY_SCORED_DATE,
    orderDirection: OrderDirection.Desc,
}

export default function ScoredSurveysChart(props: DashboardChartProps) {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const { data, isFetching } = useScoredSurveys(
        cleanStatsFilters,
        userTimezone,
    )

    const [tableState, setTableState] = useState(initialTableState)

    useEffect(() => {
        setTableState((prevState) => ({ ...prevState, currentPage: 1 }))
    }, [data])

    const sortedCurrentPageOfData = useMemo(() => {
        const { orderBy, orderDirection, currentPage } = tableState

        if (!data) {
            return
        }

        const sortedData = sortScoredSurveyData(data, orderBy, orderDirection)

        return sortedData?.slice(
            (currentPage - 1) * SURVEYS_PER_PAGE,
            currentPage * SURVEYS_PER_PAGE,
        )
    }, [data, tableState])

    const handleSort = useCallback((property: ScoredSurveyDataKey) => {
        setTableState((prevState) => ({
            orderBy: property,
            orderDirection:
                prevState.orderBy === property
                    ? opposite(prevState.orderDirection)
                    : prevState.orderDirection,
            currentPage: 1,
        }))
    }, [])

    const hasPagination = useMemo(
        () => !!data && data.length >= SURVEYS_PER_PAGE,
        [data],
    )

    return (
        <ChartCard
            title={SCORED_SURVEYS.TITLE}
            hint={{
                title: SCORED_SURVEYS.DESCRIPTION,
            }}
            {...props}
            noPadding
        >
            {sortedCurrentPageOfData?.length === 0 && !isFetching ? (
                <NoDataAvailable className={css.noDataAvalable} />
            ) : (
                <ScoredSurveysTable
                    data={sortedCurrentPageOfData}
                    isFetching={isFetching}
                    tableState={tableState}
                    handleSort={handleSort}
                />
            )}

            {hasPagination && data && (
                <NumberedPagination
                    count={Math.ceil(data.length / SURVEYS_PER_PAGE)}
                    page={tableState.currentPage}
                    onChange={(page) =>
                        setTableState((prevState) => ({
                            ...prevState,
                            currentPage: page,
                        }))
                    }
                    className={css.pagination}
                />
            )}
        </ChartCard>
    )
}
