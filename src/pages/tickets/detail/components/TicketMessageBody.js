import React, {PropTypes} from 'react'
import linkifyStr from 'linkifyjs/string'
import {sanitizeHtmlDefault, proxifyImages} from '../../../../utils'
import FacebookCarousel from './FacebookCarousel'

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
                    <div
                        className="mail-quote-toggle"
                        onClick={() => this.setState({showFullBody: !this.state.showFullBody})}
                    >
                        <i className="fa fa-fw fa-ellipsis-h" />
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

        body = proxifyImages(sanitizeHtmlDefault(body), '1000x')

        let content = (
            <div>
                <div dangerouslySetInnerHTML={{__html: body}} />
                {quoteButton}
            </div>
        )

        if (message.meta && message.meta.facebook_carousel) {
            content = (
                <FacebookCarousel data={message.meta.facebook_carousel}/>
            )
        }

        return (
            <div className={classNames}>
                {content}
            </div>
        )
    }
}

TicketMessageBody.propTypes = {
    message: PropTypes.object.isRequired
}
