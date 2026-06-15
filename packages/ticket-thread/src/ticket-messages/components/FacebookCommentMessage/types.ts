export type FacebookReactions = {
    page_reaction?: {
        reaction_type?: string
    }
}

export type FacebookCommentMeta = {
    facebook_reactions?: FacebookReactions
    replied_by?: { ticket_id: number; ticket_message_id: number }
    private_reply?: { already_sent?: boolean }
}
