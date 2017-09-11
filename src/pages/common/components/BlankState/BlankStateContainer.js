import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import throttle from 'lodash/throttle'
import {BlankState} from './components/BlankState'
import {fetchStat} from '../../../../state/stats/actions'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../config/stats'
import moment from 'moment'

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

    if (state.stats && !state.stats.isEmpty()) {
        totalClosedTickets = state.stats.getIn([TICKETS_CLOSED_PER_AGENT, 'data', 'lines', 0, 1])
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

