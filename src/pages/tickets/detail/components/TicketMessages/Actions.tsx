import React, {Component} from 'react'
import {fromJS} from 'immutable'
import _get from 'lodash/get'
import _truncate from 'lodash/truncate'
import classnames from 'classnames'

import {Badge} from 'reactstrap'
import {getActionTemplate, toRGBA} from 'utils'
import Spinner from 'pages/common/components/Spinner'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import {JSONTree} from 'pages/common/components/JSONTree'
import {ContentType} from 'models/api/types'
import {MACRO_ACTION_NAME} from 'models/macroAction/constants'
import {TicketMessage, ActionStatus, Action} from 'models/ticket/types'

import {ActionTemplate, ActionTemplateExecution} from 'config'
import {MacroActionName} from 'models/macroAction/types'
import Tooltip from 'pages/common/components/Tooltip'
import css from './Actions.less'

const SHOPIFY_ACTION_NAMES = [
    MACRO_ACTION_NAME.SHOPIFY_CANCEL_LAST_ORDER,
    MACRO_ACTION_NAME.SHOPIFY_CANCEL_ORDER,
    MACRO_ACTION_NAME.SHOPIFY_DUPLICATE_LAST_ORDER,
    MACRO_ACTION_NAME.SHOPIFY_EDIT_NOTE_LAST_ORDER,
    MACRO_ACTION_NAME.SHOPIFY_EDIT_SHIPPING_ADDRESS_LAST_ORDER,
    MACRO_ACTION_NAME.SHOPIFY_FULL_REFUND_LAST_ORDER,
    MACRO_ACTION_NAME.SHOPIFY_PARTIAL_REFUND_LAST_ORDER,
    MACRO_ACTION_NAME.SHOPIFY_REFUND_SHIPPING_COST_LAST_ORDER,
]
const displayedArg: Record<string, string> = {
    [MacroActionName.AddTags]: 'tags',
    [MacroActionName.AddAttachments]: 'attachments',
    [MacroActionName.AddInternalNote]: 'body_text',
    [MacroActionName.SetAssignee]: 'assignee_user',
    [MacroActionName.SetResponseText]: 'body_text',
    [MacroActionName.SetStatus]: 'status',
    [MacroActionName.SetSubject]: 'subject',
    [MacroActionName.SetTeamAssignee]: 'assignee_team',
    [MacroActionName.SnoozeTicket]: 'snooze_timedelta',
}

type Props = {
    message: TicketMessage
}

type State = {
    isModalOpen: Record<number, boolean>
}

export default class Actions extends Component<Props, State> {
    modalState: Record<number, boolean> = {}

    constructor(props: Props) {
        super(props)

        this.state = {
            isModalOpen: {},
        }
    }

    _openModal = (id: number) => {
        return () => {
            this.modalState[id] = true
            this.setState({isModalOpen: this.modalState})
        }
    }

    _closeModal = (id: number) => {
        return () => {
            this.modalState[id] = false
            this.setState({isModalOpen: this.modalState})
        }
    }

    _renderShopifyActionModalContent = (id: number, action: Action) => {
        const hiddenOptions = ['tracking_event_name']
        return (
            <ModalBody>
                {Object.keys(action.arguments!).map((arg, idx) => {
                    if (!hiddenOptions.includes(arg)) {
                        let value =
                            action.arguments![
                                arg as keyof typeof action.arguments
                            ]

                        if (typeof value === 'boolean') {
                            value = value.toString()
                        }

                        return (
                            <p key={idx}>
                                <b>{arg}:</b> {value}
                            </p>
                        )
                    }
                })}
            </ModalBody>
        )
    }

    _renderModalContent = (
        id: number,
        action: Action,
        contentType: ContentType
    ) => {
        return (
            <ModalBody>
                <h3>Headers</h3>
                {!!action.arguments?.headers &&
                    Object.keys(action.arguments.headers).map((arg, idx) => (
                        <p key={idx}>
                            <b>{arg}:</b> {action.arguments!.headers![arg]}
                        </p>
                    ))}
                <h3>URL Parameters</h3>
                {!!action.arguments?.params &&
                    Object.keys(action.arguments.params).map((arg, idx) => (
                        <p key={idx}>
                            <b>{arg}:</b> {action.arguments!.params![arg]}
                        </p>
                    ))}
                {!!action.arguments!.form && contentType === ContentType.Form && (
                    <div className="mt-3">
                        <h3>Form Data</h3>
                        {Object.keys(action.arguments!.form).map((arg, idx) => (
                            <p key={idx}>
                                <b>{arg}:</b> {action.arguments!.form![arg]}
                            </p>
                        ))}
                    </div>
                )}
                {!!action.arguments!.json && contentType === ContentType.Json && (
                    <div className="mt-3">
                        <h3>JSON Data</h3>
                        <JSONTree data={fromJS(action.arguments!.json)} />
                    </div>
                )}
                {!!action.response && (
                    <div className="mt-3">
                        <h2>Response</h2>
                        <p>
                            Status code: <b>{action.response.status_code}</b>
                        </p>
                        <div className={css.body}>
                            <b>Body</b>:
                            <pre>
                                <code>{action.response.response}</code>
                            </pre>
                        </div>
                    </div>
                )}
            </ModalBody>
        )
    }

