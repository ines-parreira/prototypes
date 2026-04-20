import { DurationInMs, slidingWindow } from '@repo/utils'

import { TicketThreadItemTag } from '../types'
import {
    isAiAgentDraftMessage,
    isAiAgentInternalNote,
    isAiAgentMessage,
    isAiAgentTrialMessage,
    isInternalNote,
    isSignalMessage,
    isSocialMediaFacebookComment,
    isSocialMediaFacebookMessage,
    isSocialMediaFacebookPost,
    isSocialMediaInstagramComment,
    isSocialMediaInstagramDirectMessage,
    isSocialMediaInstagramMedia,
    isSocialMediaInstagramStoryMention,
    isSocialMediaInstagramStoryReply,
    isSocialMediaTwitterDirectMessage,
    isSocialMediaTwitterTweet,
    isSocialMediaWhatsAppMessage,
    isTicketMessage,
} from './predicates'
import type {
    TicketThreadMessageData,
    TicketThreadMessageItem,
    TicketThreadPendingState,
    TicketThreadSingleMessageItem,
} from './types'

type ToTaggedMessageOptions = {
    pendingState?: TicketThreadPendingState
}

export function toTaggedMessage(
    message: TicketThreadMessageData,
    options: ToTaggedMessageOptions = {},
): TicketThreadSingleMessageItem {
    const datetime = message.created_datetime
    const metadata = options.pendingState
        ? {
              pendingState: options.pendingState,
          }
        : {}

    if (isAiAgentDraftMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isAiAgentTrialMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentTrialMessage,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isAiAgentInternalNote(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentInternalNote,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isAiAgentMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentMessage,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaFacebookComment(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaFacebookComment,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaFacebookPost(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaFacebookPost,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaFacebookMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaInstagramComment(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaInstagramStoryMention(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaInstagramStoryReply(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaInstagramDirectMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages
                .SocialMediaInstagramDirectMessage,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaInstagramMedia(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaTwitterTweet(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaTwitterTweet,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaTwitterDirectMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isSocialMediaWhatsAppMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
            data: message,
            datetime,
            ...metadata,
        }
    }

    if (isInternalNote(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.InternalNote,
            data: message,
            datetime,
            ...metadata,
        }
    }

    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: message,
        datetime,
        ...metadata,
    }
}

const GROUPING_CHANNELS = [
    'facebook-messenger',
    'instagram-direct-message',
    'chat',
    'whatsapp-message',
] as const
type GroupingChannels = (typeof GROUPING_CHANNELS)[number]

function isAiAgentThreadMessage(item: TicketThreadSingleMessageItem): boolean {
    switch (item._tag) {
        case TicketThreadItemTag.Messages.AiAgentMessage:
        case TicketThreadItemTag.Messages.AiAgentInternalNote:
        case TicketThreadItemTag.Messages.AiAgentDraftMessage:
        case TicketThreadItemTag.Messages.AiAgentTrialMessage:
            return true
        default:
            return false
    }
}

function shouldGroupConsecutiveMessages(
    msg1: TicketThreadSingleMessageItem,
    msg2: TicketThreadSingleMessageItem,
): boolean {
    if (isAiAgentThreadMessage(msg1) || isAiAgentThreadMessage(msg2)) {
        return false
    }

    const msg1Data = msg1.data
    const msg2Data = msg2.data

    if (!isTicketMessage(msg1Data) || !isTicketMessage(msg2Data)) {
        return false
    }

    if (isSignalMessage(msg1Data) || isSignalMessage(msg2Data)) {
        return false
    }

    if (
        msg1Data.sender.id !== msg2Data.sender.id ||
        msg1Data.channel !== msg2Data.channel ||
        msg1Data.public !== msg2Data.public ||
        msg1Data.from_agent !== msg2Data.from_agent
    ) {
        return false
    }

    if (!GROUPING_CHANNELS.includes(msg1Data.channel as GroupingChannels)) {
        return false
    }

    const msg1Created = new Date(msg1Data.created_datetime).getTime()
    const msg2Created = new Date(msg2Data.created_datetime).getTime()

    return msg2Created < msg1Created + DurationInMs.FiveMinutes
}

/**
 * Group consecutive messages into a single merged messages item if they meet the following criteria
 * - The messages are from the same channel (chat or facebook-messenger only)
 * - The messages are from the same sender
 * - The messages are both public
 * - The messages are from the same from_agent
 * - The messages are created within 5 minutes of each other
 * @param msg1
 * @param msg2
 * @returns
 */
export function groupConsecutiveMessages(
    messages: TicketThreadSingleMessageItem[],
): TicketThreadMessageItem[] {
    const items: TicketThreadMessageItem[] = []

    // Legacy grouping compares each candidate message with the first message of the
    // current group. The new architecture intentionally compares with the previous
    // message (sliding window), which can keep longer chains merged as long as each
    // adjacent pair remains within the five-minute window.
    // This might be re-visited later
    for (const [message, previousMessage] of slidingWindow(messages)) {
        if (
            previousMessage &&
            shouldGroupConsecutiveMessages(previousMessage, message)
        ) {
            const prevItem = items[items.length - 1]

            if (
                prevItem._tag === TicketThreadItemTag.Messages.GroupedMessages
            ) {
                prevItem.data.push(message)
            } else {
                items[items.length - 1] = {
                    _tag: TicketThreadItemTag.Messages.GroupedMessages,
                    data: [prevItem, message],
                    datetime: prevItem.datetime,
                }
            }
        } else {
            items.push(message)
        }
    }

    return items
}
