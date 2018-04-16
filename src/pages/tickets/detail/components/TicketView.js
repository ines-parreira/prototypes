import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import {Button} from 'reactstrap'

import TicketHeader from './TicketHeader'
import TicketBody from './TicketBody'

import Timeline from '../../../common/components/timeline/Timeline'
import ReplyMessageChannel from './replyarea/ReplyMessageChannel'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtons from './replyarea/TicketSubmitButtons'
import HistoryButton from './HistoryButton'
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
        views: state.views,
        isHistoryDisplayed: ticketSelectors.getDisplayHistory(state),
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
        isHistoryDisplayed: PropTypes.bool
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

    _getMainContent = () => {
        const className = this.props.isHistoryDisplayed ? appCss['main-content'] : css.ticketContent
        return document.getElementsByClassName(className)[0]
    }

    componentDidMount() {
        // scroll to the bottom of the ticket content the first time the ticket is viewed.
        // decrease the bottom padding, to avoid scrolling to a white screen on touchscreens.
        const styles = window.getComputedStyle(this.refs.ticketContent)
        const maxScrollTop = this.refs.ticketContent.scrollHeight - this.refs.ticketContent.clientHeight
        this.refs.ticketContent.scrollTop = maxScrollTop - parseInt(styles.paddingBottom)
    }

    componentWillReceiveProps() {
        // save before props update if user was at bottom of the page (probably answering something)
        // if history is displayed we calculate scroll on `main-content` wrapper
        const element = this._getMainContent()
        this.wasAtBottomOfPage = (element.scrollHeight - element.scrollTop) <= element.offsetHeight + 40
    }

    componentDidUpdate(prevProps) {
        // if ticket body (messages, events, etc.) changes but user is at bottom of the page,
        // then keep him at the bottom of the page
        if (!prevProps.ticketBody.equals(this.props.ticketBody) && this.wasAtBottomOfPage) {
            // if history is displayed we set scroll on `main-content` wrapper
            const element = this._getMainContent()
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

    _toggleHistory = () => {
        const {ticket, users, actions, isHistoryDisplayed} = this.props
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
                            <i className="material-icons mr-2">mode_edit</i>
                            {viewsUtils.agentsTypingMessage(agentsTyping)}
                        </span>
                    )
                }
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsViewingNotTyping.size > 0 && (
                        <span>
                            <i className="material-icons mr-2">remove_red_eye</i>
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
            isHistoryDisplayed,
        } = this.props
        const isCreating = !ticket.get('id')

        const userHistory = users.get('userHistory') || fromJS({})
        const hideHistoryButton = !ticket.get('id')

        return (
            <div
                className={classnames(css.page, {
                    'transition out fade right': isTicketHidden,
                })}
            >

                <div className={classnames(css.timeline, {
                    'd-none': !isHistoryDisplayed
                })}>
                    <Button
                        color="secondary"
                        className="btn-transparent mb-2 font-weight-medium"
                        onClick={this._toggleHistory}
                    >
                        <i className="material-icons md-2 mr-2">
                            close
                        </i>
                        Close ticket history
                    </Button>
                    <Timeline
                        actions={actions.ticket}
                        currentTicketId={ticket.get('id')}
                        userHistory={userHistory}
                        className="pb-4"
                    />
                </div>

                <div
                    className={css.headerContainer}
                >
                    <div className="d-flex">
                        {
                            !hideHistoryButton && (
                                <div className={classnames(css.historyButtonContainer, 'd-none d-md-flex align-items-center')}>
                                    <HistoryButton
                                        isHistoryDisplayed={isHistoryDisplayed}
                                        userHistory={userHistory}
                                        toggleHistory={this._toggleHistory}
                                        ticket={ticket}
                                        usersIsLoading={usersIsLoading}
                                    />
                                </div>
                            )
                        }

                        <TicketHeader
                            ticket={ticket}
                            actions={actions}
                            hideTicket={this.props.hideTicket}
                            className="flex-grow"
                        />
                    </div>

                    {this._renderCollisionDetection()}
                </div>

                <div
                    className={classnames(css.ticketContent, {
                        [css.historyDisplayed]: isHistoryDisplayed,
                        'mt-3': isCreating,
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
                        className={classnames('d-print-none', css.newMessageForm)}
                        onSubmit={this._handleSubmit}
                        ref="newMessageForm"
                    >
                        <ReplyMessageChannel
                            actions={this.props.actions}
                        />

                        <TicketReplyArea
                            actions={this.props.actions}
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
