import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Link, RouteComponentProps, withRouter} from 'react-router-dom'
import {Map, fromJS, List} from 'immutable'

import {isCurrentlyOnTicket} from '../../../utils'
import * as segmentTracker from '../../../store/middlewares/segmentTracker.js'

import {RootState} from '../../../state/types'

import {MAX_RECENT_CHATS} from '../../../config/recentChats'

import Tooltip from './Tooltip'
import SourceIcon from './SourceIcon'

import css from './RecentChats.less'

type ItemProps = {
    recentTicket: Map<any, any>
    position: number
}

class RecentChatsItem extends Component<ItemProps> {
    static contextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    render() {
        const {recentTicket, position} = this.props
        const channel = recentTicket.get('channel')
        const customer: Map<any, any> =
            recentTicket.get('customer') || fromJS({})
        const customerID: number = customer.get('id')
        // If no customer name nor ticket subject exists, then we'll display a customer's id
        const customerName =
            customer.get('name') ||
            customer.get('email') ||
            `Customer #${customerID}`
        // is the current link active or not?
        const isActive = isCurrentlyOnTicket(recentTicket.get('id'))
        const linkClasses = classnames('item', css.menuItem, {
            active: isActive,
            focused: isActive,
            [css.hasSomethingNew]: recentTicket.get('is_unread') && !isActive,
        })

        return (
            <Link
                onClick={() => {
                    segmentTracker.logEvent(
                        segmentTracker.EVENTS.RECENT_ACTIVITY_CLICKED,
                        {
                            position,
                            ticket: recentTicket.toJS(),
                        }
                    )
                    ;(
                        this.context as {
                            closePanel: () => void
                        }
                    ).closePanel()
                }}
                to={`/app/ticket/${recentTicket.get('id') as number}`}
                className={linkClasses}
                title={customerName}
            >
                <SourceIcon
                    type={channel}
                    className={classnames('uncolored mr-2')}
                />
                <span>{customerName}</span>
            </Link>
        )
    }
}

type Props = ConnectedProps<typeof connector> & RouteComponentProps

class RecentChats extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
        const {location} = this.props
        if (location.pathname !== prevProps.location.pathname) {
            this.forceUpdate()
        }
    }

    render() {
        const tickets = this.props.chats.get('tickets') as List<Map<any, any>>

        if (!tickets || tickets.isEmpty()) {
            return null
        }

        return (
            <div className={css.component}>
                <div className="item">
                    <h4 className={css.title}>
                        <span id="active-chats-title">Chats</span>
                    </h4>
                    <Tooltip
                        placement="left"
                        target="active-chats-title"
                        className={css.tooltip}
                    >
                        Open chats assigned to you or unassigned
                    </Tooltip>

                    <div className="menu">
                        {tickets.slice(0, MAX_RECENT_CHATS).map((e, index) => (
                            <RecentChatsItem
                                key={e!.get('id')}
                                recentTicket={e!}
                                position={index! + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    chats: state.chats,
}))

export default withRouter(connector(RecentChats))
