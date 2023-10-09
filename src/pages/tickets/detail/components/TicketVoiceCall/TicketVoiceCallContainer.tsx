import React from 'react'

import Avatar from 'pages/common/components/Avatar/Avatar'
import {User} from 'config/types/user'
import {Customer} from 'models/customer/types'
import css from './TicketVoiceCallContainer.less'

type Props = {
    initiatorLabel: JSX.Element
    user?: User | Customer
}

export default function TicketVoiceCallContainer({
    initiatorLabel,
    user,
}: Props) {
    return (
        <div className={css.container}>
            <Avatar name={user?.name} size={36} />
            <div className={css.row}>
                <div>{initiatorLabel}</div>
                <div>Datetime</div>
            </div>
        </div>
    )
}
