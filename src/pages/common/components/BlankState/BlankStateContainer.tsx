import React, {ReactNode} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import moment from 'moment'
import throttle from 'lodash/throttle'
import axios, {Canceler} from 'axios'

import {RootState} from '../../../../state/types'
import {TICKETS_CLOSED_PER_AGENT} from '../../../../config/stats'
import {fetchStat} from '../../../../models/stat/resources'
import {
    Stat,
    TwoDimensionalChart,
    StatCell,
} from '../../../../models/stat/types'

import BlankState from './components/BlankState'

type OwnProps = {
    message?: ReactNode
}

type Props = OwnProps & ConnectedProps<typeof connector>

type State = {
    closedTicketsCount: number | null
}

export class BlankStateContainer extends React.Component<Props, State> {
    cancelFetchStat?: Canceler
    state = {
        closedTicketsCount: null,
    }

    componentWillMount() {
        void this._fetchStatistic(this.props)
    }

    componentWillUnmount() {
        if (this.cancelFetchStat) {
            this.cancelFetchStat()
        }
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
            const cancelToken = axios.CancelToken.source()
            this.cancelFetchStat = cancelToken.cancel
            const stat = (await fetchStat(
                TICKETS_CLOSED_PER_AGENT,
                {filters},
                {
                    cancelToken: cancelToken.token,
                }
            )) as Stat<TwoDimensionalChart>
            this.setState({
                closedTicketsCount: (stat.data.data.lines[0] as StatCell[])[1]
                    .value as number,
            })
        } catch (error) {
            // Not important, we will try to fetch this stat next time.
        } finally {
            delete this.cancelFetchStat
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
