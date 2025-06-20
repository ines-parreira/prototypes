import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'

import { ChannelWithMetadata } from '../../../types'

import css from '../ChannelsDrawer/ChannelsDrawer.less'

interface ContactFormTooltipProps {
    activeChannel: ChannelWithMetadata
}

export default function ContactFormTooltip({
    activeChannel,
}: ContactFormTooltipProps) {
    if (activeChannel.type !== 'contactForm') {
        return null
    }

    return (
        <IconTooltip
            className={css.contactFormInfo}
            tooltipProps={{ placement: 'top-start' }}
        >
            Contact forms can&apos;t be reassigned once assigned to a store. To
            change the mapping, delete the form and create a new one.
        </IconTooltip>
    )
}
