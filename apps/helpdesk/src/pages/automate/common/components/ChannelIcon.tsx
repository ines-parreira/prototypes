import classnames from 'classnames'

import { TicketChannel } from 'business/types/ticket'
import type { SelfServiceChannelType } from 'pages/automate/common/hooks/useSelfServiceChannels'

import css from './ChannelIcon.less'

type Props = {
    type: SelfServiceChannelType
}

const getIconFromChannelType = (
    type: SelfServiceChannelType,
): { icon: string; className?: string } => {
    switch (type) {
        case TicketChannel.Chat:
            return {
                icon: 'forum',
            }
        case TicketChannel.HelpCenter:
            return { icon: 'live_help' }
        case TicketChannel.ContactForm:
            return { icon: 'edit_note', className: css.contactFormIcon }
    }
}

const ChannelIcon = ({ type }: Props) => {
    const { icon, className: iconClassName } = getIconFromChannelType(type)

    return (
        <i className={classnames('material-icons', css.icon, iconClassName)}>
            {icon}
        </i>
    )
}

export default ChannelIcon
