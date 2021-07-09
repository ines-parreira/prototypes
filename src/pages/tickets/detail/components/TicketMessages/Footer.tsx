import classNamesBind from 'classnames/bind'
import React from 'react'

import {TicketMessage} from '../../../../../models/ticket/types'

import css from './Footer.less'
import SourceDetailsFooter from './SourceDetailsFooter'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string
    message: TicketMessage
    isMessageHidden: boolean
    isMessageDeleted: boolean
}

export default function Footer(props: Props) {
    const {message, isMessageHidden, isMessageDeleted} = props
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
