import React, {PropTypes} from 'react'
import ImmutablePropTypes from 'react-immutable-proptypes'
import {browserHistory, withRouter} from 'react-router'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import _pick from 'lodash/pick'

import {logEvent} from '../../../store/middlewares/amplitudeTracker'
import shortcutManager from '../../common/utils/shortcutManager'
import DocumentTitle from 'react-document-title'
import TicketView from './components/TicketView'
import Loader from '../../common/components/Loader'
import * as ViewsActions from '../../../state/views/actions'
import * as TicketActions from '../../../state/ticket/actions'
import * as MacroActions from '../../../state/macro/actions'
import * as UserActions from '../../../state/users/actions'
import * as TagActions from '../../../state/tags/actions'
import * as SettingsActions from '../../../state/settings/actions'
import MacroContainer from '../common/macros/MacroContainer'
import SocketIO from '../../common/utils/socketio'

import * as newMessageActions from '../../../state/newMessage/actions'
import * as viewsSelectors from '../../../state/views/selectors'
import * as ticketSelectors from '../../../state/ticket/selectors'

@withRouter
@connect((state) => {
    return {
        activeView: viewsSelectors.getActiveView(state),
        currentUser: state.currentUser,
        macros: state.macros,
        pagination: viewsSelectors.getPagination(state),
        users: state.users,
        routing: state.routing,
        ticket: state.ticket,
        newMessage: state.newMessage,
        tickets: state.tickets,
        isTicketDirty: ticketSelectors.isDirty(state),
    }
}, (dispatch) => {
    return {
        actions: {
            macro: bindActionCreators(MacroActions, dispatch),
            settings: bindActionCreators(SettingsActions, dispatch),
            tag: bindActionCreators(TagActions, dispatch),
            ticket: bindActionCreators(TicketActions, dispatch),
            user: bindActionCreators(UserActions, dispatch),
            views: bindActionCreators(ViewsActions, dispatch),
        },
        submitTicket: bindActionCreators(newMessageActions.submitTicket, dispatch),
        submitTicketMessage: bindActionCreators(newMessageActions.submitTicketMessage, dispatch),
    }
})
export default class TicketDetailContainer extends React.Component {
    static propTypes = {
        params: PropTypes.shape({
            view: PropTypes.string,
            page: PropTypes.string,
            ticketId: PropTypes.string
        }).isRequired,
        isTicketDirty: PropTypes.bool.isRequired,

        actions: PropTypes.object.isRequired,
        submitTicket: PropTypes.func.isRequired,
        submitTicketMessage: PropTypes.func.isRequired,
        activeView: PropTypes.object.isRequired,
        currentUser: PropTypes.object,
        macros: PropTypes.object,
        ticket: PropTypes.object,
        newMessage: PropTypes.object,
        tickets: PropTypes.object,
        users: PropTypes.object,
        pagination: ImmutablePropTypes.map.isRequired,

        routing: PropTypes.object,

        // React Router
        router: PropTypes.object.isRequired,
        route: PropTypes.object.isRequired
    }

    static defaultProps = {
        isTicketDirty: false,
    }

    state = {
        isTicketHidden: false,
    }

    _fetchTicketData = (ticketId) => this.props.actions.ticket.fetchTicket(ticketId)

    _showTicket = () => {
        this.setState({
            isTicketHidden: false,
        })
    }

    _hideTicket = () => {
        this.setState({
            isTicketHidden: true,
        })
    }

