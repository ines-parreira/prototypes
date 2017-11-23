import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import throttle from 'lodash/throttle'

import {BlankState} from './components/BlankState'
import {fetchStat} from '../../../../state/stats/actions'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../config/stats'

import {getAgentClosedTicketsStats} from './../../../../state/stats/selectors'

const _fetch = throttle((props) => {
    props.fetchStat(TICKETS_CLOSED_PER_AGENT, {
        start_datetime: moment().subtract(7, 'days'),
        end_datetime: moment(),
    }, {
        agents: [props.currentUser.get('id')]
    })
}, 15000)

function mapStateToProps(state) {
    let totalClosedTickets = 0
    const currentUser = state.currentUser

    if (state.stats && !state.stats.isEmpty()) {
        const currentUserClosedTicketsStats = getAgentClosedTicketsStats(currentUser)(state)
        totalClosedTickets = currentUserClosedTicketsStats.get(1, 0)
    }

    return {
        totalClosedTickets: totalClosedTickets,
        currentUser: state.currentUser
    }
}

@connect(mapStateToProps, {fetchStat})
export default class BlankStateContainer extends React.Component {
    static propTypes = {
        fetchStat: PropTypes.func.isRequired,
        totalClosedTickets: PropTypes.number,
        currentUser: PropTypes.object,
        message: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
    }

    componentWillMount() {
        _fetch(this.props)
    }

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

