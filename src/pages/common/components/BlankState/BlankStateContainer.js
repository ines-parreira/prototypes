// @flow
import React from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import throttle from 'lodash/throttle'

import {fetchStat} from '../../../../state/stats/actions'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../config/stats'

import BlankState from './components/BlankState'
import {getStat} from './../../../../state/stats/selectors'

export const TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS = 'ticket-closed-current-agent-7-days'

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
        const filters = {
            agents: [props.currentUser.get('id')],
            period: {
                start_datetime: moment().startOf('day').subtract(6, 'days').format(),
                end_datetime: moment().endOf('day').format(),
            }
        }
        props.fetchStat(TICKETS_CLOSED_PER_AGENT, filters, TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS)
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
        totalClosedTickets = stat.getIn(['data', 'lines', 0, 1, 'value'])
    }

    return {
        totalClosedTickets: totalClosedTickets,
        currentUser: state.currentUser
    }
}, {
    fetchStat
})(BlankStateContainer)

