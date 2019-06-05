import React, {Component} from 'react'
import {connect} from 'react-redux'
import {withRouter} from 'react-router'
import moment from 'moment'
import {fromJS} from 'immutable'

import {getFilters} from '../../state/stats/selectors'
import {getHashOfObj} from '../../utils'
import {views} from '../../config/stats'
import {setStatsFilters} from '../../state/stats/actions'

import StatsFilters from './StatsFilters'
import Stats from './Stats'
import RestrictedSatisfactionSurvey from './common/RestrictedSatisfactionSurvey'
import RevenueUpgrade from './common/RevenueUpgrade'

type Props = {
    params: Object,
    config: Object,
    currentAccount: Map<*, *>,
    globalFilters: Map,
    setStatsFilters: typeof setStatsFilters
}

export class StatsPage extends Component<Props> {
    constructor(props) {
        super(props)
        props.setStatsFilters(fromJS({
            period: {
                // default period: last 7 days
                'start_datetime': moment().startOf('day').subtract(6, 'days').format(),
                'end_datetime': moment().endOf('day').format()
            }
        }))
    }

    render() {
        const {
            globalFilters,
            currentAccount,
            params: {view}
        } = this.props
        const hasNoSatisfactionSurveyFeature = !currentAccount.get('extra_features').includes('satisfaction-surveys')
        const missingSatisfactionSurvey = view === views.getIn(['satisfaction', 'link']) && hasNoSatisfactionSurveyFeature
        if (missingSatisfactionSurvey) {
            return <RestrictedSatisfactionSurvey/>
        }

        const hasNoRevenueStatFeature = !currentAccount.get('extra_features').includes('revenue')
        const missingRevenue = view === views.getIn(['revenue', 'link']) && hasNoRevenueStatFeature
        if (missingRevenue) {
            return <RevenueUpgrade/>
        }

        // do not display statistics until filters have been initialized
        if (!globalFilters) {
            return null
        }

        return (
            <div className="stats full-width">
                <StatsFilters/>
                <Stats
                    key={`${view}-${getHashOfObj(globalFilters.toJS())}`}
                />
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        globalFilters: getFilters(state),
        currentAccount: state.currentAccount
    }
}
export default withRouter(connect(mapStateToProps, {setStatsFilters})(StatsPage))
