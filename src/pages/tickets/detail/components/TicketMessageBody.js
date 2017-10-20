// @flow
import React from 'react'
import linkifyStr from 'linkifyjs/string'
import Clipboard from 'clipboard'
import {connect} from 'react-redux'
import _noop from 'lodash/noop'

import {sanitizeHtmlDefault, proxifyImages} from '../../../../utils'
import FacebookCarousel from './FacebookCarousel'
import {isDoubleTap} from '../../../common/utils/touch'
import {notify} from '../../../../state/notifications/actions'

import type {Node} from 'react'

type clipboardType = {
    destroy: () => void,
}

type messageType = {
    body_html: string,
    body_text: string,
    stripped_text: string,
    stripped_html: string,
    meta: {
        facebook_carousel: {}
    }
}

type Props = {
    message: messageType,
    notify: ({}) => void,
}

type State = {
    showFullBody: boolean
}

class TicketMessageBody extends React.Component<Props, State> {
    constructor() {
        super()
        this.state = {showFullBody: false}
    }

    _clipboard: clipboardType = {destroy: _noop}
    _message: ?Node = null

    componentDidMount() {
        this._bindClipboard()
    }

    componentWillUnmount() {
        this._clipboard.destroy()
    }

    _bindClipboard = () => {
        if (!this._message) {
            return
        }

        this._clipboard = new Clipboard(this._message, {
            text: (trigger) => isDoubleTap(trigger) ? trigger.getAttribute('data-clipboard-text') : null
        })

        this._clipboard.on('success', () => this.props.notify({message: 'Copied!'}))
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
                        title="Show full content"
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

        let content = body !== 'null' && (
            <div>
                <div dangerouslySetInnerHTML={{__html: body}} />
                {quoteButton}
            </div>
        )

        let extension = null

        if (message.meta && message.meta.facebook_carousel) {
            extension = (
                <FacebookCarousel data={message.meta.facebook_carousel}/>
            )
        }

        return (
            <div
                className={classNames}
                data-clipboard-text={message.body_text}
                ref={(ref) => this._message = ref}
            >
                {content}
                {extension}
            </div>
        )
    }
}

export default connect(null, {
    notify
})(TicketMessageBody)
