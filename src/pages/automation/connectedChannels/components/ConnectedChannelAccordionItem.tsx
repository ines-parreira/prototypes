import React from 'react'
import {Link} from 'react-router-dom'

import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import AccordionItem from 'pages/common/components/accordion/AccordionItem'
import Button from 'pages/common/components/button/Button'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import SourceIcon from 'pages/common/components/SourceIcon'
import {TicketChannel} from 'business/types/ticket'

import css from './ConnectedChannelAccordionItem.less'
import ConnectedChannelAccordionBodyChat from './ConnectedChannelAccordionBodyChat'
import ConnectedChannelAccordionBodyHelpCenter from './ConnectedChannelAccordionBodyHelpCenter'

type Props = {
    index: number
    channel: SelfServiceChannel
}

const ConnectedChannelAccordionItem = ({index, channel}: Props) => {
    const channelSettingsUrl =
        channel.type === TicketChannel.HelpCenter
            ? `/app/settings/help-center/${channel.value.id}/preferences`
            : `/app/settings/channels/gorgias_chat/${channel.value.id}/preferences`
    const channelNamePrefix =
        channel.type === TicketChannel.HelpCenter ? 'Help Center' : 'Chat'

    return (
        <AccordionItem id={index.toString(10)}>
            <AccordionHeader>
                <div className={css.channelAccordionHeader}>
                    <SourceIcon
                        type={channel.type}
                        className={css.channelIcon}
                    />

                    <div className={css.channelName}>
                        {channelNamePrefix}: {channel.value.name}
                    </div>

                    <Link to={channelSettingsUrl}>
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
                    ) : (
                        <ConnectedChannelAccordionBodyHelpCenter
                            channel={channel}
                        />
                    )}
                </div>
            </AccordionBody>
        </AccordionItem>
    )
}

export default ConnectedChannelAccordionItem
