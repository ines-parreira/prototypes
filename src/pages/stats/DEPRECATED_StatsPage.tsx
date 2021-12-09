import React, {useMemo} from 'react'
import {useSelector} from 'react-redux'
import {useParams} from 'react-router-dom'
import {Map} from 'immutable'
import classNames from 'classnames'

import {STORE_INTEGRATION_TYPES, views} from '../../config/stats'
import {getFilters} from '../../state/stats/selectors'
import {AccountFeature} from '../../state/currentAccount/types'
import {currentAccountHasFeature} from '../../state/currentAccount/selectors'
import Paywall from '../common/components/Paywall/Paywall'
import {getIntegrations} from '../../state/integrations/selectors'

import NoMatch from '../common/components/NoMatch'

import DEPRECATED_StatsFilters from './DEPRECATED_StatsFilters'
import DEPRECATED_Stats from './DEPRECATED_Stats'
import RevenueStatsRestrictedFeature from './RevenueStatsRestrictedFeature'

import css from './DEPRECATED_StatsPage.less'
import SelfServiceStatsPage from './self-service/SelfServiceStatsPage'

export default function DEPRECATED_StatsPage() {
    const {view} = useParams<{view?: string}>()
    const isViewValid = views.some((v: Map<any, any>) => v.get('link') === view)
    const isOnSatisfactionSurveyPage =
        view === views.getIn(['satisfaction', 'link'])
    const isOnRevenuePage = view === views.getIn(['revenue', 'link'])
    const isOnLiveOverviewPage = view === views.getIn(['live-overview', 'link'])
    const isOnLiveAgentsPage = view === views.getIn(['live-agents', 'link'])
    const isOnSelfServicePage = view === views.getIn(['self-service', 'link'])
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

    if (!isViewValid) {
        return (
            <div className={classNames('full-width', css.wrapper)}>
                <NoMatch />
            </div>
        )
    }

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

    if (isOnSelfServicePage) {
        return <SelfServiceStatsPage />
    }

    return (
        <div className={classNames('full-width', css.wrapper)}>
            <div className={css.filtersWrapper}>
                <DEPRECATED_StatsFilters />
            </div>
            <div className={css.statsWrapper}>
                <DEPRECATED_Stats />
            </div>
        </div>
    )
}
