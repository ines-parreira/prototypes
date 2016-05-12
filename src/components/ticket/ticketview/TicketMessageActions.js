import React, { PropTypes } from 'react'
import { ACTION_TEMPLATES } from '../../../constants'

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
                            color = 'teal'
                            icon = 'ban'
                        }

                        return (
                            <div key={`message-actions-${index}`} style={{ display: 'inline-block', marginRight: '5px' }}>
                                <div className={`ui icon labeled ${color} label`}>
                                    <i className={`icon ${icon}`}/>
                                    {action.title}
                                </div>
                                <div className="ui inverted popup">
                                    {
                                        Object.keys(action.arguments.headers).map((arg, idx) => (
                                            <p key={idx}>{arg}: {action.arguments.headers[arg]}</p>
                                        ))
                                    }
                                    {
                                        Object.keys(action.arguments.params).map((arg, idx) => (
                                            <p key={idx}>{arg}: {action.arguments.params[arg]}</p>
                                        ))
                                    }
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
