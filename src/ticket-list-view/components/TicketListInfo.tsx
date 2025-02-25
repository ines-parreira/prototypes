import React from 'react'

import css from './TicketListInfo.less'

type TicketListInfoTextProps = {
    text: string
    subText: string
    action?: React.ReactNode
}
const TicketListInfo = ({ text, subText, action }: TicketListInfoTextProps) => {
    return (
        <div className={css.container}>
            <div className={css.content}>
                <div className={css.text}>{text}</div>
                <div className={css.subText}>{subText}</div>
                {action}
            </div>
        </div>
    )
}

export default TicketListInfo
