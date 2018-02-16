import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _noop from 'lodash/noop'

import TicketHeader from './TicketHeader'
import TicketBody from './TicketBody'

import Timeline from '../../../common/components/timeline/Timeline'
import ReplyMessageChannel from './replyarea/ReplyMessageChannel'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtons from './replyarea/TicketSubmitButtons'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'

import * as tagsSelectors from '../../../../state/tags/selectors'
import * as usersSelectors from '../../../../state/users/selectors'
import * as ticketSelectors from '../../../../state/ticket/selectors'

import * as viewsUtils from '../../../../state/views/utils'

import css from './TicketView.less'
import appCss from '../../../App.less'

@connect((state) => {
    return {
        agents: usersSelectors.getAgents(state),
        agentsViewing: usersSelectors.getOtherAgentsOnTicket(state.ticket.get('id'))(state),
        agentsTyping: usersSelectors.getOtherAgentsTypingOnTicket(state.ticket.get('id'))(state),
        currentUser: state.currentUser,
        macros: state.macros,
        routing: state.routing,
        tags: tagsSelectors.getTags(state),
        ticket: state.ticket,
        ticketBody: ticketSelectors.getBody(state),
        users: state.users,
        usersIsLoading: usersSelectors.makeIsLoading(state),
        views: state.views
    }
})
export default class TicketView extends React.Component {
    static propTypes = {
        actions: PropTypes.object.isRequired,
        agents: PropTypes.object.isRequired,
        agentsViewing: PropTypes.object.isRequired,
        agentsTyping: PropTypes.object.isRequired,
        currentUser: PropTypes.object.isRequired,
        hideTicket: PropTypes.func.isRequired,
        isTicketHidden: PropTypes.bool.isRequired,
        macros: PropTypes.object.isRequired,
        submit: PropTypes.func.isRequired,
        tags: PropTypes.object.isRequired,
        ticket: PropTypes.object.isRequired,
        ticketBody: PropTypes.object.isRequired,
        users: PropTypes.object.isRequired,
        usersIsLoading: PropTypes.func.isRequired,
        setStatus: PropTypes.func.isRequired,
        view: PropTypes.object,
    }

    static defaultProps = {
        agentsViewing: fromJS([]),
        agentsTyping: fromJS([]),
        setStatus: _noop
    }

    wasAtBottomOfPage = false // used to track if user was at the bottom of the page

    componentWillMount() {
        const shouldDisplayHistoryOnNextPage = this.props.ticket.getIn(['_internal', 'shouldDisplayHistoryOnNextPage'])
        const displayHistory = this.props.ticket.getIn(['_internal', 'displayHistory'])

        if (shouldDisplayHistoryOnNextPage !== displayHistory) {
            this.props.actions.ticket.toggleHistory(shouldDisplayHistoryOnNextPage)
        }

        if (shouldDisplayHistoryOnNextPage) {
            this.props.actions.ticket.displayHistoryOnNextPage(false)
        }
    }

    componentDidMount() {
        // scroll to the bottom of the ticket content the first time the ticket is viewed.
        // decrease the bottom padding, to avoid scrolling to a white screen on touchscreens.
        const styles = window.getComputedStyle(this.refs.ticketContent)
        const maxScrollTop = this.refs.ticketContent.scrollHeight - this.refs.ticketContent.clientHeight
        this.refs.ticketContent.scrollTop = maxScrollTop - parseInt(styles.paddingBottom)
    }

    componentWillReceiveProps(nextProps) {
        const isHistoryDisplayed = nextProps.ticket.getIn(['_internal', 'displayHistory'])

        // save before props update if user was at bottom of the page (probably answering something)
        // if history is displayed we calculate scroll on `main-content` wrapper
        const className = isHistoryDisplayed ? appCss['main-content'] : 'ticket-content'
        const element = document.getElementsByClassName(className)[0]
        this.wasAtBottomOfPage = (element.scrollHeight - element.scrollTop) <= element.offsetHeight + 40
    }

    componentDidUpdate(prevProps) {
        // if ticket body (messages, events, etc.) changes but user is at bottom of the page,
        // then keep him at the bottom of the page
        const isHistoryDisplayed = this.props.ticket.getIn(['_internal', 'displayHistory'])

        if (!prevProps.ticketBody.equals(this.props.ticketBody) && this.wasAtBottomOfPage) {
            // if history is displayed we set scroll on `main-content` wrapper
            const className = isHistoryDisplayed ? appCss['main-content'] : 'ticket-content'
            const element = document.getElementsByClassName(className)[0]
            element.scrollTop = element.scrollHeight
        }
    }

    _handlePreSubmit = (...args) => {
        if (this.refs.newMessageForm.checkValidity()) {
            this.statusParams = args
        } else {
            this.statusParams = []
        }
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        this.props.submit(...this.statusParams)
    }

