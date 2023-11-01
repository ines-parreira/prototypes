import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Link, RouteComponentProps} from 'react-router-dom'
import {Map, fromJS, List} from 'immutable'

import navbarCss from 'assets/css/navbar.less'
import {logEvent, SegmentEvent} from 'common/segment'
import {isCurrentlyOnTicket} from 'utils'
import {RootState} from 'state/types'
import {MAX_RECENT_CHATS} from 'config/recentChats'
import withRouter from 'pages/common/utils/withRouter'

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
        const linkClasses = classnames(navbarCss.link, css.menuItem, {
            active: isActive,
            focused: isActive,
            [css.hasSomethingNew]: recentTicket.get('is_unread') && !isActive,
        })

        return (
            <div className={navbarCss['link-wrapper']}>
                <Link
                    onClick={() => {
                        logEvent(SegmentEvent.RecentActivityClicked, {
                            position,
                            ticket: recentTicket.toJS(),
                        })
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
                    <span className={css['chat-title']}>
                        <SourceIcon type={channel} />
                        <span>{customerName}</span>
                    </span>
                </Link>
            </div>
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
            <div className={navbarCss.category}>
                <h4 className={navbarCss['category-title']}>
                    <span>Chat & messaging</span>
                </h4>
                <div className={navbarCss.menu}>
                    {tickets.slice(0, MAX_RECENT_CHATS).map((e, index) => (
                        <RecentChatsItem
                            key={e!.get('id')}
                            recentTicket={e!}
                            position={index! + 1}
                        />
                    ))}
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    chats: state.chats,
}))

export default withRouter(connector(RecentChats))
