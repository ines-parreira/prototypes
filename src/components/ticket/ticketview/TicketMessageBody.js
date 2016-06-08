import React, {PropTypes} from 'react'
import linkifyStr from 'linkifyjs/string'

export default class TicketMessageBody extends React.Component {
    constructor() {
        super()
        this.state = {showFullBody: false}
    }

    render() {
        const {message} = this.props

        let body = message.body_html || message.body_text
        const stripped = message.stripped_html || message.stripped_text
        let quoteButton = null
        if (stripped) {
            quoteButton = (
                <div className="mail-quote-toggle"
                     onClick={() => this.setState({ showFullBody: !this.state.showFullBody})}>
                    <i className="ellipsis horizontal icon"/>
                </div>
            )
            // by default we show only the stripped body
            if (!this.state.showFullBody) {
                body = stripped
            }
        }

        let classNames = 'ticket-message-body'
        if (!message.body_html) {
            classNames += ' ticket-message-body-text'
            body = linkifyStr(body)
        }

        return (
            <div className={classNames}>
                <div dangerouslySetInnerHTML={{__html: body}}></div>
                {quoteButton}
            </div>
        )
    }
}

TicketMessageBody.propTypes = {
    message: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired
}
