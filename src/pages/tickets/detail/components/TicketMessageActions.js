import React, { PropTypes } from 'react'
import {fromJS} from 'immutable'
import _lowerCase from 'lodash/lowerCase'
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
                <div className="header">
                    Request
                    <i
                        className="remove action icon modal-close"
                        onClick={this._closeModal(id)}
                    />
                </div>
                <div className="content">
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
                                <JSONTree data={fromJS(action.arguments.json)}/>
                            </div>
                        )
                    }
                    {
                        !!action.response && (
                            <div className="ticket-message-actions-params-block">
                                <h2>Response</h2>
                                <p>Status code: <b>{action.response.status_code}</b></p>
                                <p className="ticket-message-actions-response-body">
                                    Body: {action.response.response}
                                </p>
                            </div>
                        )
                    }
                </div>
                <div className="actions">
                    <button type="button" className="ui button" onClick={this._closeModal(id)}>
                        Close
                    </button>
                </div>
            </div>
        )
    }

    render() {
        const { message } = this.props

        if (!message.actions) {
            return null
        }

        const backActions = message.actions.filter(action => getActionTemplate(action.name).execution === 'back')

        return (
            <div className="ticket-message-actions">
                {
                    backActions.map((action, index) => {
                        let color = 'olive'
                        let icon = 'circle check'

                        if (action.status === 'error') {
                            color = 'orange'
                            icon = 'circle remove'
                        } else if (action.status === 'pending') {
                            color = 'yellow'
                            icon = 'circle'
                        } else if (action.status === 'canceled') {
                            color = 'red'
                            icon = 'ban'
                        }

                        let contentType = null

                        if (action.arguments.headers) {
                            const contentTypeKey = fromJS(action.arguments.headers).keySeq().toList()
                                .find((k) => _lowerCase(k) === 'content type')

                            contentType = action.arguments.headers[contentTypeKey]
                        }

                        return (
                            <div
                                key={`message-actions-${index}`}
                                className="ticket-message-actions-item"
                            >
                                <button className={`ui icon labeled ${color} label`} onClick={this._openModal(index)}>
                                    <i className={`icon ${icon}`}/>
                                    {action.title}
                                </button>

                                {
                                    contentType && (
                                        <Modal
                                            isOpen={this.state.isModalOpen[index]}
                                            onRequestClose={this._closeModal(index)}
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
