import React from 'react'
import classNames from 'classnames'
import Avatar from 'pages/common/components/Avatar/Avatar'
import {User} from 'config/types/user'
import {Customer} from 'models/customer/types'
import {DatetimeLabel} from 'pages/common/utils/labels'

import css from './TicketVoiceCallContainer.less'

type Props = {
    header: JSX.Element
    user?: User | Customer
    callStatus: JSX.Element | string | null
    dateTime: string
}

export default function TicketVoiceCallContainer({
    header,
    user,
    callStatus,
    dateTime,
}: Props) {
    return (
        <div className={css.container}>
            <Avatar name={user?.name} size={36} />
            <div className={css.callDetails}>
                <div className={css.row}>
                    <div className={css.header}>
                        {header}
                        <i
                            className={classNames(
                                'material-icons',
                                css.phoneIcon
                            )}
                        >
                            phone
                        </i>
                    </div>
                    <DatetimeLabel
                        dateTime={dateTime}
                        className={classNames('text-faded', css.date)}
                        breakDate
                    />
                </div>
                <div>{callStatus}</div>
            </div>
        </div>
    )
}
