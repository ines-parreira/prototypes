import moment from 'moment'
import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {AiAgentLayout} from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {IntentTableWidget} from 'pages/aiAgent/insights/IntentTableWidget/IntentTableWidget'
import {PeriodFilter} from 'pages/stats/common/filters/PeriodFilter'
import {DrillDownModal} from 'pages/stats/DrillDownModal'
import {getPageStatsFilters} from 'state/stats/selectors'
import {setStatsFilters} from 'state/stats/statsSlice'

import {Level1IntentsPerformance} from '../widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import css from './OptimizeContainer.less'

const HOURS_TO_REMOVE = 72
export const OptimizeContainer = () => {
    const {shopName} = useParams<{
        shopName: string
    }>()

    const dispatch = useDispatch()

    const pageStatsFilters = useAppSelector(getPageStatsFilters)

    const [isPeriodFilterSet, setIsPeriodFilterSet] = useState(false)

    useEffectOnce(() => {
        dispatch(
            setStatsFilters({
                period: {
                    start_datetime: moment(
                        moment()
                            .endOf('day')
                            .subtract(HOURS_TO_REMOVE, 'hours')
                            .subtract(1, 'week')
                            .toDate()
                    ).format(),
                    end_datetime: moment(
                        moment().subtract(HOURS_TO_REMOVE, 'hours').toDate()
                    ).format(),
                },
            })
        )

        setIsPeriodFilterSet(true)
    })

    return (
        <AiAgentLayout shopName={shopName} className={css.container}>
            <div className={css.section}>
                {isPeriodFilterSet && (
                    <PeriodFilter
                        value={{
                            start_datetime:
                                pageStatsFilters.period.start_datetime,
                            end_datetime: pageStatsFilters.period.end_datetime,
                        }}
                        initialSettings={{
                            maxDate: moment().subtract(
                                HOURS_TO_REMOVE,
                                'hours'
                            ),
                        }}
                        tooltipMessageForPreviousPeriod="There is no data available on this date yet."
                    />
                )}

                <Level1IntentsPerformance />
            </div>

            <div className={css.section}>
                <IntentTableWidget
                    title="Intents"
                    description="Explore intents detected from AI Agent tickets to assess performance, review knowledge recommendations, and analyze topics within each intent. "
                    tableTitle="All intents"
                    tableHint={{
                        title: 'List of all intents detected in tickets that involved AI Agent.',
                        link: 'https://docs.gorgias.com/en-US/customer-intents-81924',
                        linkText: 'Learn about intents',
                    }}
                />
            </div>
            <DrillDownModal />
        </AiAgentLayout>
    )
}
