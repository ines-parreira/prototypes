import {useCallback} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {prepare, setSender} from 'state/newMessage/actions'
import {getTicket} from 'state/ticket/selectors'
import {
    getIntegrations,
    getSendersForChannel,
} from 'state/integrations/selectors'
import {
    getNewMessageSourceProperty,
    getNewMessageType,
} from 'state/newMessage/selectors'

import {Application, getApplications} from 'services/applications'
import {SourceAddress, Ticket} from 'models/ticket/types'
import {
    isSourceAddress,
    isTicketMessageSourceType,
} from 'models/ticket/predicates'
import {Integration, IntegrationType} from 'models/integration/types'
import {TicketMessageSourceType} from 'business/types/ticket'

import {Channel, getChannels, isNewChannel, toChannel} from 'services/channels'

const LEGACY_OUTBOUND_SOURCES_BY_INTEGRATION: Partial<
    Record<IntegrationType, TicketMessageSourceType[]>
> = {
    [IntegrationType.Email]: [
        TicketMessageSourceType.Email,
        TicketMessageSourceType.EmailForward,
    ],
    [IntegrationType.GorgiasChat]: [TicketMessageSourceType.Chat],
    [IntegrationType.Facebook]: [
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookMentionComment,
        TicketMessageSourceType.FacebookReviewComment,
        TicketMessageSourceType.FacebookMessenger,

        TicketMessageSourceType.InstagramComment,
        TicketMessageSourceType.InstagramAdComment,
        TicketMessageSourceType.InstagramDirectMessage,
        TicketMessageSourceType.InstagramMentionComment,
    ],
    [IntegrationType.Twitter]: [
        TicketMessageSourceType.TwitterTweet,
        TicketMessageSourceType.TwitterDirectMessage,
        TicketMessageSourceType.TwitterQuotedTweet,
        TicketMessageSourceType.TwitterMentionTweet,
    ],
    [IntegrationType.Phone]: [TicketMessageSourceType.Phone],
    [IntegrationType.Sms]: [TicketMessageSourceType.Sms],
    [IntegrationType.WhatsApp]: [TicketMessageSourceType.WhatsAppMessage],
    [IntegrationType.Yotpo]: [TicketMessageSourceType.YotpoReview],
}

export const LEGACY_SOURCES_WITH_INITIATION: TicketMessageSourceType[] = [
    TicketMessageSourceType.InternalNote,
    TicketMessageSourceType.Email,
    TicketMessageSourceType.Sms,
    TicketMessageSourceType.Phone,
    TicketMessageSourceType.WhatsAppMessage,
]

export default function useOutboundChannels(): {
    channels: Array<Channel | TicketMessageSourceType>
    selectChannel: (channel: Maybe<Channel | TicketMessageSourceType>) => void
    selectedChannel: Maybe<Channel | TicketMessageSourceType>
} {
    const dispatch = useAppDispatch()

    const ticket = useAppSelector(getTicket)
    const integrations = useAppSelector(getIntegrations)
    const applications = getApplications()

    const newChannels = getReplyChannelsForTicket(ticket, applications)
    const legacyChannels = getLegacyReplySourcesForTicket(ticket, integrations)

    const newMessageSourceType = useAppSelector(getNewMessageType)
    const selectedChannel = isTicketMessageSourceType(newMessageSourceType)
        ? newMessageSourceType
        : toChannel(newMessageSourceType)

    const selectChannel = useCallback(
        (channel: Maybe<Channel | TicketMessageSourceType>) => {
            if (!channel) {
                return
            }

            if (isTicketMessageSourceType(channel)) {
                dispatch(prepare(channel))
            } else {
                dispatch(prepare(channel.slug as TicketMessageSourceType))
            }
        },
        [dispatch]
    )

    const channels = [...legacyChannels, ...newChannels]

    return {
        channels,
        selectChannel,
        selectedChannel,
    }
}

function getReplyChannelsForTicket(
    ticket: Partial<Ticket>,
    applications: Application[]
): Channel[] {
    const isNewTicket = !ticket?.id
    const replyOptions = ticket?.reply_options || {}

    return getChannels()
        .filter(isNewChannel)
        .reduce<Channel[]>((acc, channel: Channel) => {
            const applicationsForChannel = applications.filter(
                (app) => app.channel_id === channel.id
            )

            if (isNewTicket) {
                const hasApplication = applicationsForChannel.some(
                    (app) => app.messaging_config.supports_ticket_initiation
                )

                if (hasApplication) {
                    return [...acc, channel]
                }
            } else {
                const hasApplication = applicationsForChannel.some(
                    (app) => app.messaging_config.supports_replies
                )

                if (hasApplication && replyOptions[channel.slug]) {
                    return [...acc, channel]
                }
            }

            return acc
        }, [])
}

export function useSendersForSelectedChannel(): {
    senders: SourceAddress[]
    selectedSender: Maybe<SourceAddress>
    selectedChannel: Maybe<Channel | TicketMessageSourceType>
    selectSender: (sender: SourceAddress) => void
} {
    const dispatch = useAppDispatch()
    const {selectedChannel} = useOutboundChannels()
    const senders = useAppSelector((state) =>
        selectedChannel ? getSendersForChannel(selectedChannel)(state) : []
    )
    const from = useAppSelector(getNewMessageSourceProperty('from')).toJS()
    const selectedSender = isSourceAddress(from) ? from : undefined

    const selectSender = (sender: SourceAddress) => {
        dispatch(setSender(sender.address))
    }

    return {
        senders,
        selectedSender,
        selectedChannel,
        selectSender,
    }
}

function getLegacyReplySourcesForTicket(
    ticket: Partial<Ticket>,
    integrations: Integration[]
): TicketMessageSourceType[] {
    const isNewTicket = !ticket?.id
    const replyOptions = ticket?.reply_options || {}

    const sources = Object.entries(
        LEGACY_OUTBOUND_SOURCES_BY_INTEGRATION
    ).reduce<TicketMessageSourceType[]>(
        (acc, [integrationType, sourceTypes]) => {
            const hasIntegration = integrations.some(
                (integration) => integration.type === integrationType
            )

            if (!hasIntegration) {
                return acc
            }

            const validSources = sourceTypes
                .map((sourceType) => {
                    if (isNewTicket) {
                        const allowsInitiation =
                            LEGACY_SOURCES_WITH_INITIATION.includes(sourceType)

                        if (allowsInitiation) {
                            return sourceType
                        }
                    } else {
                        const isInReplyOptions = !!replyOptions[sourceType]
                        if (isInReplyOptions) {
                            return sourceType
                        }
                    }

                    return null
                })
                .filter(isTicketMessageSourceType)

            if (validSources.length === 0) {
                return acc
            }

            if (
                !isNewTicket &&
                validSources.includes(TicketMessageSourceType.Email)
            ) {
                return [
                    ...acc,
                    ...validSources,
                    TicketMessageSourceType.EmailForward,
                ]
            }

            return [...acc, ...validSources]
        },
        []
    )

    if (!!replyOptions[TicketMessageSourceType.InternalNote]) {
        return [TicketMessageSourceType.InternalNote, ...sources]
    }

    return sources
}

export const privateFunctions = {
    getReplyChannelsForTicket,
    getLegacyReplySourcesForTicket,
}
