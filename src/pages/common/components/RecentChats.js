import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Link, withRouter} from 'react-router'
import {fromJS} from 'immutable'

import {isCurrentlyOnTicket} from '../../../utils'
import * as segmentTracker from '../../../store/middlewares/segmentTracker'

import {MAX_RECENT_CHATS} from '../../../config/recentChats'

import Tooltip from './Tooltip'
import SourceIcon from './SourceIcon'

import css from './RecentChats.less'

class RecentChatsItem extends React.Component {
    static propTypes = {
        recentTicket: PropTypes.object.isRequired,
        position: PropTypes.number.isRequired,
    }

    static contextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    render() {
        const {recentTicket, position} = this.props
        const channel = recentTicket.get('channel')
        const customer = recentTicket.get('customer') || fromJS({})
        const customerID = customer.get('id')
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
                    this.context.closePanel()
                }}
                to={`/app/ticket/${recentTicket.get('id')}`}
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

class RecentChats extends React.Component {
    static propTypes = {
        chats: PropTypes.object,
        router: PropTypes.object,
    }

    componentDidMount() {
        // force redraw on page change, since we care about window.location in RecentChatsItem
        this.unlisten = this.props.router.listen(() => this.forceUpdate())
    }

    componentWillUnmount() {
        // unlisten router changes
        if (this.unlisten) {
            this.unlisten()
        }
    }

    render() {
        const tickets = this.props.chats.get('tickets')

        if (!tickets || tickets.isEmpty()) {
            return null
        }

        return (
            <div className={css.component}>
                <div className="item">
                    <h4>
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
                                key={e.get('id')}
                                recentTicket={e}
                                position={index + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    chats: state.chats,
})

export default withRouter(connect(mapStateToProps)(RecentChats))
