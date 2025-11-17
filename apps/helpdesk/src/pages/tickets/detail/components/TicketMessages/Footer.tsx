import classNamesBind from 'classnames/bind'

import type { TicketMessage } from 'models/ticket/types'

import SourceDetailsFooter from './SourceDetailsFooter'

import css from './Footer.less'

const classNames = classNamesBind.bind(css)

type Props = {
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
