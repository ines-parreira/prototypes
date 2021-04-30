export const FACEBOOK_PRIVATE_REPLY_ACTION = 'facebookPrivateReply'
export const INSTAGRAM_PRIVATE_REPLY_ACTION = 'instagramPrivateReply'

export const COMMENT_TICKET_PRIVATE_REPLY_EVENT =
    'CommentTicketPrivateReplyEvent'
export const MESSAGING_TICKET_PRIVATE_REPLY_EVENT =
    'MessagingTicketPrivateReplyEvent'

export const PRIVATE_REPLY_ACTIONS_MAP = Object.freeze({
    FACEBOOK_PRIVATE_REPLY_ACTION,
    INSTAGRAM_PRIVATE_REPLY_ACTION,
})

export const PRIVATE_REPLY_ACTIONS = Object.freeze(
    Object.values(PRIVATE_REPLY_ACTIONS_MAP)
)
