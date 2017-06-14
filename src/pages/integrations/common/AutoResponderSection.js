import React, {Component} from 'react'
import {Link} from 'react-router'

export default class AutoResponderSection extends Component {
    render() {
        return (
            <div className="mb-4">
                <h3>
                    Auto-responder
                </h3>
                <p>
                    When no agent is available for chat, you can activate an auto-responder{' '}
                    <Link to="/app/settings/chat">here</Link>
                </p>
            </div>
        )
    }
}
