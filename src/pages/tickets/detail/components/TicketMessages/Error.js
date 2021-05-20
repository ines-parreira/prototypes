// @flow
import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {Button, Alert} from 'reactstrap'
import classnames from 'classnames'

import Tooltip from '../../../../common/components/Tooltip.tsx'

import * as TicketActions from '../../../../../state/ticket/actions.ts'
import * as NewMessageActions from '../../../../../state/newMessage/actions.ts'
import {getActionTemplate, stripErrorMessage} from '../../../../../utils.ts'

import css from './Error.less'

const CANCEL = 'cancel'
const FORCE = 'force'
const RETRY = 'retry'

type Props = {
    error?: string,
    retryTooltipMessage: string,
    actions: Object,

    ticketId: number,

    // TODO (@pwlmaciejewski): Once we upgrade Immutable to v4, it should be a RecordOf<Message>
    message: any,
    messageId: number,
    messageActions: Array<*>,

    setStatus?: (string) => void,

    retry?: boolean,
    force?: boolean,
    cancel?: boolean,
    newMessage: any,
}

type State = {
    showActions: boolean,
    loading: string,
}

class Error extends React.Component<Props, State> {
    static defaultProps = {
        error: '',
        messageActions: [],
        retryTooltipMessage: 'Retry to send the message.',
    }

    state = {
        showActions: false,
        loading: '',
    }

    uid: number

    constructor(props: Props) {
        super(props)
        this.uid = Date.now()
    }

    componentDidUpdate() {
        const {newMessage} = this.props
        const {loading} = this.state
        if (
            !newMessage.getIn(['_internal', 'loading', 'submitNewMessage']) &&
            loading
        ) {
            this.setState({loading: ''})
        }
    }

    retry = () => {
        const {message, actions, ticketId, messageId, setStatus} = this.props

        this.setState({loading: RETRY})

        if (messageId) {
            return actions.ticket.updateTicketMessage(
                ticketId,
                messageId,
                {failed_datetime: null},
                RETRY
            )
        }

        const status = message.getIn(['_internal', 'status'])
        return actions.newMessage.retrySubmitTicketMessage(message).then(() => {
            if (status && setStatus) {
                return setStatus(status)
            }

            return message
        })
    }

    cancel = () => {
        const {message, actions, ticketId, messageId} = this.props

        this.setState({loading: CANCEL})

        if (messageId) {
            return actions.ticket.deleteMessage(ticketId, messageId)
        }

        return actions.ticket.deleteTicketPendingMessage(message)
    }

    force = () => {
        const {actions, ticketId, messageId} = this.props
        this.setState({loading: FORCE})
        return actions.ticket.updateTicketMessage(
            ticketId,
            messageId,
            {},
            FORCE
        )
    }

    _toggleActions = () => {
        this.setState({showActions: !this.state.showActions})
    }

    render() {
        const {
            error,
            retryTooltipMessage,
            messageActions,
            retry,
            force,
            cancel,
        } = this.props

        let retryButton = null
        let forceButton = null
        let cancelButton = null

        if (retry) {
            const id = `retry-button-${this.uid}`

            retryButton = (
                <span className="mr-2">
                    <Button
                        id={id}
                        size="sm"
                        type="button"
                        outline={this.state.loading !== RETRY}
                        color="danger"
                        onClick={this.retry}
                        className="mb-1 mb-lg-0"
                        disabled={!!this.state.loading}
                    >
                        <i className="material-icons md-1 mr-2">cached</i>
                        Retry
                    </Button>
                    <Tooltip placement="top" target={id} offset="0, 4px">
                        {retryTooltipMessage}
                    </Tooltip>
                </span>
            )
        }

        if (force) {
            const id = `force-button-${this.uid}`

            forceButton = (
                <span className="mr-2">
                    <Button
                        id={id}
                        size="sm"
                        type="button"
                        outline={this.state.loading !== FORCE}
                        color="danger"
                        onClick={this.force}
                        className="mb-1 mb-lg-0"
                        disabled={!!this.state.loading}
                    >
                        <i className="material-icons md-1 mr-2">
                            chevron_right
                        </i>
                        Force
                    </Button>
                    <Tooltip placement="top" target={id} offset="0, 4px">
                        Ignore failure, execute other actions and send the
                        message
                    </Tooltip>
                </span>
            )
        }

        if (cancel) {
            const id = `cancel-button-${this.uid}`

            cancelButton = (
                <span>
                    <Button
                        id={id}
                        size="sm"
                        type="button"
                        outline={this.state.loading !== CANCEL}
                        color="danger"
                        onClick={this.cancel}
                        disabled={!!this.state.loading}
                    >
                        <i className="material-icons md-1 mr-2">
                            not_interested
                        </i>
                        Cancel
                    </Button>
                    <Tooltip
                        boundariesElement="viewport"
                        placement="top"
                        target={id}
                        offset="0, 4px"
                    >
                        Delete the message and never send it
                    </Tooltip>
                </span>
            )
        }

        const hasActions = !!messageActions.length

        return (
            <div
                className={classnames(css.component, {
                    [css.hasActions]: hasActions,
                    [css.showActions]: this.state.showActions,
                })}
            >
                <Alert color="danger">
                    <div className="d-md-flex align-items-center">
                        <i className="material-icons md-3 mr-3 d-none d-md-block">
                            error
                        </i>
                        <div className="text-danger mr-3 flex-grow mb-1 mb-md-0">
                            {error}

                            <a
                                className={css.toggleActions}
                                onClick={this._toggleActions}
                            >
                                Find out why?
                            </a>
                        </div>
                        <div className={css.buttons}>
                            {retryButton}
                            {forceButton}
                            {cancelButton}
                        </div>
                    </div>

                    <ul className={css.actions}>
                        {messageActions.map((action, idx) => {
                            if (
                                action.status === 'error' &&
                                action.response &&
                                action.response.msg
                            ) {
                                const template = getActionTemplate(action.name)
                                const transformedMsg = stripErrorMessage(
                                    action.response.msg
                                )

                                return (
                                    <li key={idx} className={css.actionError}>
                                        The action{' '}
                                        <b>{template ? template.title : ''}</b>{' '}
                                        failed because <b>{transformedMsg}</b>.
                                    </li>
                                )
                            }

                            return null
                        })}
                    </ul>
                </Alert>
            </div>
        )
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            ticket: bindActionCreators(TicketActions, dispatch),
            newMessage: bindActionCreators(NewMessageActions, dispatch),
        },
    }
}

const mapStateToProps = (state) => ({
    newMessage: state.newMessage,
})

export default connect(mapStateToProps, mapDispatchToProps)(Error)
