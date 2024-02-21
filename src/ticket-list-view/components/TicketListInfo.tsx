import React from 'react'

import css from './TicketListInfo.less'

type TicketListInfoTextProps = {
    text: string
    subText: string
}
const TicketListInfo = ({text, subText}: TicketListInfoTextProps) => {
    return (
        <div className={css.container}>
            <div className={css.text}>{text}</div>
            <div className={css.subText}>{subText}</div>
        </div>
    )
}

export default TicketListInfo
