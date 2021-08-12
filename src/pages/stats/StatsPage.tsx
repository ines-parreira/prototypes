import React, {useEffect, useMemo} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import moment from 'moment-timezone'
import {fromJS, Map} from 'immutable'
import classNames from 'classnames'

import {STORE_INTEGRATION_TYPES, views} from '../../config/stats'
import {resetStatsFilters, setStatsFilters} from '../../state/stats/actions'
import {getFilters} from '../../state/stats/selectors'
import {getTimezone} from '../../state/currentUser/selectors'
import {AccountFeature} from '../../state/currentAccount/types'
import {currentAccountHasFeature} from '../../state/currentAccount/selectors'
import Paywall from '../common/components/Paywall/Paywall'
import {getIntegrations} from '../../state/integrations/selectors'
import useAppDispatch from '../../hooks/useAppDispatch'

import StatsFilters from './StatsFilters'
import Stats from './Stats'
import RevenueStatsRestrictedFeature from './RevenueStatsRestrictedFeature'

import css from './StatsPage.less'

export default function StatsPage() {
    const dispatch = useAppDispatch()
    const {view} = useParams<{view?: string}>()
    const isOnSatisfactionSurveyPage =
        view === views.getIn(['satisfaction', 'link'])
    const isOnRevenuePage = view === views.getIn(['revenue', 'link'])
    const isOnLiveOverviewPage = view === views.getIn(['live-overview', 'link'])
    const isOnLiveAgentsPage = view === views.getIn(['live-agents', 'link'])
    const userTimezone = useSelector(getTimezone)
    const globalFilters = useSelector(getFilters)
    const hasLiveAgentsFeature = useSelector(
        currentAccountHasFeature(AccountFeature.UsersLiveStatistics)
    )
    const hasLiveOverviewFeature = useSelector(
        currentAccountHasFeature(AccountFeature.OverviewLiveStatistics)
    )
    const hasSatisfactionSurveysFeature = useSelector(
        currentAccountHasFeature(AccountFeature.SatisfactionSurveys)
    )
    const hasRevenueStatisticsFeature = useSelector(
        currentAccountHasFeature(AccountFeature.RevenueStatistics)
    )
    const integrations = useSelector(getIntegrations)
    const storeIntegrations = useMemo(() => {
        return integrations.filter((integration: Map<any, any>) => {
            return STORE_INTEGRATION_TYPES.includes(integration.get('type'))
        })
    }, [integrations])

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

        dispatch(setStatsFilters(fromJS(defaultFilters)))
        return () => {
            dispatch(resetStatsFilters())
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
        if (!hasRevenueStatisticsFeature) {
            return <Paywall feature={AccountFeature.RevenueStatistics} />
        }
        if (storeIntegrations == null || storeIntegrations.size === 0) {
            return <RevenueStatsRestrictedFeature />
        }
    }

    if (!hasLiveOverviewFeature && isOnLiveOverviewPage) {
        return <Paywall feature={AccountFeature.OverviewLiveStatistics} />
    }

    if (!hasLiveAgentsFeature && isOnLiveAgentsPage) {
        return <Paywall feature={AccountFeature.UsersLiveStatistics} />
    }

    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div className={css.filtersWrapper}>
                <StatsFilters />
            </div>
            <div className={css.statsWrapper}>
                <Stats />
            </div>
        </div>
    )
}
