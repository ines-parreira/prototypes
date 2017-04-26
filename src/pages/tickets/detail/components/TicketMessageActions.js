import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import _get from 'lodash/get'
import {Button} from 'reactstrap'

import {getActionTemplate} from '../../../../utils'
import Modal from '../../../common/components/Modal'
import {JSONTree} from './../../../common/components/JSONTree'
import {JSON_CONTENT_TYPE, FORM_CONTENT_TYPE} from './../../../../config'

export default class TicketMessageActions extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            isModalOpen: {}
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

    _renderModalContent = (id, action, contentType) => {
        return (
            <div>
                <h3>Headers</h3>
                {
                    Object.keys(action.arguments.headers).map((arg, idx) => (
                        <p key={idx}><b>{arg}:</b> {action.arguments.headers[arg]}</p>
                    ))
                }
                <h3>URL Parameters</h3>
                {
                    Object.keys(action.arguments.params).map((arg, idx) => (
                        <p key={idx}><b>{arg}:</b> {action.arguments.params[arg]}</p>
                    ))
                }
                {
                    !!action.arguments.form && contentType === FORM_CONTENT_TYPE && (
                        <div className="ticket-message-actions-params-block">
                            <h3>Form Data</h3>
                            {
                                Object.keys(action.arguments.form).map((arg, idx) => (
                                    <p key={idx}><b>{arg}:</b> {action.arguments.form[arg]}</p>
                                ))
                            }
                        </div>
                    )
                }
                {
                    !!action.arguments.json && contentType === JSON_CONTENT_TYPE && (
                        <div className="ticket-message-actions-params-block">
                            <h3>JSON Data</h3>
                            <JSONTree data={fromJS(action.arguments.json)} />
                        </div>
                    )
                }
                {
                    !!action.response && (
                        <div className="ticket-message-actions-params-block">
                            <h2>Response</h2>
                            <p>Status code: <b>{action.response.status_code}</b></p>
                            <div className="ticket-message-actions-response-body">
                                <b>Body</b>:
                                <pre>
                                    <code>
                                        {action.response.response}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    )
                }
            </div>
        )
    }

    render() {
        const {message} = this.props

        if (!message.actions) {
            return null
        }

        const backActions = message.actions.filter(action => getActionTemplate(action.name).execution === 'back')

        if (backActions.length === 0) {
            return null
        }

        return (
            <div className="ticket-message-actions">
                {
                    backActions.map((action, index) => {
                        let color = 'success'
                        let icon = 'circle check'

                        if (action.status === 'error') {
                            color = 'danger'
                            icon = 'circle remove'
                        } else if (action.status === 'pending') {
                            color = 'secondary'
                            icon = 'circle'
                        } else if (action.status === 'canceled') {
                            color = 'danger'
                            icon = 'ban'
                        }

                        const contentType = _get(action, 'arguments.content_type')

                        return (
                            <div
                                key={`message-actions-${index}`}
                                className="ticket-message-actions-item"
                            >
                                <Button
                                    type="button"
                                    color={color}
                                    onClick={this._openModal(index)}
                                >
                                    <i className={`icon ${icon}`} />
                                    {action.title}
                                </Button>

                                {
                                    contentType && (
                                        <Modal
                                            isOpen={this.state.isModalOpen[index]}
                                            onClose={this._closeModal(index)}
                                            header="Request"
                                            size="lg"
                                        >
                                            {this._renderModalContent(index, action, contentType)}
                                        </Modal>
                                    )
                                }
                            </div>
                        )
                    })
                }
            </div>
        )
    }
}

TicketMessageActions.propTypes = {
    message: PropTypes.object.isRequired
}