    componentWillMount() {
        this.props.actions.macro.fetchMacros()
        this.props.actions.tag.fetchTags()
        this.props.actions.user.fetchUsers(['agent', 'admin'])
        this.props.actions.ticket.clearTicket()
        this._fetchTicketData(this.props.params.ticketId)
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillReceiveProps(nextProps) {
        /**
         * Fetch the ticket's requester history (tickets + events) after the ticket's details have been loaded.
         */
        if (
            nextProps.params.ticketId !== 'new'
            && nextProps.ticket.get('requester')
            && !nextProps.users.getIn(['userHistory', 'triedLoading'])
        ) {
            const askedUserId = nextProps.ticket.getIn(['requester', 'id'], '')
            this.props.actions.user.fetchUserHistory(askedUserId, {
                successCondition(state) {
                    return state.ticket.getIn(['requester', 'id'], '').toString() === askedUserId.toString()
                }
            })
        }

        if (
            nextProps.params.ticketId !== this.props.params.ticketId
            && nextProps.params.ticketId !== 'new'
        ) {
            /**
             * Fetch required data when loading a ticket.
             */
            if (this.props.params.ticketId !== 'new') {
                // Don't clear when creating a new ticket: looks better this way
                this.props.actions.ticket.clearTicket()
            }

            this._fetchTicketData(nextProps.params.ticketId)
        }

        if (nextProps.params.ticketId !== this.props.params.ticketId) {
            this._showTicket()
        }
    }

    componentDidUpdate = (prevProps) => {
        const prevMacros = prevProps.macros.get('items')
        const macros = this.props.macros.get('items')
        if (prevMacros.size === 0 && macros.size !== 0) {
            this.props.actions.macro.previewMacro(macros.valueSeq().first())
        }

        if (prevProps.macros.get('isModalOpen') && !this.props.macros.get('isModalOpen')) {
            this._bindKeys()
        }
    }

    componentWillUnmount() {
        window.onbeforeunload = null

        shortcutManager.unbind('TicketDetailContainer')

        // leaving ticket and request user from socket io
        const io = new SocketIO()
        const ticketId = this.props.params.ticketId
        const requesterId = this.props.ticket.getIn(['requester', 'id'])
        if (ticketId) {
            io.leaveTicket(ticketId)
        }
        if (requesterId) {
            io.leaveUser(requesterId)
        }

        this.props.actions.ticket.clearTicket()
    }

    _bindKeys() {
        // Have to bind these here so they capture at the correct level
        const macrosVisible = () => this.props.macros.get('visible')
        const modalVisible = () => this.props.macros.get('isModalOpen')

        shortcutManager.bind('TicketDetailContainer', {
            SHOW_MACROS: {
                action: (e) => {
                    if (!macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        this.props.actions.macro.setMacrosVisible(true)
                    }
                }
            },
            HIDE_MACROS: {
                action: () => {
                    if (macrosVisible() && !modalVisible()) {
                        this.props.actions.macro.setMacrosVisible(false)
                    }
                }
            },
            APPLY_MACRO: {
                action: (e) => {
                    if (macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        e.stopPropagation()
                        if (this.props.macros.get('selected')) {
                            this._applyMacro(this.props.macros.get('selected'))
                        }
                    }
                }
            },
            PREVIEW_PREV_MACRO: {
                action: (e) => {
                    if (macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        this.props.actions.macro.previewAdjacentMacro('prev')
                    }
                }
            },
            PREVIEW_NEXT_MACRO: {
                action: (e) => {
                    if (macrosVisible() && !modalVisible()) {
                        e.preventDefault()
                        this.props.actions.macro.previewAdjacentMacro('next')
                    }
                }
            },
            GO_BACK: {
                action: () => {
                    if (!modalVisible()) {
                        const nextUrl = this._computeNextUrl(false)

                        if (nextUrl) {
                            browserHistory.push(nextUrl)
                        }
                    }
                }
            },
            GO_FORWARD: {
                action: () => {
                    if (!modalVisible()) {
                        const nextUrl = this._computeNextUrl(true)

                        if (nextUrl) {
                            browserHistory.push(nextUrl)
                        }
                    }
                }
            },
            SUBMIT_TICKET: {
                action: (e) => {
                    if (!modalVisible()) {
                        if (e.preventDefault) {
                            e.preventDefault()
                        }
                        this._submit()
                        logEvent('Sent message', {
                            ticket: _pick(this.props.ticket.toJS(), ['id', 'channel']),
                            andClose: false,
                        })
                    }
                }
            },
            SUBMIT_CLOSE_TICKET: {
                action: (e) => {
                    if (!modalVisible()) {
                        if (e.preventDefault) {
                            e.preventDefault()
                        }
                        this._submit('closed', true)
                        logEvent('Sent message', {
                            ticket: _pick(this.props.ticket.toJS(), ['id', 'channel']),
                            andClose: true,
                        })
                    }
                }
            }
        })
    }

    _applyMacro = (macro) => {
        this.props.actions.ticket.applyMacro(macro, this.props.ticket.get('id'))
    }

    _computeNextUrl = (ascending) => {
        let nextTicketUrl = '/app'
        const translation = ascending ? 1 : -1
        const ticketId = this.props.ticket.get('id')

        if (!ticketId) {
            return false
        }

        const currentTicketIndex = this.props.tickets.get('items', fromJS([]))
            .findIndex(ticket => ticket.get('id') === ticketId)

        if (!currentTicketIndex && currentTicketIndex !== 0) {
            return false
        }

        const nextIndex = currentTicketIndex + translation
        const nextTicket = this.props.tickets.get('items').toJS()[nextIndex]
        const activeView = this.props.activeView

        if (nextTicket && nextTicket.id) {
            nextTicketUrl = `/app/ticket/${nextTicket.id}`
        } else if (!activeView.isEmpty()) {
            nextTicketUrl = `/app/tickets/${activeView.get('id')}/${activeView.get('slug')}`

            const page = this.props.pagination.get('page')
            if (page && page > 1) {
                nextTicketUrl += `?page=${page}`
            }
        }

        return nextTicketUrl
    }

    _submit = (status, next, action, resetMessage = true) => {
        let {newMessage, ticket} = this.props
        if (newMessage.getIn(['_internal', 'loading', 'submitMessage'])) {
            // We're already submitting something, we dont want to POST twice.
            // Or the ticket isn't dirty, and we don't want to send an empty message.
            return
        }

        let promise

        // The ticket does not exist yet.
        if (!ticket.get('id')) {
            const receiver = newMessage.getIn(['newMessage', 'receiver'])
            const sender = {id: this.props.currentUser.get('id')}
            ticket = ticket.mergeDeep({
                sender,
                requester: receiver,
                receiver,
                newMessage: {
                    sender
                }
            })

            if (ticket.get('subject') || window.confirm('Are you sure you want to create a ticket with no subject?')) {
                promise = this.props.submitTicket(
                    ticket,
                    status,
                    this.props.ticket.getIn(['state', 'appliedMacro', 'actions']),
                    this.props.currentUser,
                    resetMessage
                )
            }
        } else {
            promise = this.props.submitTicketMessage(
                status,
                this.props.ticket.getIn(['state', 'appliedMacro', 'actions']),
                action,
                resetMessage
            )

            // clear applied action after submitting message
            this.props.actions.ticket.clearAppliedMacro(ticket.get('id'))
        }

        if (status && promise) {
            // set status
            promise.then(() => {
                return this._setStatus(status)
            })
        }
    }

    _setStatus = (status) => {
        return this.props.actions.ticket.setStatus(status, () => {
            if (status === 'closed') {
                const nextUrl = this._computeNextUrl(true)

                // redirect to the next ticket after the transition is done.
                if (nextUrl) {
                    this._hideTicket()
                    // delay redirect to let the hiding animation appear
                    setTimeout(() => browserHistory.push(nextUrl), 300)
                }
            }
        })
    }

    render() {
        if (
            (this.props.params.ticketId !== 'new' && !this.props.ticket.get('id'))
            || (this.props.params.ticketId === 'new' && this.props.ticket.get('id'))
            || this.props.ticket.getIn(['_internal', 'loading', 'fetchTicket'])
        ) {
            return <Loader message="Loading ticket..." />
        }

        return (
            <DocumentTitle title={this.props.ticket.get('id') ? this.props.ticket.get('subject') : 'New ticket'}>
                <div className="TicketDetailContainer">
                    <TicketView
                        actions={this.props.actions}
                        applyMacro={this._applyMacro}
                        computeNextUrl={this._computeNextUrl}
                        hideTicket={this._hideTicket}
                        isTicketHidden={this.state.isTicketHidden}
                        submit={this._submit}
                        view={this.props.activeView}
                        setStatus={this._setStatus}
                    />
                    <MacroContainer />
                </div>
            </DocumentTitle>
        )
    }
}
