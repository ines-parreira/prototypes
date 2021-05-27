import React, {useEffect} from 'react'
import {connect, ConnectedProps, useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import moment from 'moment-timezone'
import {fromJS} from 'immutable'

import {views} from '../../config/stats'
import {resetStatsFilters, setStatsFilters} from '../../state/stats/actions'
import {getFilters} from '../../state/stats/selectors'
import {getTimezone} from '../../state/currentUser/selectors'
import {AccountFeature} from '../../state/currentAccount/types'
import {RootState} from '../../state/types'
import {currentAccountHasFeature} from '../../state/currentAccount/selectors'
import Paywall from '../common/components/Paywall/Paywall'

import RevenueStats from './RevenueStats'
import StatsComponent from './StatsComponent'

type Props = ConnectedProps<typeof connector>

export function StatsPageContainer({
    userTimezone,
    resetStatsFilters,
    setStatsFilters,
    globalFilters,
}: Props) {
    const {view} = useParams<{view?: string}>()
    const isOnSatisfactionSurveyPage =
        view === views.getIn(['satisfaction', 'link'])
    const isOnRevenuePage = view === views.getIn(['revenue', 'link'])
    const hasSatisfactionSurveysFeature = useSelector(
        currentAccountHasFeature(AccountFeature.SatisfactionSurveys)
    )
    const hasRevenueStatisticsFeature = useSelector(
        currentAccountHasFeature(AccountFeature.RevenueStatistics)
    )

    useEffect(() => {
        const currentDay = userTimezone ? moment().tz(userTimezone) : moment()

        const defaultFilters = {
            period: {
                // default period: last 7 days
                start_datetime: currentDay
                    .clone()
                    .startOf('day')
                    .subtract(6, 'days')
                    .format(),
                end_datetime: currentDay.clone().endOf('day').format(),
            },
        }

        setStatsFilters(fromJS(defaultFilters))
        return () => {
            resetStatsFilters()
        }
    }, [])

    // do not display statistics until filters have been initialized
    if (!globalFilters) {
        return null
    }

    if (isOnSatisfactionSurveyPage && !hasSatisfactionSurveysFeature) {
        return <Paywall feature={AccountFeature.SatisfactionSurveys} />
    }

    if (isOnRevenuePage) {
        return hasRevenueStatisticsFeature ? (
            <RevenueStats />
        ) : (
            <Paywall feature={AccountFeature.RevenueStatistics} />
        )
    }

    return <StatsComponent />
}

const connector = connect(
    (state: RootState) => {
        return {
            userTimezone: getTimezone(state),
            globalFilters: getFilters(state),
        }
    },
    {
        setStatsFilters,
        resetStatsFilters,
    }
)

export default connector(StatsPageContainer)
