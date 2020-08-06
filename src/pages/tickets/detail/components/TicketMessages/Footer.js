//@flow
import classNamesBind from 'classnames/bind'
import React from 'react'

import type {TicketMessage} from '../../../../../models/ticket/types'

import css from './Footer.less'
import SourceDetailsFooter from './SourceDetailsFooter'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string,
    message: TicketMessage,
    isMessageHidden: boolean,
}

export default function Footer(props: Props) {
    const {message, isMessageHidden} = props
    return (
        <div className={classNames(css.footer)}>
            <SourceDetailsFooter
                className={css.sourceDetails}
                message={message}
                isMessageHidden={isMessageHidden}
            />
        </div>
    )
}