    _renderCollisionDetection = () => {
        const {agentsViewing, agentsTyping} = this.props

        const agentsViewingNotTyping = agentsViewing.filter((userId) => !agentsTyping.contains(userId))

        return (
            <div
                className={classnames(css.viewersBanner, {
                    [css.hidden]: agentsViewing.size <= 0 && agentsTyping.size <= 0,
                })}
            >
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsTyping.size > 0 && (
                        <span className="mr-3">
                            <i className="fa fa-fw fa-pencil mr-2"/>
                            {viewsUtils.agentsTypingMessage(agentsTyping)}
                        </span>
                    )
                }
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsViewingNotTyping.size > 0 && (
                        <span>
                            <i className="fa fa-fw fa-eye mr-2"/>
                            {viewsUtils.agentsViewingMessage(agentsViewingNotTyping)}
                        </span>
                    )
                }
            </div>
        )
    }

    render = () => {
        const {
            ticket,
            users,
            usersIsLoading,
            actions,
            isTicketHidden,
            setStatus,
        } = this.props

        const isCreating = !ticket.get('id')

        const itemsCountInHistory = users.getIn(['userHistory', 'tickets'], fromJS([])).size
            + users.getIn(['userHistory', 'events'], fromJS([])).size

        const isHistoryDisplayed = ticket.getIn(['_internal', 'displayHistory'])

        const userHistory = this.props.users.get('userHistory') || fromJS({})
        const historyTickets = userHistory.get('tickets') || fromJS([])
        const historyOpenedTickets = historyTickets
            .filter(t => t.get('id') !== ticket.get('id')) // remove current ticket from history for the count
            .filter(t => t.get('status') !== 'closed') // count only open and new tickets
            .size
        const hasOpenedTicketsInHistory = historyOpenedTickets > 0

        const historyButtonLabel = isHistoryDisplayed
            ? 'Hide user history'
            : (
                <div>
                    <i className="fa fa-fw fa-arrow-up mr-1"/>
                    {
                        hasOpenedTicketsInHistory ? (
                            <span>Show other open tickets ({historyOpenedTickets})</span>
                        ) : (
                            <span>Show user history ({itemsCountInHistory})</span>
                        )
                    }
                </div>
            )

        const transparentHistoryButton = !ticket.get('id')
            || !users.getIn(['userHistory', 'hasHistory'])
            || usersIsLoading('history')

        const hideHistoryButton = !ticket.get('id')

        return (
            <div
                className={classnames(css.page, 'ticket-view', {
                    'transition out fade right': isTicketHidden,
                    [css['history-displayed']]: isHistoryDisplayed,
                })}
            >
                <div
                    className={classnames({
                        'mt-3': isCreating,
                    })}
                    style={{borderBottom: '1px solid #D5D7D7'}}
                >
                    <Timeline
                        actions={this.props.actions.ticket}
                        currentTicketId={this.props.ticket.get('id')}
                        isDisplayed={isHistoryDisplayed}
                        userHistory={userHistory}
                    />
                    {
                        !hideHistoryButton && (
                            <div className="history-btn-container hidden-sm-down">
                                <button
                                    className={classnames('ticket-history-btn', {
                                        transparent: transparentHistoryButton,
                                        rounded: isHistoryDisplayed,
                                        highlighted: hasOpenedTicketsInHistory,
                                    })}
                                    onClick={() => {
                                        const shouldOpenHistory = ticket.get('id')
                                            && users.getIn(['userHistory', 'hasHistory'])
                                            && !isHistoryDisplayed

                                        actions.ticket.toggleHistory(shouldOpenHistory)

                                        segmentTracker.logEvent(segmentTracker.EVENTS.USER_HISTORY_TOGGLED, {
                                            open: shouldOpenHistory,
                                            nbOfTicketsInTimeline: users.getIn(['userHistory', 'tickets']).size,
                                            channel: ticket.get('channel'),
                                            nbOfMessagesInTicket: ticket.get('messages').size,
                                        })
                                    }}
                                >
                                    {historyButtonLabel}
                                </button>
                            </div>
                        )
                    }
                    {
                        isHistoryDisplayed && (
                            <hr/>
                        )
                    }
                    <TicketHeader
                        ticket={ticket}
                        actions={actions}
                        hideTicket={this.props.hideTicket}
                    />

                    {this._renderCollisionDetection()}
                </div>

                <div
                    className={classnames('ticket-content', {
                        'mt-3': isCreating,
                        'history-displayed': isHistoryDisplayed,
                    })}
                    ref="ticketContent"
                >
                    {
                        !isCreating && (
                            <TicketBody
                                elements={this.props.ticketBody}
                                setStatus={setStatus}
                            />
                        )
                    }

                    <form
                        className={classnames('ticket-form', css.newMessageForm)}
                        onSubmit={this._handleSubmit}
                        ref="newMessageForm"
                    >
                        <ReplyMessageChannel
                            actions={this.props.actions}
                        />

                        <TicketReplyArea
                            actions={this.props.actions}
                            openModal={this.props.actions.macro.openModal}
                            currentUser={this.props.currentUser}
                            users={this.props.users}
                            macros={this.props.macros}
                            ticket={this.props.ticket}
                        />

                        <TicketSubmitButtons
                            ticket={ticket}
                            submit={this._handlePreSubmit}
                        />
                    </form>
                </div>
            </div>
        )
    }
}
