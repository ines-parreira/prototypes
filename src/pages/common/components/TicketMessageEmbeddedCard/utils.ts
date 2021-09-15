import {fromJS} from 'immutable'

import {QuotedTweet, TicketMessage} from '../../../../models/ticket/types'

import {TicketMessageSourceType} from '../../../../business/types/ticket'

export function mapQuotedTweetTicketMessageToEmbeddedCard(
    quotedTweetTicketMessage: TicketMessage
) {
    const quotedTweet =
        quotedTweetTicketMessage.meta?.quoted_tweet || ({} as QuotedTweet)

    return {
        textBelowAvatar: true,
        integrationId: quotedTweetTicketMessage.integration_id,
        messageText: quotedTweet?.text,
        source: {
            to: [{name: '', address: ''}],
            from: {
                name: quotedTweet?.user?.username,
                address: quotedTweet?.user?.id,
            },
            type: TicketMessageSourceType.TwitterTweet,
            extra: {
                conversation_id:
                    quotedTweetTicketMessage.source?.extra?.conversation_id,
            },
        },
        externalId: quotedTweet?.id,
        sender: {
            id: quotedTweet && quotedTweet.user ? +quotedTweet.user.id : 0,
            name: quotedTweet?.user?.name,
            email: '',
            firstname: quotedTweet?.user?.name,
            lastname: '',
            meta: {
                profile_picture_url: '',
            },
        },
        attachments: fromJS(quotedTweet?.attachments || []),
    }
}
