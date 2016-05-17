import React, {PropTypes} from 'react'
import {formatDatetime} from '../../../utils'

export default class MessageQuote extends React.Component {
    constructor() {
        super()
        this.state = { collapsed: true }
    }

    renderQuote() {
        const { quotedMessage, currentUser } = this.props
        const date = formatDatetime(quotedMessage.get('created_datetime'), currentUser.get('timezone'))
        const email = quotedMessage.getIn(['sender', 'email']) ? ` <${quotedMessage.getIn(['sender', 'email'])}>` : ''

        return this.state.collapsed ? null : (
            <div className="message-quote-inner">
                <span>{`${date}, "${quotedMessage.getIn(['sender', 'name'])}"${email} sent:`}</span>
                <div
                    className="quote"
                    dangerouslySetInnerHTML={{ __html: quotedMessage.get('stripped_html')}}
                ></div>
            </div>
        )
    }

    render() {
        const { quotedMessage, currentMessage } = this.props

        // If a message has a predecessor (here called previousMessage)
        // whose body_html is unfindable in message.stripped_html,
        // then previousMessage was most likely updated by the message sender
        // To avoid data loss we'll display lastmessage.stripped_html in MessageQuote
        const enableQuote = quotedMessage
        && currentMessage.stripped_html
        && currentMessage.stripped_html.indexOf(quotedMessage.get('body_html')) === -1

        if (!enableQuote) return null

        return (
            <div className="message-quote">
                <div
                    className="mail-quote-toggle"
                    onClick={() => this.setState({ collapsed: !this.state.collapsed})}
                >
                    <i className="ellipsis horizontal icon"></i>
                </div>
                {this.renderQuote()}
			</div>
		)
    }
}

MessageQuote.propTypes = {
    quotedMessage: PropTypes.object,
    currentMessage: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
}
