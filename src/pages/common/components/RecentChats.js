import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {Link, withRouter} from 'react-router'
import {UncontrolledTooltip} from 'reactstrap'

import {isCurrentlyOnTicket} from '../../../utils'
import {logEvent} from '../../../store/middlewares/amplitudeTracker'

import {sourceTypeToIcon} from '../../../config/ticket'

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

        const text = recentTicket.get('subject')

        // is the current link active or not?
        const isActive = isCurrentlyOnTicket(recentTicket.get('id'))
        const linkClasses = classnames('item', {
            active: isActive,
            'has-something-new': recentTicket.get('is_unread') && !isActive,
        })

        return (
            <Link
                onClick={() => {
                    logEvent('Clicked on recent activity item', {
                        position,
                        ticket: recentTicket.toJS(),
                    })
                    this.context.closePanel()
                }}
                to={`/app/ticket/${recentTicket.get('id')}`}
                className={linkClasses}
                title={text}
            >
                <i className={classnames('uncolored mr-2', sourceTypeToIcon(channel))} />
                <span>{text}</span>
            </Link>
        )
    }
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
                            CHATS
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
