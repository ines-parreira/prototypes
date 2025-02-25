import React from 'react'

import classNamesBind from 'classnames/bind'

import { TicketMessage } from 'models/ticket/types'

import SourceDetailsFooter from './SourceDetailsFooter'

import css from './Footer.less'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string
    message: TicketMessage
    isMessageHidden: boolean
    isMessageDeleted: boolean
}

export default function Footer(props: Props) {
    const { message, isMessageHidden, isMessageDeleted } = props
    return (
        <div className={classNames(css.footer)}>
            <SourceDetailsFooter
                className={css.sourceDetails}
                message={message}
                isMessageHidden={isMessageHidden}
                isMessageDeleted={isMessageDeleted}
            />
        </div>
    )
}
