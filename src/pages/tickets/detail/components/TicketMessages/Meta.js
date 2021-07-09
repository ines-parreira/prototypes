//@flow
import classnames from 'classnames'
import React, {type Node} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'

import {TicketVias} from '../../../../../business/ticket.ts'
import {Meta as MetaType, Source} from '../../../../../models/ticket/types.ts'

import {
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_POST_SOURCE,
    FACEBOOK_MENTION_POST_SOURCE,
    FACEBOOK_MENTION_COMMENT_SOURCE,
    INSTAGRAM_AD_MEDIA_SOURCE,
    INSTAGRAM_MEDIA_SOURCE,
    INSTAGRAM_MENTION_MEDIA_SOURCE,
    FACEBOOK_REVIEW_COMMENT_SOURCE,
    FACEBOOK_REVIEW_SOURCE,
    INSTAGRAM_DM_SOURCE,
    TWITTER_TWEET_SOURCE,
} from '../../../../../config/ticket.ts'

import css from './Meta.less'

type Props = {
    messageId?: string,
    via: string,
    integrationId?: number | null,
    ruleId?: string | null,
    meta?: MetaType | null,
    source?: Source,
    messageCreatedDatetime?: string,
}

const From = ({label, children}: {label: string, children?: Node}) => (
    <span className={classnames(css.from)}>
        <span className={css.fromLabel}>{label}</span>{' '}
        <span className={css.fromValue}>{children}</span>
    </span>
)

