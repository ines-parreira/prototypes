// @flow
import React from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import throttle from 'lodash/throttle'

import BlankState from './components/BlankState'
import {fetchStat} from '../../../../state/stats/actions'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../config/stats'

import {getStat} from './../../../../state/stats/selectors'
import {fromJS} from 'immutable'

const TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS = 'ticket-closed-current-agent-7-days'


type Props = {
    fetchStat: typeof fetchStat,
    totalClosedTickets: ?number,
    currentUser: ?Object,
    message: ?Object | ?string
}

class BlankStateContainer extends React.Component<Props> {
    componentWillMount() {
        this._fetchStatistic(this.props)
    }

    /**
     * Get the number of ticket closed by the current agent for the last 7 days
     */
    _fetchStatistic = throttle((props) => {
        const meta = {
            start_datetime: moment().startOf('day').subtract(6, 'days').format(),
            end_datetime: moment().endOf('day').format(),
        }
        const filters = {agents: [props.currentUser.get('id')]}

        props.fetchStat(TICKETS_CLOSED_PER_AGENT, meta, filters, TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS)
    }, 15000)

    render() {
        const {message, totalClosedTickets} = this.props

        return (
            <BlankState
                message={message}
                totalClosedTickets={totalClosedTickets}
            />
        )
    }
}

export default connect((state) => {
    let totalClosedTickets = 0

    if (state.stats && !state.stats.isEmpty()) {
        const stat = getStat(TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS)(state)
        totalClosedTickets = (stat
            .getIn(['data', 'lines'], fromJS([]))
            .find((line) => line.get(0) === state.currentUser.get('name')) || fromJS([]))
            .get(1) || totalClosedTickets
    }

    return {
        totalClosedTickets: totalClosedTickets,
        currentUser: state.currentUser
    }
}, {
    fetchStat
})(BlankStateContainer)

