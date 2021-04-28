// @flow
import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import moment from 'moment-timezone'
import {fromJS, type Map, type List} from 'immutable'

import {views, STORE_INTEGRATION_TYPES} from '../../config/stats.tsx'
import {getIntegrations} from '../../state/integrations/selectors.ts'
import {resetStatsFilters, setStatsFilters} from '../../state/stats/actions.ts'
import {getFilters} from '../../state/stats/selectors.ts'
import {getTimezone} from '../../state/currentUser/selectors.ts'
import {AccountFeatures} from '../../state/currentAccount/types.ts'

import withPaywall from '../common/utils/withPaywall.tsx'

import RestrictedFeature from '../common/components/RestrictedFeature.tsx'

import StatsComponent from './StatsComponent.tsx'

type Props = {
    match: Object,
    config: ?Object,
    globalFilters: Map<any, any>,
    setStatsFilters: typeof setStatsFilters,
    resetStatsFilters: typeof resetStatsFilters,
    storeIntegrations: List<any>,
    userTimezone: string,
}

const SatisfactionSurveysStats = withPaywall(
    AccountFeatures.SatisfactionSurveys
)(StatsComponent)

const RevenueStats = withPaywall(AccountFeatures.RevenueStatistics)(
    StatsComponent
)

export class StatsPage extends Component<Props> {
    constructor(props: Props) {
        super(props)
        const currentDay = moment().tz(props.userTimezone)
        let defaultFilters = {
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

        props.setStatsFilters(fromJS(defaultFilters))
    }

    componentWillUnmount() {
        this.props.resetStatsFilters()
    }

    render() {
        const {
            globalFilters,
            match: {
                params: {view},
            },
            storeIntegrations,
        } = this.props

        const isOnSatisfactionSurveyPage =
            view === views.getIn(['satisfaction', 'link'])
        const isOnRevenuePage = view === views.getIn(['revenue', 'link'])

        const revenueStats = () => {
            if (storeIntegrations == null || storeIntegrations.size === 0) {
                const assetsURL = window.GORGIAS_ASSETS_URL || ''
                const imagesURL = [
                    `${assetsURL}/static/private/img/presentationals/revenue-presentation.png`,
                ]
                let alertMsg = (
                    <>
                        Your e-commerce store needs to be connected to Gorgias
                        to use this feature.
                        <Link to="/app/settings/integrations/shopify/new">
                            {' '}
                            Add one here
                        </Link>
                    </>
                )

                return (
                    <RestrictedFeature
                        alertMsg={alertMsg}
                        imagesURL={imagesURL}
                        info="Assess how much sales your support team is influencing. Staff and reward your support team
                according to sales. Track and increase conversion, using Chat campaigns, for example."
                    />
                )
            }

            return <RevenueStats view={view} globalFilters={globalFilters} />
        }

        // do not display statistics until filters have been initialized
        if (!globalFilters) {
            return null
        }

        if (isOnSatisfactionSurveyPage) {
            return (
                <SatisfactionSurveysStats
                    view={view}
                    globalFilters={globalFilters}
                />
            )
        }

        if (isOnRevenuePage) {
            return revenueStats()
        }

        return <StatsComponent view={view} globalFilters={globalFilters} />
    }
}

const mapStateToProps = (state) => {
    return {
        userTimezone: getTimezone(state),
        globalFilters: getFilters(state),
        storeIntegrations: getIntegrations(state).filter((integration) => {
            return STORE_INTEGRATION_TYPES.includes(integration.get('type'))
        }),
    }
}

const actions = {
    setStatsFilters,
    resetStatsFilters,
}

export default withRouter(connect(mapStateToProps, actions)(StatsPage))
