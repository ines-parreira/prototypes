import { DurationInMs, slidingWindow } from '@repo/utils'

import type { TicketMessage } from '@gorgias/helpdesk-queries'

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
    TicketThreadMessageItem,
    TicketThreadSingleMessageItem,
} from './types'

export function toTaggedMessage(
    message: TicketMessage,
): TicketThreadSingleMessageItem {
    const datetime = message.created_datetime

    if (isAiAgentDraftMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentDraftMessage,
            data: message,
            datetime,
        }
    }

    if (isAiAgentTrialMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentTrialMessage,
            data: message,
            datetime,
        }
    }

    if (isAiAgentInternalNote(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentInternalNote,
            data: message,
            datetime,
        }
    }

    if (isAiAgentMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.AiAgentMessage,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaFacebookComment(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaFacebookComment,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaFacebookPost(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaFacebookPost,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaFacebookMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaFacebookMessage,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaInstagramComment(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramComment,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaInstagramStoryMention(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryMention,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaInstagramStoryReply(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramStoryReply,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaInstagramDirectMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages
                .SocialMediaInstagramDirectMessage,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaInstagramMedia(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaInstagramMedia,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaTwitterTweet(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaTwitterTweet,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaTwitterDirectMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaTwitterDirectMessage,
            data: message,
            datetime,
        }
    }

    if (isSocialMediaWhatsAppMessage(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.SocialMediaWhatsAppMessage,
            data: message,
            datetime,
        }
    }

    if (isInternalNote(message)) {
        return {
            _tag: TicketThreadItemTag.Messages.InternalNote,
            data: message,
            datetime,
        }
    }

    return {
        _tag: TicketThreadItemTag.Messages.Message,
        data: message,
        datetime,
    }
}

const GROUPING_CHANNELS = [
    'facebook-messenger',
    'chat',
    'whatsapp-message',
] as const
type GroupingChannels = (typeof GROUPING_CHANNELS)[number]

function shouldGroupConsecutiveMessages(
    msg1: TicketThreadSingleMessageItem,
    msg2: TicketThreadSingleMessageItem,
): boolean {
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
