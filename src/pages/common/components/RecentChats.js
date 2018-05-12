import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Link, withRouter} from 'react-router'

import Tooltip from './Tooltip'
import {isCurrentlyOnTicket} from '../../../utils'
import * as segmentTracker from '../../../store/middlewares/segmentTracker'

import {MAX_RECENT_CHATS} from '../../../config/chats'
import SourceIcon from './SourceIcon'

class RecentChatsItem extends React.Component {
    static propTypes = {
        recentTicket: PropTypes.object.isRequired,
        position: PropTypes.number.isRequired
    }

    static contextTypes = {
        closePanel: PropTypes.func.isRequired,
    }

    render() {
        const {recentTicket, position} = this.props
        const channel = recentTicket.get('channel')
        const requesterID = recentTicket.get('requester_id')
        // If no user name nor ticket subject exists, then we'll display a user's id
        const requesterDisplayName = recentTicket.get('requester_name') || recentTicket.get('requester_email')
            || `Customer #${requesterID}`

        // is the current link active or not?
        const isActive = isCurrentlyOnTicket(recentTicket.get('id'))
        const linkClasses = classnames('item', {
            active: isActive,
            focused: isActive,
            'has-something-new': recentTicket.get('is_unread') && !isActive,
        })

        return (
            <Link
                onClick={() => {
                    segmentTracker.logEvent(segmentTracker.EVENTS.RECENT_ACTIVITY_CLICKED, {
                        position,
                        ticket: recentTicket.toJS(),
                    })
                    this.context.closePanel()
                }}
                to={`/app/ticket/${recentTicket.get('id')}`}
                className={linkClasses}
                title={requesterDisplayName}
            >
                <SourceIcon type={channel} className={classnames('uncolored mr-2')}/>
                <span>{requesterDisplayName}</span>
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
            <div className="RecentChats">
                <div className="item">
                    <h4>
                        <span id="active-chats-title">
                            Chats
                        </span>
                    </h4>
                    <Tooltip
                        placement="right"
                        target="active-chats-title"
                    >
                        Open chats assigned to you or unassigned
                    </Tooltip>

                    <div className="menu">
                        {
                            tickets.slice(0, MAX_RECENT_CHATS).map((e, index) => (
                                <RecentChatsItem
                                    key={e.get('id')}
                                    recentTicket={e}
                                    position={index + 1}
                                />
                            ))
                        }
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
