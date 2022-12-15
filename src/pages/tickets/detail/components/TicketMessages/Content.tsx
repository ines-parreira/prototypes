import React, {Component, useContext, useMemo} from 'react'
import classNames from 'classnames'
import _trim from 'lodash/trim'

import ReactPlayer from 'react-player'

import {MessageQuoteContext} from 'pages/tickets/detail/components/TicketBodyVirtualized'
import Ellipsis from 'pages/common/components/Ellipsis'
import {linkifyHtml, linkifyString, sanitizeHtmlDefault} from 'utils/html'
import {extractGorgiasVideoDivFromHtmlContent, proxifyImages} from 'utils'

import css from './Content.less'

type Props = {
    html?: string
    text?: string
    messageId: number | undefined
    toggleQuote: () => void
    strippedHtml?: string | null
    strippedText?: string | null
    isMessageExpanded: boolean
}

type State = {
    showFullBody: boolean
}

export class ContentComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {showFullBody: false}
    }

    _getDisplayContent = (content: string, isHtml: boolean): string | null => {
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
        this.props.toggleQuote()
    }

    render() {
        let {html, text, strippedHtml, strippedText} = this.props

        // trim values so we avoid displaying space only values
        html = _trim(html)
        text = _trim(text)
        strippedHtml = _trim(strippedHtml!)
        strippedText = _trim(strippedText!)

        const content = html || text || ''
        const isHtml = !!html
        const strippedContent =
            html && strippedHtml ? strippedHtml : strippedText

        // only show quoteButton if the contents of body and stripped are different
        // we're ignoring whitespaces because mailgun sends stripped_html without spaces
        const isStripped =
            strippedContent &&
            strippedContent.replace(/\s+/g, '') !== content.replace(/\s+/g, '')

        const contentToRender =
            isStripped && !this.props.isMessageExpanded
                ? strippedContent || ''
                : content

        let displayContent = this._getDisplayContent(contentToRender, isHtml)

        if (!displayContent && !isStripped) {
            return null
        }

        let videoUrls: string[] = []
        if (displayContent && isHtml) {
            const data = extractGorgiasVideoDivFromHtmlContent(displayContent)
            videoUrls = data.videoUrls
            displayContent = data.htmlCleaned
        }

        return (
            <div>
                <div
                    className={classNames(css.content, {
                        [css['white-space']]: !isHtml,
                    })}
                    dangerouslySetInnerHTML={{__html: displayContent!}}
                />
                {isStripped && (
                    <Ellipsis
                        title="Show full content"
                        onClick={this._onQuoteButtonClick}
                    />
                )}

                {videoUrls.length > 0 &&
                    videoUrls.map((url, idx) => (
                        <div key={idx} className={classNames(css.content)}>
                            <ReactPlayer
                                url={url}
                                controls={true}
                                light={true}
                                width={400}
                                height={(400 * 9) / 16}
                            />
                        </div>
                    ))}
            </div>
        )
    }
}

const Content = (props: Omit<Props, 'toggleQuote' | 'isMessageExpanded'>) => {
    const {messageId} = props
    const {toggleQuote, expandedQuotes} = useContext(MessageQuoteContext)

    const isMessageExpanded = useMemo(
        () => expandedQuotes.includes(messageId!),
        [messageId, expandedQuotes]
    )

    return (
        <ContentComponent
            {...props}
            toggleQuote={() => toggleQuote(messageId)}
            isMessageExpanded={isMessageExpanded}
        />
    )
}

export default Content
