import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import moment from 'moment'
import {fromJS, List} from 'immutable'

import {getHashOfObj} from '../../utils.ts'
import {views, STORE_INTEGRATION_TYPES} from '../../config/stats.tsx'
import {getIntegrations} from '../../state/integrations/selectors.ts'
import {resetStatsFilters, setStatsFilters} from '../../state/stats/actions.ts'
import {getFilters} from '../../state/stats/selectors.ts'

import StatsFilters from './StatsFilters'
import Stats from './Stats'
import RestrictedSatisfactionSurvey from './common/RestrictedSatisfactionSurvey'
import RestrictedRevenue from './common/RestrictedRevenue'

type Props = {
    params: Object,
    config: Object,
    currentAccount: Map<*, *>,
    globalFilters: Map,
    setStatsFilters: typeof setStatsFilters,
    resetStatsFilters: typeof resetStatsFilters,
    storeIntegrations: Map[],
}

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
            currentAccount,
            params: {view},
        } = this.props

        const hasSatisfactionSurveyFeature = currentAccount
            .get('extra_features')
            .includes('satisfaction-surveys')
        const hasRevenueStatFeature =
            currentAccount.get('extra_features').includes('revenue') &&
            // Enterprise customer (Smilodox) needed to deactivate revenue statistics.
            // More information in https://gorgias.gorgias.com/app/ticket/178993761
            // TODO(@LouisBarranqueiro): remove this as soon as we can restrict features per account.
            currentAccount.get('domain') !== 'smilodox'
        const hasRequiredStoreIntegration =
            globalFilters &&
            globalFilters.get('integrations', List()).size === 1

        const isOnSatisfactionSurveyPage =
            view === views.getIn(['satisfaction', 'link'])
        const isOnRevenuePage = view === views.getIn(['revenue', 'link'])

        // do not display statistics until filters have been initialized
        if (!globalFilters) {
            return null
        }

        if (isOnSatisfactionSurveyPage && !hasSatisfactionSurveyFeature) {
            return <RestrictedSatisfactionSurvey />
        }

        if (
            isOnRevenuePage &&
            (!hasRevenueStatFeature || !hasRequiredStoreIntegration)
        ) {
            return (
                <RestrictedRevenue
                    hasFeature={hasRevenueStatFeature}
                    hasRequiredIntegration={hasRequiredStoreIntegration}
                />
            )
        }

        return (
            <div className="stats full-width">
                <StatsFilters />
                <Stats key={`${view}-${getHashOfObj(globalFilters.toJS())}`} />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        globalFilters: getFilters(state),
        currentAccount: state.currentAccount,
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
