import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'
import _get from 'lodash/get'
import {Button} from 'reactstrap'
import classnames from 'classnames'

import {getActionTemplate} from '../../../../../utils.ts'
import Modal from '../../../../common/components/Modal'
import {JSONTree} from '../../../../common/components/JSONTree'
import {JSON_CONTENT_TYPE, FORM_CONTENT_TYPE} from '../../../../../config.ts'
import {MACRO_ACTION_NAME} from '../../../../../models/macroAction/constants'

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

export default class Actions extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isModalOpen: {},
        }

        this.modalState = {}
    }

    _openModal = (id) => {
        return () => {
            this.modalState[id] = true
            this.setState({isModalOpen: this.modalState})
        }
    }

    _closeModal = (id) => {
        return () => {
            this.modalState[id] = false
            this.setState({isModalOpen: this.modalState})
        }
    }

    _renderShopifyActionModalContent = (id, action) => {
        let hiddenOptions = ['tracking_event_name']
        return (
            <div>
                {Object.keys(action.arguments).map((arg, idx) => {
                    if (!hiddenOptions.includes(arg)) {
                        let value = action.arguments[arg]

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
            </div>
        )
    }

    _renderModalContent = (id, action, contentType) => {
        return (
            <div>
                <h3>Headers</h3>
                {Object.keys(action.arguments.headers).map((arg, idx) => (
                    <p key={idx}>
                        <b>{arg}:</b> {action.arguments.headers[arg]}
                    </p>
                ))}
                <h3>URL Parameters</h3>
                {Object.keys(action.arguments.params).map((arg, idx) => (
                    <p key={idx}>
                        <b>{arg}:</b> {action.arguments.params[arg]}
                    </p>
                ))}
                {!!action.arguments.form && contentType === FORM_CONTENT_TYPE && (
                    <div className="mt-3">
                        <h3>Form Data</h3>
                        {Object.keys(action.arguments.form).map((arg, idx) => (
                            <p key={idx}>
                                <b>{arg}:</b> {action.arguments.form[arg]}
                            </p>
                        ))}
                    </div>
                )}
                {!!action.arguments.json && contentType === JSON_CONTENT_TYPE && (
                    <div className="mt-3">
                        <h3>JSON Data</h3>
                        <JSONTree data={fromJS(action.arguments.json)} />
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
            (action) => getActionTemplate(action.name).execution === 'back'
        )

        if (backActions.length === 0) {
            return null
        }

        return (
            <div className={classnames(css.component, 'mt-3')}>
                {backActions.map((action, index) => {
                    let color = 'success'
                    let icon = 'check'

                    if (action.status === 'error') {
                        color = 'danger'
                        icon = 'close'
                    } else if (action.status === 'pending') {
                        color = 'secondary'
                        icon = 'refresh'
                    } else if (action.status === 'canceled') {
                        color = 'danger'
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
                                type="button"
                                color={color}
                                onClick={this._openModal(index)}
                            >
                                <i
                                    className={classnames(
                                        'material-icons mr-2',
                                        {
                                            'md-spin': icon === 'refresh',
                                        }
                                    )}
                                >
                                    {icon}
                                </i>
                                {action.title}
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

Actions.propTypes = {
    message: PropTypes.object.isRequired,
}
