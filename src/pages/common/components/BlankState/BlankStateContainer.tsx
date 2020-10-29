import React, {ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import throttle from 'lodash/throttle'

import {fromJS} from 'immutable'

import {RootState} from '../../../../state/types'
import GorgiasApi from '../../../../services/gorgiasApi'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../config/stats'

import BlankState from './components/BlankState'

export const TICKET_CLOSED_BY_CURRENT_AGENT_7_DAYS =
    'ticket-closed-current-agent-7-days'

type OwnProps = {
    message: ReactNode
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    closedTicketsCount: number | null
}

class BlankStateContainer extends React.Component<Props, State> {
    gorgiasApi = new GorgiasApi()
    state = {
        closedTicketsCount: null,
    }

    componentWillMount() {
        void this._fetchStatistic(this.props)
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

const connector = connect((state: RootState) => {
    return {
        currentUser: state.currentUser,
    }
}, {})

export default connector(BlankStateContainer)
