type Source = {
    type: string
    extra?: {
        page_id?: string | null
        post_id?: string | null
        parent_id?: string | null
        permalink?: string | null
        open_graph_story_id?: string | null
        conversation_id?: string | null
    } | null
    from?: { name?: string | null } | null
    to?: Array<{ name?: string | null }> | null
}

type Meta = Record<string, unknown>

type BuildGoToLinkParams = {
    source?: Source | null
    meta?: Meta | null
    messageId?: string | null
    integrationId?: number | null
    externalId?: string | null
    messageCreatedDatetime?: string | null
}

export type GoToLink = {
    label: string
    type: string
    link: string
    replyingToUsername?: string
    replyingToLink?: string
}

const GO_TO_SOURCE_TYPES = new Set([
    'facebook-comment',
    'facebook-post',
    'facebook-mention-post',
    'facebook-mention-comment',
    'instagram-ad-media',
    'instagram-media',
    'instagram-mention-media',
    'facebook-review',
    'facebook-review-comment',
    'twitter-tweet',
    'twitter-quoted-tweet',
    'twitter-mention-tweet',
])

function getId(input: string, place = 1): string {
    return input?.includes('_') ? (input.split('_')[place] ?? '') : ''
}

function isStoryExpired(
    messageCreatedDatetime: string | null | undefined,
): boolean {
    if (!messageCreatedDatetime) return true
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000
    return new Date(messageCreatedDatetime).getTime() < twentyFourHoursAgo
}

export function buildGoToLink({
    source,
    meta,
    messageId,
    integrationId,
    externalId,
    messageCreatedDatetime,
}: BuildGoToLinkParams): GoToLink | null {
    const isStoryMention =
        source?.type === 'instagram-direct-message' && !!meta?.is_story_mention
    const isStoryReply =
        source?.type === 'instagram-direct-message' && !!meta?.is_story_reply

    if (messageId && integrationId && (isStoryMention || isStoryReply)) {
        if (isStoryExpired(messageCreatedDatetime)) return null
        return {
            label: 'go to',
            type: 'story',
            link: `/integrations/facebook/redirect/instagramstory?message_id=${messageId}&integration_id=${integrationId}`,
        }
    }

    if (
        !source?.type ||
        !source.extra ||
        !GO_TO_SOURCE_TYPES.has(source.type)
    ) {
        return null
    }

    const { type: sourceType, extra, from, to } = source
    const pageId = extra.page_id
    const fullPostId = extra.post_id
    const parentId = extra.parent_id
    const permalink = extra.permalink

    const pageFeedId =
        sourceType === 'facebook-mention-comment' && fullPostId
            ? getId(fullPostId, 0)
            : pageId

    if (sourceType === 'facebook-post') {
        const postId = fullPostId ? getId(fullPostId) : ''
        return {
            label: 'go to',
            type: 'post',
            link: permalink || `https://facebook.com/${pageId}/posts/${postId}`,
        }
    }

    if (sourceType === 'facebook-mention-post') {
        return permalink
            ? { label: 'go to', type: 'post', link: permalink }
            : null
    }

    if (sourceType === 'facebook-review' && messageId) {
        return {
            label: 'go to',
            type: 'review',
            link: `https://facebook.com/${messageId}`,
        }
    }

    if (sourceType === 'facebook-review-comment' && messageId) {
        let link = permalink
        if (!link && extra.open_graph_story_id) {
            const commentId = getId(messageId)
            link = `https://facebook.com/${extra.open_graph_story_id}/?comment_id=${commentId}`
        }
        return link ? { label: 'go to', type: 'comment', link } : null
    }

    if (
        sourceType === 'instagram-media' ||
        sourceType === 'instagram-ad-media' ||
        sourceType === 'instagram-mention-media'
    ) {
        return permalink
            ? { label: 'go to', type: 'media', link: permalink }
            : null
    }

    const tweetId = externalId ?? extra.conversation_id
    const twitterFromUsername = from?.name

    if (sourceType === 'twitter-tweet' && !parentId) {
        return {
            label: 'go to',
            type: 'tweet',
            link: `https://twitter.com/${twitterFromUsername}/status/${tweetId}`,
        }
    }

    if (sourceType === 'twitter-mention-tweet') {
        return {
            label: 'go to',
            type: 'tweet',
            link: `https://twitter.com/${twitterFromUsername}/status/${tweetId}`,
        }
    }

    if (sourceType === 'twitter-tweet' && !!parentId) {
        const replyingToUsername = to?.[0]?.name ?? undefined
        return {
            label: 'replying to',
            type: 'tweet',
            link: `https://twitter.com/${twitterFromUsername}/status/${tweetId}`,
            replyingToUsername: replyingToUsername ?? undefined,
            replyingToLink: replyingToUsername
                ? `https://twitter.com/${replyingToUsername}`
                : undefined,
        }
    }

    if (sourceType === 'twitter-quoted-tweet') {
        const quotedUser = (
            meta?.quoted_tweet as { user?: { username?: string } } | undefined
        )?.user?.username
        return {
            label: 'retweeting',
            type: 'tweet',
            link: `https://twitter.com/${twitterFromUsername}/status/${tweetId}`,
            replyingToUsername: quotedUser ?? undefined,
            replyingToLink: quotedUser
                ? `https://twitter.com/${quotedUser}`
                : undefined,
        }
    }

    if (!messageId) return null

    // Top-level facebook comment (parentId === fullPostId)
    if (parentId === fullPostId) {
        const postId = fullPostId ? getId(fullPostId) : ''
        const commentId = getId(messageId)
        const link =
            permalink ||
            `https://facebook.com/${pageFeedId}/posts/${postId}?comment_id=${commentId}`
        return { label: 'go to', type: 'comment', link }
    }

    // Reply comment (parentId !== fullPostId) — also handles facebook-mention-comment
    const postId = fullPostId ? getId(fullPostId) : ''
    const commentId = parentId ? getId(parentId) : ''
    const replyId = getId(messageId)
    return {
        label: 'go to',
        type: 'reply',
        link: `https://facebook.com/${pageFeedId}/posts/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`,
    }
}
