import React from 'react'
import classnames from 'classnames'

import {SelfServiceChannelType} from 'pages/automate/common/hooks/useSelfServiceChannels'
import {TicketChannel} from 'business/types/ticket'

import css from './ConnectedChannelIcon.less'

type Props = {
    type: SelfServiceChannelType
    className?: string
}

const getIconFromChannelType = (
    type: SelfServiceChannelType
): {icon: string; className?: string} => {
    switch (type) {
        case TicketChannel.Chat:
            return {
                icon: 'forum',
            }
        case TicketChannel.HelpCenter:
            return {icon: 'live_help'}
        case TicketChannel.ContactForm:
            return {icon: 'edit_note', className: css.contactFormIcon}
    }
}

const ConnectedChannelIcon = ({type, className, ...otherProps}: Props) => {
    const {icon, className: iconClassName} = getIconFromChannelType(type)

    return (
        <i
            className={classnames(
                'icon d-inline-block material-icons',
                css.icon,
                className,
                iconClassName
            )}
            {...otherProps}
        >
            {icon}
        </i>
    )
}

export default ConnectedChannelIcon
