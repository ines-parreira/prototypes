// @flow
import React from 'react'
import classNames from 'classnames'
import _trim from 'lodash/trim'

import {proxifyImages} from '../../../../../utils'
import {
    linkifyHtml,
    linkifyString,
    sanitizeHtmlDefault,
} from '../../../../../utils/html'
import Ellipsis from '../../../../common/components/Ellipsis'

type Props = {
    html?: string,
    text?: string,
    strippedHtml?: string,
    strippedText?: string,
}

type State = {
    showFullBody: boolean,
}

export default class Content extends React.Component<Props, State> {
    constructor() {
        super()
        this.state = {showFullBody: false}
    }

    _getDisplayContent = (content: string, isHtml: boolean): ?string => {
        let displayContent = content

        displayContent = proxifyImages(displayContent, '1000x')

        if (!isHtml) {
            displayContent = linkifyString(displayContent)
        } else {
            // parse html before linkifying it.
            // linkifyjs's html tokenizer (simple-html-tokenizer) breaks and returns empty string
            // when encountering invalid chars or unsupported tags (CDATA, DOCTYPE, MDO, etc.).
            displayContent = linkifyHtml(displayContent)
        }

        displayContent = sanitizeHtmlDefault(displayContent)

        return displayContent !== 'null' ? displayContent : null
    }

    _onQuoteButtonClick = () => {
        this.setState({showFullBody: !this.state.showFullBody})
    }

    render() {
        let {html, text, strippedHtml, strippedText} = this.props

        // trim values so we avoid displaying space only values
        html = _trim(html)
        text = _trim(text)
        strippedHtml = _trim(strippedHtml)
        strippedText = _trim(strippedText)

        const content = html || text || ''
        const isHtml = !!html
        const strippedContent =
            html && strippedHtml ? strippedHtml : strippedText

        // only show quoteButton if the contents of body and stripped are different
        // we're ignoring whitespaces because mailgun sends stripped_html without spaces
        const isStripped =
            strippedContent &&
            strippedContent.replace(/\s+/g, '') !== content.replace(/\s+/g, '')

        const displayContent = this._getDisplayContent(
            isStripped && !this.state.showFullBody
                ? strippedContent || ''
                : content,
            isHtml
        )

        if (!displayContent && !isStripped) {
            return null
        }

        return (
            <div>
                <div
                    className={classNames({'new-line-interpret': !isHtml})}
                    dangerouslySetInnerHTML={{__html: displayContent}}
                />
                {isStripped && (
                    <Ellipsis
                        title="Show full content"
                        onClick={this._onQuoteButtonClick}
                    />
                )}
            </div>
        )
    }
}
