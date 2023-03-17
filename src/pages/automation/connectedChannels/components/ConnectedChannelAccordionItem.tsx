import React from 'react'
import {Link} from 'react-router-dom'

import AccordionHeader from 'pages/common/components/accordion/AccordionHeader'
import AccordionBody from 'pages/common/components/accordion/AccordionBody'
import {SelfServiceChannel} from 'pages/automation/common/hooks/useSelfServiceChannels'
import SourceIcon from 'pages/common/components/SourceIcon'
import {TicketChannel} from 'business/types/ticket'

import css from './ConnectedChannelAccordionItem.less'
import ConnectedChannelAccordionBodyChat from './ConnectedChannelAccordionBodyChat'
import ConnectedChannelAccordionBodyHelpCenter from './ConnectedChannelAccordionBodyHelpCenter'

type Props = {
    channel: SelfServiceChannel
    articleRecommendationHelpCenterId: Maybe<number>
    emptyHelpCenter: boolean
    shopType: string
}

const ConnectedChannelAccordionItem = ({
    channel,
    articleRecommendationHelpCenterId,
    emptyHelpCenter,
    shopType,
}: Props) => {
    const channelSettingsUrl =
        channel.type === TicketChannel.HelpCenter
            ? `/app/settings/help-center/${channel.value.id}/preferences`
            : `/app/settings/channels/gorgias_chat/${channel.value.id}/preferences`

    return (
        <>
            <AccordionHeader>
                <div className={css.channelAccordionHeader}>
                    <SourceIcon
                        type={channel.type}
                        className={css.channelIcon}
                    />

                    <div className={css.channelName}>{channel.value.name}</div>

                    <Link
                        to={channelSettingsUrl}
                        className={css.channelSettingsLink}
                    >
                        Go To Channel Settings
                    </Link>
                </div>
            </AccordionHeader>

            <AccordionBody>
                {channel.type === TicketChannel.Chat ? (
                    <ConnectedChannelAccordionBodyChat
                        channel={channel}
                        articleRecommendationHelpCenterId={
                            articleRecommendationHelpCenterId
                        }
                        emptyHelpCenter={emptyHelpCenter}
                        shopType={shopType}
                    />
                ) : (
                    <ConnectedChannelAccordionBodyHelpCenter
                        channel={channel}
                    />
                )}
            </AccordionBody>
        </>
    )
}

export default ConnectedChannelAccordionItem
