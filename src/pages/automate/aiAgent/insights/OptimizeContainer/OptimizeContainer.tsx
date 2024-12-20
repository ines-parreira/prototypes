import moment from 'moment'
import React, {useState} from 'react'
import {useDispatch} from 'react-redux'
import {useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {PeriodFilter} from 'pages/stats/common/filters/PeriodFilter'
import {getPageStatsFilters} from 'state/stats/selectors'
import {setStatsFilters} from 'state/stats/statsSlice'

import {IntentTableWidget} from '../IntentTableWidget/IntentTableWidget'
import {Level1IntentsPerformance} from '../widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import css from './OptimizeContainer.less'

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
                        moment().subtract(1, 'week').toDate()
                    ).format(),
                    end_datetime: moment(moment().toDate()).format(),
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
                    />
                )}

                <Level1IntentsPerformance />
            </div>

            <div className={css.section}>
                <IntentTableWidget
                    title="Intents"
                    description="Explore intents detected from AI Agent tickets to assess performance, review knowledge recommendations, and analyze topics within each intent. "
                    tableTitle="All intents"
                    tableHint="List of intents in tickets that involved AI Agent engagement. Learn about intents"
                />
            </div>
        </AiAgentLayout>
    )
}
