import React, {PropTypes} from 'react'
import linkifyStr from 'linkifyjs/string'
import sanitizeHtml from 'sanitize-html'

export default class TicketMessageBody extends React.Component {
    constructor() {
        super()
        this.state = {showFullBody: false}
    }

    render() {
        const {message} = this.props

        let body = message.body_html || message.body_text
        const stripped = message.body_html && message.stripped_html ? message.stripped_html : message.stripped_text

        let quoteButton = null
        if (stripped) {
            // only show quoteButton if the contents of body and stripped are different
            // we're ignoring whitespaces because mailgun sends stripped_html without spaces
            if (stripped.replace(/\s+/g, '') !== body.replace(/\s+/g, '')) {
                quoteButton = (
                    <div className="mail-quote-toggle"
                         onClick={() => this.setState({ showFullBody: !this.state.showFullBody})}
                    >
                        <i className="ellipsis horizontal icon"/>
                    </div>
                )
            }

            // by default we show only the stripped body
            if (!this.state.showFullBody) {
                body = stripped
            }
        }

        let classNames = 'ticket-message-body'
        if (!message.body_html) {
            classNames += ' ticket-message-body-text'
            if (body) {
                body = linkifyStr(body)
            }
        }

        body = sanitizeHtml(body, {
            allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div',
                'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre'],
            allowedAttributes: false,
            nonTextTags: ['style', 'script', 'textarea', 'noscript', 'title']
        })

        return (
            <div className={classNames}>
                <div dangerouslySetInnerHTML={{__html: body}}></div>
                {quoteButton}
            </div>
        )
    }
}

TicketMessageBody.propTypes = {
    message: PropTypes.object.isRequired
}
