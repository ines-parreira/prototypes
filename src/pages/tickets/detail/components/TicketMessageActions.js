import React, { PropTypes } from 'react'
import {fromJS} from 'immutable'
import _lowerCase from 'lodash/lowerCase'
import { ACTION_TEMPLATES } from '../../../../config'
import {JSONTree} from './../../../common/components/JSONTree'
import {JSON_CONTENT_TYPE, FORM_CONTENT_TYPE} from './../../../../state/macro/utils'

export default class TicketMessageActions extends React.Component {
    render() {
        const { message } = this.props

        if (!message.actions) {
            return null
        }

        const backActions = message.actions.filter(action => ACTION_TEMPLATES[action.name].execution === 'back')

        return (
            <div className="actions">
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

                        const contentTypeKey = fromJS(action.arguments.headers).keySeq().toList()
                            .find((k) => _lowerCase(k) === 'content type')

                        const contentType = action.arguments.headers[contentTypeKey]

                        return (
                            <div
                                key={`message-actions-${index}`}
                                style={{ display: 'inline-block', marginRight: '5px'}}
                            >
                                <div className={`ui icon labeled ${color} label`}>
                                    <i className={`icon ${icon}`}/>
                                    {action.title}
                                </div>
                                <div className="ui very wide popup" style={{padding: 0}}>
                                    <div style={{maxHeight: '400px', overflow: 'auto', padding: '15px'}}>
                                        <h2>Request</h2>
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
                                                <div style={{marginTop: '20px'}}>
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
                                                <div style={{marginTop: '20px'}}>
                                                    <h3>JSON Data</h3>
                                                    <JSONTree data={fromJS(action.arguments.json)}/>
                                                </div>
                                            )
                                        }
                                        {
                                            !!action.response && (
                                                <div style={{marginTop: '20px'}}>
                                                    <h2>Response</h2>
                                                    <p>Status code: <b>{action.response.status_code}</b></p>
                                                    <p style={{maxHeight: '150px', overflow: 'hidden'}}>
                                                        Body: {action.response.response}
                                                    </p>
                                                </div>
                                            )
                                        }
                                    </div>
                                </div>
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
