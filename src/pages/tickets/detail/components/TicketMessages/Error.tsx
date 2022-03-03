import React, {Component} from 'react'
import {bindActionCreators} from 'redux'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Map} from 'immutable'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import {Action} from '../../../../../models/ticket/types'
import Tooltip from '../../../../common/components/Tooltip'
import Alert, {AlertType} from '../../../../common/components/Alert/Alert'
import * as TicketActions from '../../../../../state/ticket/actions'
import * as NewMessageActions from '../../../../../state/newMessage/actions'
import {getActionTemplate, stripErrorMessage} from '../../../../../utils'
import {RootState} from '../../../../../state/types'
import {sanitizeHtmlDefault} from '../../../../../utils/html'

import css from './Error.less'

const CANCEL = 'cancel'
const FORCE = 'force'
const RETRY = 'retry'

type Props = {
    error: string
    retryTooltipMessage: string
    ticketId: number
    message: Map<any, any>
    messageId: number
    messageActions: Array<Action>
    setStatus?: (status: string) => void
    retry?: boolean
    force?: boolean
    cancel?: boolean
} & ConnectedProps<typeof connector>

type State = {
    showActions: boolean
    loading: string
}

class Error extends Component<Props, State> {
    static defaultProps: Pick<
        Props,
        'error' | 'messageActions' | 'retryTooltipMessage'
    > = {
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
                {},
                RETRY
            )
        }

        const status = message.getIn(['_internal', 'status']) as string
        return (
            actions.newMessage.retrySubmitTicketMessage(
                message
            ) as unknown as Promise<any>
        ).then(() => {
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
                        onClick={this.retry}
                        isDisabled={!!this.state.loading}
                    >
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
                        onClick={this.force}
                        isDisabled={!!this.state.loading}
                    >
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
                        intent={ButtonIntent.Secondary}
                        onClick={this.cancel}
                        isDisabled={!!this.state.loading}
                    >
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
                <Alert
                    type={AlertType.Error}
                    icon
                    customActions={
                        <div className={css.buttons}>
                            {retryButton}
                            {forceButton}
                            {cancelButton}
                        </div>
                    }
                >
                    <div>
                        <span
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(error),
                            }}
                        />{' '}
                        <a
                            className={css.toggleActions}
                            onClick={this._toggleActions}
                        >
                            Find out why?
                        </a>
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

const connector = connect(
    (state: RootState) => ({
        newMessage: state.newMessage,
    }),
    (dispatch) => ({
        actions: {
            ticket: bindActionCreators(TicketActions, dispatch),
            newMessage: bindActionCreators(NewMessageActions, dispatch),
        },
    })
)

export default connector(Error)
