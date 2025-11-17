import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import ChannelIcon from 'pages/automate/common/components/ChannelIcon'
import type {
    SelfServiceChannel,
    SelfServiceChannelType,
} from 'pages/automate/common/hooks/useSelfServiceChannels'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'

import ConnectedChannelAccordionBodyChat from './ConnectedChannelAccordionBodyChat'
import ConnectedChannelAccordionBodyHelpCenter from './ConnectedChannelAccordionBodyHelpCenter'
import ConnectedChannelAccordionBodyStandaloneContactForm from './ConnectedChannelAccordionBodyStandaloneContactForm'

import css from './ConnectedChannelAccordionItem.less'

type Props = {
    index: number
    channel: SelfServiceChannel
}

const channelSettingsUrl = (type: SelfServiceChannelType, id: number) => {
    switch (type) {
        case TicketChannel.HelpCenter:
            return `/app/settings/help-center/${id}/preferences`
        case TicketChannel.Chat:
            return `/app/settings/channels/gorgias_chat/${id}/preferences`
        case TicketChannel.ContactForm:
            return `/app/settings/contact-form/${id}/preferences`
    }
}

const channelNamePrefix = (type: SelfServiceChannelType) => {
    switch (type) {
        case TicketChannel.HelpCenter:
            return 'Help Center'
        case TicketChannel.Chat:
            return 'Chat'
        case TicketChannel.ContactForm:
            return 'Contact Form'
    }
}

/**
 * @deprecated This component is outdated and not used anymore. Do not add any new usage of this component.
 * @date 2025-10-02
 * @type automate-deprecation
 */
const ConnectedChannelAccordionItem = ({ index, channel }: Props) => {
    return (
        <AccordionItem id={index.toString(10)}>
            <AccordionHeader>
                <div className={css.channelAccordionHeader}>
                    <ChannelIcon type={channel.type} />

                    <div className={css.channelName}>
                        {channelNamePrefix(channel.type)}: {channel.value.name}
                    </div>

                    <Link
                        to={channelSettingsUrl(channel.type, channel.value.id)}
                    >
                        <Button fillStyle="ghost" size="small">
                            Go To Channel Settings
                        </Button>
                    </Link>
                </div>
            </AccordionHeader>

            <AccordionBody>
                <div className={css.featureList}>
                    {channel.type === TicketChannel.Chat ? (
                        <ConnectedChannelAccordionBodyChat channel={channel} />
                    ) : channel.type === TicketChannel.HelpCenter ? (
                        <ConnectedChannelAccordionBodyHelpCenter
                            channel={channel}
                        />
                    ) : (
                        <ConnectedChannelAccordionBodyStandaloneContactForm
                            channel={channel}
                        />
                    )}
                </div>
            </AccordionBody>
        </AccordionItem>
    )
}

export default ConnectedChannelAccordionItem
