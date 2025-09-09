import { useCallback, useEffect, useMemo, useState } from 'react'

import {
    getScoredSurveyOrderFromColumnKey,
    ScoredSurveyDataKey,
    useScoredSurveys,
} from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import { NoDataAvailable } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'
import ScoredSurveysTable, {
    TableState,
} from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable'
import css from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysTable.less'
import {
    SCORED_SURVEYS,
    sortScoredSurveyData,
    SURVEYS_PER_PAGE,
} from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/utils'
import { opposite, OrderDirection } from 'models/api/types'
import { NumberedPagination } from 'pages/common/components/Paginations'

const initialTableState: TableState = {
    currentPage: 1,
    orderBy: ScoredSurveyDataKey.SURVEY_SCORED_DATE,
    orderDirection: OrderDirection.Desc,
}

export default function ScoredSurveysChart(props: DashboardChartProps) {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()

    const [tableState, setTableState] = useState(initialTableState)

    const { data, isFetching } = useScoredSurveys(
        cleanStatsFilters,
        userTimezone,
        {
            sortBy: getScoredSurveyOrderFromColumnKey(tableState.orderBy),
            sortDirection: tableState.orderDirection,
        },
    )

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
