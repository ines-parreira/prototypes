import React from 'react'
import {Link} from 'react-router-dom'

import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import Button from 'pages/common/components/button/Button'
import {
    SelfServiceChannel,
    SelfServiceChannelType,
} from 'pages/automate/common/hooks/useSelfServiceChannels'
import {TicketChannel} from 'business/types/ticket'

import css from './ConnectedChannelAccordionItem.less'
import ConnectedChannelAccordionBodyChat from './ConnectedChannelAccordionBodyChat'
import ConnectedChannelAccordionBodyHelpCenter from './ConnectedChannelAccordionBodyHelpCenter'
import ConnectedChannelIcon from './ConnectedChannelIcon'
import ConnectedChannelAccordionBodyStandaloneContactForm from './ConnectedChannelAccordionBodyStandaloneContactForm'

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

const ConnectedChannelAccordionItem = ({index, channel}: Props) => {
    return (
        <AccordionItem id={index.toString(10)}>
            <AccordionHeader>
                <div className={css.channelAccordionHeader}>
                    <ConnectedChannelIcon type={channel.type} />

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
