// @flow
import React from 'react'
import classnames from 'classnames'

import {proxifyImages} from '../../../../utils'
import {sanitizeHtmlDefault, linkifyHtml, linkifyString} from '../../../../utils/html'
import FacebookCarousel from './FacebookCarousel'

import css from './TicketMessageBody.less'
import Ellipsis from '../../../common/components/Ellipsis'

type messageType = {
    body_html: string,
    body_text: string,
    stripped_text: string,
    stripped_html: string,
    meta: {
        facebook_carousel: Array<*>
    }
}

type Props = {
    message: messageType,
    className?: string,
}

type State = {
    showFullBody: boolean
}

export default class TicketMessageBody extends React.Component<Props, State> {
    constructor() {
        super()
        this.state = {showFullBody: false}
    }

    render() {
        const {message, className} = this.props
        let body = message.body_html || message.body_text || ''
        const stripped = message.body_html && message.stripped_html ? message.stripped_html : message.stripped_text

        const bodyIsOnlyText = !message.body_html && body

        let quoteButton = null
        if (stripped) {
            // only show quoteButton if the contents of body and stripped are different
            // we're ignoring whitespaces because mailgun sends stripped_html without spaces
            if (stripped.replace(/\s+/g, '') !== body.replace(/\s+/g, '')) {
                quoteButton = (
                    <Ellipsis
                        title="Show full content"
                        onClick={() => this.setState({showFullBody: !this.state.showFullBody})}
                    />
                )
            }

            // by default we show only the stripped body
            if (!this.state.showFullBody) {
                body = stripped
            }
        }

        body = proxifyImages(body, '1000x')

        if (bodyIsOnlyText) {
            body = linkifyString(body)
        } else {
            // parse html before linkifying it.
            // linkifyjs's html tokenizer (simple-html-tokenizer) breaks and returns empty string
            // when encountering invalid chars or unsupported tags (CDATA, DOCTYPE, MDO, etc.).
            body = linkifyHtml(body)
        }

        body = sanitizeHtmlDefault(body)

        let content = body !== 'null' && (
            <div>
                <div
                    className={classnames({'new-line-interpret': bodyIsOnlyText})}
                    dangerouslySetInnerHTML={{__html: body}}
                />
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
            <div className={classnames(css.component, className)}>
                {content}
                {extension}
            </div>
        )
    }
}
