import React, {PropTypes} from 'react'
import {StickyContainer, Sticky} from 'react-sticky'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {connect} from 'react-redux'
import classnames from 'classnames'

import TicketHeader from './TicketHeader'

import TicketMessages from './TicketMessages'

import ReplyMessageChannel from './replyarea/ReplyMessageChannel'
import TicketReplyArea from './replyarea/TicketReplyArea'
import TicketSubmitButtonsContainer from './replyarea/TicketSubmitButtonsContainer'
import {logEvent} from '../../../../store/middlewares/amplitudeTracker'

import * as tagsSelectors from '../../../../state/tags/selectors'
import * as usersSelectors from '../../../../state/users/selectors'

import css from './TicketView.less'

export class TicketView extends React.Component {
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

    deleteMessage = (messageId) => {
        this.props.actions.ticket.deleteMessage(this.props.ticket.get('id'), messageId)
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

    _renderMessages = (isCreating = false) => {
        const {ticket} = this.props

        if (!isCreating) {
            return (
                <TicketMessages
                    currentUser={this.props.currentUser}
                    messages={ticket.get('messages')}
                    deleteMessage={this.deleteMessage}
                    loadingState={ticket.getIn(['_internal', 'loading'])}
                    ticket={ticket}
                />
            )
        }
    }

    render = () => {
        const {
            agentsViewing,
            ticket,
            users,
            usersIsLoading,
            actions,
            computeNextUrl,
            isTicketHidden
        } = this.props

        const isCreating = !ticket.get('id')

        const itemsCountInHistory = users.getIn(['userHistory', 'tickets'], fromJS([])).size
            + users.getIn(['userHistory', 'events'], fromJS([])).size

        const historyButtonLabel = !ticket.getIn(['_internal', 'displayHistory'])
            ? <p><i className="icon arrow circle up" />Show user history ({itemsCountInHistory})</p>
            : 'Hide user history'

        return (
            <div
                className={classNames(css.page, 'ticket-view', {
                    'transition out fade right': isTicketHidden
                })}
            >
                <StickyContainer>
                    <Sticky
                        topOffset={1}
                        style={{transform: 'none'}}
                    >
                        <div className="previous-btn-container">
                            <button
                                className={classNames(
                                    'ticket-previous-btn ui small button',
                                    {
                                        transparent: !ticket.get('id')
                                        || !users.getIn(['userHistory', 'hasHistory'])
                                        || ticket.getIn(['_internal', 'displayHistory'])
                                        || usersIsLoading('history')
                                    }
                                )}
                                onClick={() => {
                                    const shouldOpenHistory =
                                        ticket.get('id')
                                        && users.getIn(['userHistory', 'hasHistory'])
                                        && !ticket.getIn(['_internal', 'displayHistory'])

                                    if (shouldOpenHistory) {
                                        actions.ticket.toggleHistory(true)
                                        document.getElementsByClassName('TicketDetailContainer')[0].scrollTop = 0

                                        logEvent('Opened Timeline', {
                                            nbOfTicketsInTimeline: users.getIn(['userHistory', 'tickets']).size,
                                            channel: ticket.get('channel'),
                                            nbOfMessagesInTicket: ticket.get('messages').size
                                        })
                                    }
                                }}
                            >
                                {historyButtonLabel}
                            </button>
                        </div>
                        <TicketHeader
                            ticket={ticket}
                            actions={actions}
                            computeNextUrl={computeNextUrl}
                            hideTicket={this.props.hideTicket}
                        />

                        <div
                            className={classnames(css['viewers-banner'], {
                                [css.hidden]: agentsViewing.size <= 0,
                            })}
                        >
                            {
                                // we want to hide text during animation if there is no agents viewing
                                agentsViewing.size > 0 && (
                                    <span>
                                        {agentsViewing.map(agent => agent.get('name')).join(', ')}
                                        {' '}{agentsViewing.size > 1 ? 'are' : 'is'} viewing
                                    </span>
                                )
                            }
                        </div>
                    </Sticky>

                    <div className="ticket-content">
                        {this._renderMessages(isCreating)}

                        <form
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

                            <TicketSubmitButtonsContainer
                                ticket={ticket}
                                submit={this._handlePreSubmit}
                            />
                        </form>
                    </div>
                </StickyContainer>
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
    users: PropTypes.object.isRequired,
    usersIsLoading: PropTypes.func.isRequired,
    view: PropTypes.object
}

TicketView.defaultProps = {
    agentsViewing: fromJS([]),
}

function mapStateToProps(state) {
    return {
        activeView: state.views.get('active', fromJS({})),
        agents: usersSelectors.getAgents(state),
        agentsViewing: usersSelectors.getOtherAgentsOnTicket(state.ticket.get('id'))(state),
        currentUser: state.currentUser,
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
