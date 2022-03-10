import React, {Component} from 'react'
import {fromJS} from 'immutable'
import _get from 'lodash/get'
import classnames from 'classnames'

import {getActionTemplate} from 'utils'
import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Modal from 'pages/common/components/Modal'
import {JSONTree} from 'pages/common/components/JSONTree'
import {ContentType} from 'models/api/types'
import {MACRO_ACTION_NAME} from 'models/macroAction/constants'
import {TicketMessage, ActionStatus, Action} from 'models/ticket/types'

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
            <div>
                {Object.keys(action.arguments!).map((arg, idx) => {
                    if (!hiddenOptions.includes(arg)) {
                        let value: string =
                            action.arguments![
                                arg as keyof typeof action.arguments
                            ]

                        if (typeof value === 'boolean') {
                            value = (value as boolean).toString()
                        }

                        return (
                            <p key={idx}>
                                <b>{arg}:</b> {value}
                            </p>
                        )
                    }
                })}
            </div>
        )
    }

    _renderModalContent = (
        id: number,
        action: Action,
        contentType: ContentType
    ) => {
        return (
            <div>
                <h3>Headers</h3>
                {Object.keys(action.arguments!.headers!).map((arg, idx) => (
                    <p key={idx}>
                        <b>{arg}:</b> {action.arguments!.headers![arg]}
                    </p>
                ))}
                <h3>URL Parameters</h3>
                {Object.keys(action.arguments!.params!).map((arg, idx) => (
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
            </div>
        )
    }

    render() {
        const {message} = this.props

        if (!message.actions) {
            return null
        }

        const backActions = message.actions.filter(
            (action) => getActionTemplate(action.name)!.execution === 'back'
        )

        if (backActions.length === 0) {
            return null
        }

        return (
            <div className={classnames(css.component, 'mt-3')}>
                {backActions.map((action, index) => {
                    let intent = ButtonIntent.Primary
                    let icon = 'check'

                    if (action.status === ActionStatus.Error) {
                        intent = ButtonIntent.Destructive
                        icon = 'close'
                    } else if (action.status === ActionStatus.Pending) {
                        intent = ButtonIntent.Secondary
                        icon = 'refresh'
                    } else if ((action.status as any) === 'canceled') {
                        intent = ButtonIntent.Destructive
                        icon = 'block'
                    }

                    const isHttpAction = action.name === 'http'
                    const isShopifyAction = SHOPIFY_ACTION_NAMES.includes(
                        action.name
                    )
                    const contentType = _get(action, 'arguments.content_type')
                    return (
                        <div
                            key={`message-actions-${index}`}
                            className="d-inline-block mr-1"
                        >
                            <Button
                                intent={intent}
                                onClick={this._openModal(index)}
                            >
                                <ButtonIconLabel icon={icon}>
                                    {action.title}
                                </ButtonIconLabel>
                            </Button>
                            {isShopifyAction ? (
                                <Modal
                                    isOpen={this.state.isModalOpen[index]}
                                    onClose={this._closeModal(index)}
                                    header="Options"
                                    size="lg"
                                >
                                    {this._renderShopifyActionModalContent(
                                        index,
                                        action
                                    )}
                                </Modal>
                            ) : null}
                            {isHttpAction ? (
                                <Modal
                                    isOpen={this.state.isModalOpen[index]}
                                    onClose={this._closeModal(index)}
                                    header="Request"
                                    size="lg"
                                >
                                    {this._renderModalContent(
                                        index,
                                        action,
                                        contentType
                                    )}
                                </Modal>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        )
    }
}
