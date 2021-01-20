import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter, Link} from 'react-router-dom'
import moment from 'moment'
import {fromJS, List} from 'immutable'

import {getHashOfObj} from '../../utils.ts'
import {views, STORE_INTEGRATION_TYPES} from '../../config/stats.tsx'
import {getIntegrations} from '../../state/integrations/selectors.ts'
import {resetStatsFilters, setStatsFilters} from '../../state/stats/actions.ts'
import {getFilters} from '../../state/stats/selectors.ts'

import {AccountFeatures} from '../../state/currentAccount/types.ts'

import withPaywall from '../common/utils/withPaywall.tsx'

import RestrictedFeature from '../common/components/RestrictedFeature'

import StatsFilters from './StatsFilters'
import Stats from './Stats'

type Props = {
    match: Object,
    config: Object,
    globalFilters: Map,
    setStatsFilters: typeof setStatsFilters,
    resetStatsFilters: typeof resetStatsFilters,
    storeIntegrations: Map[],
}

const StatsComponent = ({
    view,
    globalFilters,
}: {
    view: string,
    globalFilters: Map,
}) => (
    <div className="stats full-width">
        <StatsFilters />
        <Stats key={`${view}-${getHashOfObj(globalFilters.toJS())}`} />
    </div>
)

const SatisfactionSurveysStats = withPaywall(
    AccountFeatures.SatisfactionSurveys
)(StatsComponent)

const RevenueStats = withPaywall(AccountFeatures.RevenueStatistics)(
    StatsComponent
)

export class StatsPage extends Component<Props> {
    constructor(props) {
        super(props)
        let defaultFilters = {
            period: {
                // default period: last 7 days
                start_datetime: moment()
                    .startOf('day')
                    .subtract(6, 'days')
                    .format(),
                end_datetime: moment().endOf('day').format(),
            },
        }

        if (props.storeIntegrations.size) {
            defaultFilters.integrations = [
                props.storeIntegrations.getIn([0, 'id']),
            ]
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
        } = this.props

        const hasRequiredStoreIntegration =
            globalFilters &&
            globalFilters.get('integrations', List()).size === 1

        const isOnSatisfactionSurveyPage =
            view === views.getIn(['satisfaction', 'link'])
        const isOnRevenuePage = view === views.getIn(['revenue', 'link'])

        const revenueStats = () => {
            if (!hasRequiredStoreIntegration) {
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
