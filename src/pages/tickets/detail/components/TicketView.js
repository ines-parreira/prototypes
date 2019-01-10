import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import classnames from 'classnames'
import _noop from 'lodash/noop'
import {Button} from 'reactstrap'

import TicketHeader from './TicketHeader'
import TicketBody from './TicketBody'

import {AgentLabel} from '../../../common/utils/labels'
import Timeline from '../../../common/components/timeline/Timeline'
import ReplyMessageChannel from './replyarea/ReplyMessageChannel'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtons from './replyarea/TicketSubmitButtons'
import HistoryButton from './HistoryButton'
import * as segmentTracker from '../../../../store/middlewares/segmentTracker'

import * as tagsSelectors from '../../../../state/tags/selectors'
import * as customersSelectors from '../../../../state/customers/selectors'
import * as agentSelectors from '../../../../state/agents/selectors'
import * as ticketSelectors from '../../../../state/ticket/selectors'

import css from './TicketView.less'
import appCss from '../../../App.less'
import {getCustomersState} from '../../../../state/customers/selectors'

@connect((state) => {
    return {
        agents: agentSelectors.getAgents(state),
        agentsViewing: agentSelectors.getOtherAgentsOnTicket(state.ticket.get('id'))(state),
        agentsTyping: agentSelectors.getOtherAgentsTypingOnTicket(state.ticket.get('id'))(state),
        currentUser: state.currentUser,
        routing: state.routing,
        tags: tagsSelectors.getTags(state),
        ticket: state.ticket,
        ticketBody: ticketSelectors.getBody(state),
        customers: getCustomersState(state),
        customersIsLoading: customersSelectors.makeIsLoading(state),
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
        submit: PropTypes.func.isRequired,
        tags: PropTypes.object.isRequired,
        ticket: PropTypes.object.isRequired,
        ticketBody: PropTypes.object.isRequired,
        customers: PropTypes.object.isRequired,
        customersIsLoading: PropTypes.func.isRequired,
        setStatus: PropTypes.func.isRequired,
        view: PropTypes.object,
        isHistoryDisplayed: PropTypes.bool
    }

    static defaultProps = {
        agentsViewing: fromJS([]),
        agentsTyping: fromJS([]),
        setStatus: _noop
    }

    newMessageFormRef

    ticketContentRef

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
        if (this.ticketContentRef) {
            const styles = window.getComputedStyle(this.ticketContentRef)
            const maxScrollTop = this.ticketContentRef.scrollHeight - this.ticketContentRef.clientHeight
            this.ticketContentRef.scrollTop = maxScrollTop - parseInt(styles.paddingBottom)

            // don't steal focus if another component manages it.
            // (eg. new ticket focuses the editable title).
            // body is focused by default.
            if (document.activeElement === document.body) {
                // focus ticket content so we can keyboard scroll
                this.ticketContentRef.focus()
            }
        }
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
        if (this.newMessageFormRef.checkValidity()) {
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
        const {ticket, customers, actions, isHistoryDisplayed} = this.props
        const shouldOpenHistory = ticket.get('id')
            && customers.getIn(['customerHistory', 'hasHistory'])
            && !isHistoryDisplayed

        actions.ticket.toggleHistory(shouldOpenHistory)

        // TODO(customers-migration): ask confirmation to update this event
        segmentTracker.logEvent(segmentTracker.EVENTS.USER_HISTORY_TOGGLED, {
            open: shouldOpenHistory,
            nbOfTicketsInTimeline: customers.getIn(['customerHistory', 'tickets']).size,
            channel: ticket.get('channel'),
            nbOfMessagesInTicket: ticket.get('messages').size,
        })
    }

    _renderCollisionDetection = () => {
        const {agentsViewing, agentsTyping} = this.props
        const agentsViewingNotTyping = agentsViewing.filter((userId) => !agentsTyping.contains(userId))
        const hasBoth = agentsTyping.size > 0 && agentsViewingNotTyping.size > 0

        return (
            <div
                className={classnames(css.viewersBanner, {
                    [css.hidden]: agentsViewing.size <= 0 && agentsTyping.size <= 0,
                    [css.bothCollisions]: hasBoth
                })}
            >
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsTyping.size > 0 && (
                        <div className={css.collisionCategory}>
                            <i className={classnames(css.icon, 'material-icons')}>mode_edit</i>

                            <div className={css.collisionLabel}>
                                Typing:
                            </div>

                            {agentsTyping.map((agent, index) => (
                                <AgentLabel
                                    key={index}
                                    name={agent.get('name')}
                                    email={agent.get('email')}
                                    className={css.collisionAgent}
                                />
                            ))}
                        </div>
                    )
                }
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsViewingNotTyping.size > 0 && (
                        <div className={css.collisionCategory}>
                            <i className={classnames(css.icon, 'material-icons')}>remove_red_eye</i>

                            <div className={css.collisionLabel}>
                                Viewing:
                            </div>

                            {agentsViewingNotTyping.map((agent, index) => (
                                <AgentLabel
                                    key={index}
                                    name={agent.get('name')}
                                    email={agent.get('email')}
                                    className={css.collisionAgent}
                                />
                            ))}
                        </div>
                    )
                }
            </div>
        )
    }

    render = () => {
        const {
            ticket,
            customers,
            customersIsLoading,
            actions,
            isTicketHidden,
            setStatus,
            isHistoryDisplayed,
        } = this.props
        const isCreating = !ticket.get('id')

        const customerHistory = customers.get('customerHistory') || fromJS({})
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
                        customerHistory={customerHistory}
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
                                        customerHistory={customerHistory}
                                        toggleHistory={this._toggleHistory}
                                        ticket={ticket}
                                        customersIsLoading={customersIsLoading}
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
                    ref={ref => this.ticketContentRef = ref}
                    tabIndex="1"
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
                        ref={ref => this.newMessageFormRef = ref}
                    >
                        <ReplyMessageChannel
                            actions={this.props.actions}
                        />

                        <TicketReplyArea
                            actions={this.props.actions}
                            currentUser={this.props.currentUser}
                            customers={this.props.customers}
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