    _renderActionArg = (action: Action) => {
        const key = displayedArg[action.name]
        const actionArgs = action.arguments as ActionTemplate['arguments']
        let arg = actionArgs && key ? actionArgs[key] : 'None'

        if (!arg) arg = 'None'
        if (typeof arg === 'object')
            arg =
                'name' in arg
                    ? ((arg as ActionTemplate['arguments'])!.name as string)
                    : 'None'

        if (action.name === MacroActionName.AddTags)
            arg = arg.split(',').join(', ')
        return _truncate(arg, {length: 20})
    }

    render() {
        const {message} = this.props

        if (!message.actions) return null

        const backActions = message.actions.filter(
            ({name}) =>
                getActionTemplate(name)!.execution !==
                ActionTemplateExecution.Front
        )

        if (backActions.length === 0) return null

        return (
            <div className={classnames(css.component, 'mt-3')}>
                <div className={classnames(css.title, 'mb-2 text-muted')}>
                    Macro actions performed:
                </div>
                {backActions.map((action, index) => {
                    const getIcon = (icon: string) => (
                        <i
                            className={classnames(
                                'material-icons mr-2',
                                css.icon
                            )}
                        >
                            {icon}
                        </i>
                    )
                    let icon = getIcon('check')
                    let color = '#20C08C'

                    if (action.status === ActionStatus.Pending) {
                        icon = <Spinner className={css.spinner} color="dark" />
                        color = '#1D365C'
                    } else if (
                        action.status === ActionStatus.Error ||
                        action.status === ActionStatus.Cancelled
                    ) {
                        icon = getIcon('info_outline')
                        color = '#F24F66'
                    }

                    const isHttpAction = action.name === 'http'
                    const isShopifyAction = SHOPIFY_ACTION_NAMES.includes(
                        action.name
                    )
                    const contentType = _get(action, 'arguments.content_type')

                    const arg = this._renderActionArg(action)

                    const isHTTPOrShopify = isHttpAction || isShopifyAction

                    return (
                        <div
                            key={`message-actions-${index}`}
                            className="d-inline-block ml-1 mr-1 mb-2"
                        >
                            {
                                <Badge
                                    cssModule={{badge: css.badge}}
                                    style={{
                                        color,
                                        backgroundColor: toRGBA(color, 0.05),
                                    }}
                                    id={`message-${message.id!}-actions-badge-${index}`}
                                >
                                    {icon}
                                    {action.title}
                                    {!isHTTPOrShopify && ': ' + arg}
                                </Badge>
                            }
                            {isHTTPOrShopify &&
                                action.status !== ActionStatus.Pending && (
                                    <Tooltip
                                        target={`message-${message.id!}-actions-badge-${index}`}
                                        autohide={false}
                                    >
                                        Action
                                        {action.status === ActionStatus.Success
                                            ? ' succeeded. '
                                            : ' failed. '}
                                        {
                                            <a
                                                href="#"
                                                onClick={this._openModal(index)}
                                            >
                                                More details
                                            </a>
                                        }
                                    </Tooltip>
                                )}
                            {isShopifyAction && (
                                <Modal
                                    isOpen={this.state.isModalOpen[index]}
                                    onClose={this._closeModal(index)}
                                    size="large"
                                >
                                    <ModalHeader title="Options" />
                                    {this._renderShopifyActionModalContent(
                                        index,
                                        action
                                    )}
                                </Modal>
                            )}
                            {isHttpAction && (
                                <Modal
                                    isOpen={this.state.isModalOpen[index]}
                                    onClose={this._closeModal(index)}
                                    size="large"
                                >
                                    <ModalHeader title="Request" />
                                    {this._renderModalContent(
                                        index,
                                        action,
                                        contentType
                                    )}
                                </Modal>
                            )}
                        </div>
                    )
                })}
            </div>
        )
    }
}
