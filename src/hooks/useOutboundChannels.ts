import {useCallback} from 'react'
import {uniq} from 'lodash'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {prepare, setSender} from 'state/newMessage/actions'
import {getTicket} from 'state/ticket/selectors'
import {
    getIntegrations,
    getSendersForChannel,
} from 'state/integrations/selectors'
import {
    getNewMessageSource,
    getNewMessageSourceProperty,
} from 'state/newMessage/selectors'

import {Application, getApplications} from 'services/applications'
import {Source, SourceAddress, Ticket} from 'models/ticket/types'
import {
    isSource,
    isSourceAddress,
    isTicketMessageSourceType,
} from 'models/ticket/predicates'
import {Integration, IntegrationType} from 'models/integration/types'
import {TicketMessageSourceType} from 'business/types/ticket'

import {Channel, getChannels, isNewChannel, toChannel} from 'services/channels'
import {DEFAULT_SOURCE_TYPE} from 'tickets/common/config'

const LEGACY_OUTBOUND_SOURCES_BY_INTEGRATION: Partial<
    Record<IntegrationType, TicketMessageSourceType[]>
> = {
    [IntegrationType.Email]: [
        TicketMessageSourceType.Email,
        TicketMessageSourceType.EmailForward,
    ],
    [IntegrationType.Gmail]: [
        TicketMessageSourceType.Email,
        TicketMessageSourceType.EmailForward,
    ],
    [IntegrationType.Outlook]: [
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

    const source = useAppSelector(getNewMessageSource).toJS()
    const selectedChannel = getSelectedChannel(source)

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

function getSelectedChannel(
    source: Maybe<Source>
): Maybe<Channel | TicketMessageSourceType> {
    if (!isSource(source)) {
        return DEFAULT_SOURCE_TYPE
    }

    if (isTicketMessageSourceType(source.type)) {
        if (
            source.type === TicketMessageSourceType.Email &&
            source.extra?.forward
        ) {
            return TicketMessageSourceType.EmailForward
        }

        return source.type
    }

    return toChannel(source.type)
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

    return uniq(sources)
}

export const privateFunctions = {
    getSelectedChannel,
    getReplyChannelsForTicket,
    getLegacyReplySourcesForTicket,
}
