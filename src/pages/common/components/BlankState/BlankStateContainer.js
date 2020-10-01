// @flow
import React, {type Node as ReactNode} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import throttle from 'lodash/throttle'

import {fromJS} from 'immutable'

import GorgiasApi from '../../../../services/gorgiasApi.ts'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../config/stats.tsx'

import BlankState from './components/BlankState'

export const TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS =
    'ticket-closed-current-agent-7-days'

type Props = {
    currentUser: Map<*, *>,
    message: ReactNode,
}

type State = {
    closedTicketsCount: number | null,
}

class BlankStateContainer extends React.Component<Props, State> {
    gorgiasApi = new GorgiasApi()
    state = {
        closedTicketsCount: null,
    }

    componentWillMount() {
        this._fetchStatistic(this.props)
    }

    componentWillUnmount() {
        this.gorgiasApi.cancelPendingRequests()
    }

    /**
     * Get the number of ticket closed by the current agent for the last 7 days
     */
    _fetchStatistic = throttle(async (props: Props) => {
        const filters = {
            agents: [props.currentUser.get('id')],
            period: {
                start_datetime: moment()
                    .startOf('day')
                    .subtract(6, 'days')
                    .format(),
                end_datetime: moment().endOf('day').format(),
            },
        }
        try {
            const stat = await this.gorgiasApi.getStatistic(
                TICKETS_CLOSED_PER_AGENT,
                fromJS({filters})
            )
            const closedTicketsCount = stat.getIn([
                'data',
                'data',
                'lines',
                0,
                1,
                'value',
            ])
            this.setState({closedTicketsCount})
        } catch (error) {
            // Not important, we will try to fetch this stat next time.
        }
    }, 15000)

    render() {
        const {message} = this.props
        const {closedTicketsCount} = this.state

        return (
            <BlankState
                message={message}
                totalClosedTickets={closedTicketsCount}
            />
        )
    }
}

export default connect((state) => {
    return {
        currentUser: state.currentUser,
    }
}, {})(BlankStateContainer)