export default function Meta(props: Props) {
    const {
        meta,
        source,
        messageId,
        via,
        integrationId,
        messageCreatedDatetime,
    } = props
    const widgets = []

    if (meta && meta.current_page) {
        widgets.push(
            <From label="from" key="from-widget">
                <a
                    target="_blank"
                    href={meta.current_page}
                    rel="noopener noreferrer"
                    title={meta.current_page}
                >
                    {meta.current_page}
                </a>
            </From>
        )
    }

    const GO_TO_WIDGET_SOURCES = [
        FACEBOOK_COMMENT_SOURCE,
        FACEBOOK_POST_SOURCE,
        FACEBOOK_MENTION_POST_SOURCE,
        FACEBOOK_MENTION_COMMENT_SOURCE,
        INSTAGRAM_AD_MEDIA_SOURCE,
        INSTAGRAM_MEDIA_SOURCE,
        INSTAGRAM_MENTION_MEDIA_SOURCE,
        FACEBOOK_REVIEW_SOURCE,
        FACEBOOK_REVIEW_COMMENT_SOURCE,
        TWITTER_TWEET_SOURCE,
    ]

    const isStoryMentionDirectMessage =
        source &&
        source.type &&
        source.type === INSTAGRAM_DM_SOURCE &&
        meta &&
        meta.is_story_mention

    const isStoryReplyDirectMessage =
        source &&
        source.type &&
        source.type === INSTAGRAM_DM_SOURCE &&
        meta &&
        meta.is_story_reply

    let type
    let link
    let label = 'go to'
    let replyingToUsername

    if (
        !!messageId &&
        !!integrationId &&
        (isStoryMentionDirectMessage || isStoryReplyDirectMessage)
    ) {
        // We don't want to display a `go to story` link after 24h
        const limit = moment().subtract(24, 'hour') // 24 hours ago
        const isMessageTooOld = moment(messageCreatedDatetime).isBefore(limit)

        if (!isMessageTooOld) {
            type = 'story'
            link = `/integrations/facebook/redirect/instagramstory?message_id=${messageId}&integration_id=${integrationId}`
        }
    }

    if (
        source &&
        source.type &&
        source.extra &&
        GO_TO_WIDGET_SOURCES.includes(source.type)
    ) {
        const pageId = source.extra.page_id
        const fullPostId = source.extra.post_id
        const parentId = source.extra.parent_id
        const permalink = source.extra.permalink

        const isFacebookMentionPost =
            source.type === FACEBOOK_MENTION_POST_SOURCE
        const isFacebookMentionComment =
            source.type === FACEBOOK_MENTION_COMMENT_SOURCE
        const isFacebookPost = source.type === FACEBOOK_POST_SOURCE
        const isFacebookReview = source.type === FACEBOOK_REVIEW_SOURCE
        const isFacebookReviewComment =
            source.type === FACEBOOK_REVIEW_COMMENT_SOURCE

        const isFacebookComment = parentId === fullPostId
        const isInstagramMedia = source.type === INSTAGRAM_MEDIA_SOURCE
        const isInstagramAdMedia = source.type === INSTAGRAM_AD_MEDIA_SOURCE
        const isInstagramMentionMedia =
            source.type === INSTAGRAM_MENTION_MEDIA_SOURCE

        const tweetId = messageId ? messageId : source.extra.conversation_id
        const twitterFromUsername = source.from?.name
        const twitterToUsername = source.to[0]?.name
        const isTwitterRootTweet =
            source.type === TWITTER_TWEET_SOURCE && !parentId
        const isTwitterReplyTweet =
            source.type === TWITTER_TWEET_SOURCE && !!parentId

        const getId = (input, place = 1) =>
            input && input.includes('_') ? input.split('_')[place] : ''

        let pageFeedId = pageId
        if (isFacebookMentionComment) {
            pageFeedId = getId(fullPostId, 0)
        }
        if (isFacebookPost) {
            const postId = isFacebookPost ? getId(fullPostId) : fullPostId
            type = 'post'
            link = `https://facebook.com/${pageId}/posts/${postId}`
        } else if (isFacebookMentionPost) {
            type = 'post'
            link = permalink
        } else if (!!messageId && isFacebookReview) {
            type = 'review'
            link = `https://facebook.com/${messageId}`
        } else if (
            isInstagramMedia ||
            isInstagramAdMedia ||
            isInstagramMentionMedia
        ) {
            type = 'media'
            link = permalink
        } else if (!!messageId && isFacebookReviewComment) {
            type = 'comment'
            link = permalink
            if (!link && !!source.extra.open_graph_story_id) {
                const commentId = getId(messageId)
                link = `https://facebook.com/${source.extra.open_graph_story_id}/?comment_id=${commentId}`
            }
        } else if (!!messageId && isFacebookComment) {
            const postId = getId(fullPostId)
            const commentId = getId(messageId)
            type = 'comment'
            link = `https://facebook.com/${pageFeedId}/posts/${postId}?comment_id=${commentId}`
        } else if (isTwitterRootTweet) {
            type = 'tweet'
            link = `https://twitter.com/${twitterFromUsername}/status/${tweetId}`
        } else if (isTwitterReplyTweet) {
            type = 'tweet'
            label = 'replying to'
            replyingToUsername = twitterToUsername
            link = `https://twitter.com/${twitterFromUsername}/status/${tweetId}`
        } else if (!!messageId) {
            const postId = getId(fullPostId)
            const commentId = getId(parentId)
            const replyId = getId(messageId)
            type = 'reply'
            link = `https://facebook.com/${pageFeedId}/posts/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`
        }
    }

    if (type && link) {
        let fromComponent = (
            <From label={label} key="ref-widget">
                <a
                    target="_blank"
                    href={link}
                    title={link}
                    rel="noopener noreferrer"
                >
                    {type}
                </a>
            </From>
        )

        if (replyingToUsername) {
            const profileLink = `https://twitter.com/${replyingToUsername}`
            fromComponent = (
                <From label={label} key="ref-widget">
                    <a
                        target="_blank"
                        href={profileLink}
                        title={profileLink}
                        rel="noopener noreferrer"
                    >
                        @{replyingToUsername}
                    </a>{' '}
                    - go to{' '}
                    <a
                        target="_blank"
                        href={link}
                        title={link}
                        rel="noopener noreferrer"
                    >
                        {type}
                    </a>
                </From>
            )
        }

        widgets.push(fromComponent)
    }

    let sentViaLabel
    let sentViaLink

    if (props.via === 'rule' && props.ruleId) {
        sentViaLabel = 'Rule'
        sentViaLink = `/app/settings/rules?ruleId=${props.ruleId}`
    } else if (meta && meta.campaign_id && props.integrationId) {
        sentViaLabel = 'Campaign'

        if (via === TicketVias.GORGIAS_CHAT) {
            sentViaLink = `/app/settings/integrations/gorgias_chat/${props.integrationId}/campaigns/${meta.campaign_id}`
        } else {
            sentViaLink = `/app/settings/integrations/smooch_inside/${props.integrationId}/campaigns/${meta.campaign_id}`
        }
    }

    if (sentViaLabel && sentViaLink) {
        widgets.push(
            <From key="via-widget" label="sent via a">
                <b>
                    <Link tag="a" to={sentViaLink} title={sentViaLabel}>
                        <i className="material-icons mr-1">settings</i>
                        {sentViaLabel}
                    </Link>
                </b>
            </From>
        )
    }

    return widgets
}
