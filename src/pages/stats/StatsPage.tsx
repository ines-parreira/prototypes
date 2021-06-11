import React, {useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import moment from 'moment-timezone'
import {fromJS, Map} from 'immutable'

import {STORE_INTEGRATION_TYPES, views} from '../../config/stats'
import {resetStatsFilters, setStatsFilters} from '../../state/stats/actions'
import {getFilters} from '../../state/stats/selectors'
import {getTimezone} from '../../state/currentUser/selectors'
import {AccountFeature} from '../../state/currentAccount/types'
import {currentAccountHasFeature} from '../../state/currentAccount/selectors'
import Paywall from '../common/components/Paywall/Paywall'
import {getIntegrations} from '../../state/integrations/selectors'

import StatsFilters from './StatsFilters'
import Stats from './Stats'
import RevenueStatsRestrictedFeature from './RevenueStatsRestrictedFeature'

export default function StatsPage() {
    const dispatch = useDispatch()
    const {view} = useParams<{view?: string}>()
    const isOnSatisfactionSurveyPage =
        view === views.getIn(['satisfaction', 'link'])
    const isOnRevenuePage = view === views.getIn(['revenue', 'link'])
    const userTimezone = useSelector(getTimezone)
    const globalFilters = useSelector(getFilters)
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

    return (
        <div className="full-width">
            <StatsFilters />
            <Stats />
        </div>
    )
}
