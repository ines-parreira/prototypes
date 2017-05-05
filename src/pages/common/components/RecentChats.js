import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link, withRouter} from 'react-router'
import classNames from 'classnames'
import {UncontrolledTooltip} from 'reactstrap'

import {isCurrentlyOnTicket} from '../../../utils'
import {logEvent} from '../../../store/middlewares/amplitudeTracker'

const RecentChatsItem = ({recentTicket, position}) => {
    const channel = recentTicket.get('channel')

    const iconClasses = classNames('action icon', {
        mail: channel === 'email',
        comments: channel === 'chat',
        facebook: ['facebook', 'facebook-post', 'facebook-comment'].includes(channel),
        comment: channel === 'internal-note',
        setting: channel === 'system-message',
        'facebook-messenger': channel === 'facebook-message',
        help: channel === 'unknown',
    })

    const text = recentTicket.get('subject')

    // track on click
    const _onClick = () => {
        logEvent('Clicked on recent activity item', {
            position,
            ticket: recentTicket.toJS(),
        })
    }

    // is the current link active or not?
    const isActive = isCurrentlyOnTicket(recentTicket.get('id'))
    const linkClasses = classNames('item', {
        active: isActive,
        'has-something-new': recentTicket.get('is_unread') && !isActive,
    })

    return (
        <Link
            onClick={_onClick}
            to={`/app/ticket/${recentTicket.get('id')}`}
            className={linkClasses}
            title={text}
        >
            <i className={iconClasses} />
            <span>{text}</span>
        </Link>
    )
}

RecentChatsItem.propTypes = {
    recentTicket: PropTypes.object.isRequired,
    position: PropTypes.number.isRequired
}

class RecentChats extends React.Component {
    static propTypes = {
        activity: PropTypes.object,
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
        const tickets = this.props.activity.get('tickets')

        if (!tickets || tickets.isEmpty()) {
            return null
        }

        return (
            <div className="RecentChats">
                <div className="item">
                    <h4>
                        <span id="active-chats-title">
                            ACTIVE CHATS
                        </span>
                    </h4>
                    <UncontrolledTooltip
                        placement="right"
                        target="active-chats-title"
                        delay={0}
                    >
                        Open chats assigned to you or unassigned
                    </UncontrolledTooltip>

                    <div className="menu">
                        {
                            tickets.map((e, index) => (
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
    activity: state.activity,
})

export default withRouter(connect(mapStateToProps)(RecentChats))
