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
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

import * as tagsSelectors from '../../../../state/tags/selectors'
import * as usersSelectors from '../../../../state/users/selectors'
import * as ticketSelectors from '../../../../state/ticket/selectors'

import * as viewsUtils from '../../../../state/views/utils'

import css from './TicketView.less'

export class TicketView extends React.Component {
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

    componentWillReceiveProps() {
        // save before props update if user was at bottom of the page (probably answering something)
        const element = document.getElementsByClassName('ticket-content')[0]
        this.wasAtBottomOfPage = (element.scrollHeight - element.scrollTop) === element.offsetHeight
    }

    componentDidUpdate(prevProps) {
        // if ticket body (messages, events, etc.) changes but user is at bottom of the page,
        // then keep him at the bottom of the page
        if (!prevProps.ticketBody.equals(this.props.ticketBody) && this.wasAtBottomOfPage) {
            const element = document.getElementsByClassName('ticket-content')[0]
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
        const {agentsViewing} = this.props

        return (
            <div
                className={classnames(css['viewers-banner'], {
                    [css.hidden]: agentsViewing.size <= 0,
                })}
            >
                {
                    // we want to hide text during animation if there is no agents viewing
                    agentsViewing.size > 0 && (
                        <span>
                            <i className="unhide icon" />
                            {' '}{viewsUtils.agentsViewingMessage(agentsViewing)}
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
            computeNextUrl,
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
                <p>
                    <i className="icon arrow circle up mr-1" />
                    {
                        hasOpenedTicketsInHistory ? (
                                <span>Show other open tickets ({historyOpenedTickets})</span>
                            ) : (
                                <span>Show user history ({itemsCountInHistory})</span>
                            )
                    }
                </p>
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
                                    className={classnames('ticket-history-btn ui small button', {
                                        transparent: transparentHistoryButton,
                                        rounded: isHistoryDisplayed,
                                        highlighted: hasOpenedTicketsInHistory,
                                    })}
                                    onClick={() => {
                                        const shouldOpenHistory = ticket.get('id')
                                            && users.getIn(['userHistory', 'hasHistory'])
                                            && !isHistoryDisplayed

                                        const eventName = shouldOpenHistory ? 'Opened Timeline' : 'Closed Timeline'

                                        if (shouldOpenHistory) {
                                            actions.ticket.toggleHistory(true)
                                        } else {
                                            actions.ticket.toggleHistory(false)
                                        }

                                        logEvent(eventName, {
                                            nbOfTicketsInTimeline: users.getIn(['userHistory', 'tickets']).size,
                                            channel: ticket.get('channel'),
                                            nbOfMessagesInTicket: ticket.get('messages').size
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
                            <hr />
                        )
                    }
                    <TicketHeader
                        ticket={ticket}
                        actions={actions}
                        computeNextUrl={computeNextUrl}
                        hideTicket={this.props.hideTicket}
                    />

                    {this._renderCollisionDetection()}
                </div>

                <div
                    className={classnames('ticket-content', {
                        'mt-3': isCreating,
                    })}
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
                        className={css['new-message-form']}
                        onSubmit={this._handleSubmit}
                        ref="newMessageForm"
                    >
                        <ReplyMessageChannel
                            ticket={this.props.ticket}
                            actions={this.props.actions}
                            settings={this.props.settings}
                        />

                        <TicketReplyArea
                            actions={this.props.actions}
                            applyMacro={this.props.applyMacro}
                            previewMacro={this.props.actions.macro.previewMacro}
                            previewMacroInModal={this.props.actions.macro.previewMacroInModal}
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

TicketView.propTypes = {
    actions: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    agentsViewing: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    computeNextUrl: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    hideTicket: PropTypes.func.isRequired,
    isTicketHidden: PropTypes.bool.isRequired,
    macros: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    tags: PropTypes.object.isRequired,
    ticket: PropTypes.object.isRequired,
    ticketBody: PropTypes.object.isRequired,
    users: PropTypes.object.isRequired,
    usersIsLoading: PropTypes.func.isRequired,
    setStatus: PropTypes.func.isRequired,
    view: PropTypes.object,
}

TicketView.defaultProps = {
    agentsViewing: fromJS([]),
    setStatus: _noop
}

function mapStateToProps(state) {
    return {
        activeView: state.views.get('active', fromJS({})),
        agents: usersSelectors.getAgents(state),
        agentsViewing: usersSelectors.getOtherAgentsOnTicket(state.ticket.get('id'))(state),
        currentUser: state.currentUser,
        ticketBody: ticketSelectors.getBody(state),
        macros: state.macros,
        users: state.users,
        usersIsLoading: usersSelectors.makeIsLoading(state),
        routing: state.routing,
        settings: state.settings,
        tags: tagsSelectors.getTags(state),
        ticket: state.ticket,
        tickets: state.tickets,
        views: state.views
    }
}

export default connect(mapStateToProps)(TicketView)
