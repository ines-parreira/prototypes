// @flow
import React from 'react'
import classNamesBind from 'classnames/bind'

import FacebookCarousel from '../FacebookCarousel'
import type {TicketMessage} from '../../../../../models/ticketElement/types'

import css from './Body.less'
import Content from './Content'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage,
    className?: string,
    hasError?: boolean
}

export default (props: Props) => {
    const {message, className} = props
    return (
        <div className={classNames(css.component, className, {
            hasError: props.hasError
        })}>
            <Content
                html={message.body_html}
                text={message.body_text}
                strippedHtml={message.stripped_html}
                strippedText={message.stripped_text}
            />
            {message.meta && message.meta.facebook_carousel && (
                <FacebookCarousel data={message.meta.facebook_carousel}/>
            )}
        </div>
    )
}
