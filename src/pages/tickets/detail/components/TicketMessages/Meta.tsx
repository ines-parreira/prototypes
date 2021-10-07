import classnames from 'classnames'
import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'

import ReactStars from 'react-rating-stars-component'

import {TicketVias} from '../../../../../business/ticket'
import {Meta as MetaType, Source} from '../../../../../models/ticket/types'
import {TicketMessageSourceType} from '../../../../../business/types/ticket'

import {starRatingProps} from '../../../../common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/yotpo/Reviews'

import css from './Meta.less'

type Props = {
    messageId?: string
    externalId?: string | null
    via: string
    integrationId?: number | null
    ruleId?: string | null
    meta?: MetaType | null
    source?: Source
    messageCreatedDatetime?: string
    subject?: string
}

const From = ({label, children}: {label: string; children?: ReactNode}) => (
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
        externalId,
        via,
        integrationId,
        messageCreatedDatetime,
        subject,
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
        TicketMessageSourceType.FacebookComment,
        TicketMessageSourceType.FacebookPost,
        TicketMessageSourceType.FacebookMentionPost,
        TicketMessageSourceType.FacebookMentionComment,
        TicketMessageSourceType.InstagramAdMedia,
        TicketMessageSourceType.InstagramMedia,
        TicketMessageSourceType.InstagramMentionMedia,
        TicketMessageSourceType.FacebookReview,
        TicketMessageSourceType.FacebookReviewComment,
        TicketMessageSourceType.YotpoReview,
        TicketMessageSourceType.TwitterTweet,
        TicketMessageSourceType.TwitterQuotedTweet,
        TicketMessageSourceType.TwitterMentionTweet,
    ]

    const isStoryMentionDirectMessage =
        source &&
        source.type &&
        source.type === TicketMessageSourceType.InstagramDirectMessage &&
        meta &&
        meta.is_story_mention

    const isStoryReplyDirectMessage =
        source &&
        source.type &&
        source.type === TicketMessageSourceType.InstagramDirectMessage &&
        meta &&
        meta.is_story_reply

    let type
    let link
    let yotpoReviewScore
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
            source.type === TicketMessageSourceType.FacebookMentionPost
        const isFacebookMentionComment =
            source.type === TicketMessageSourceType.FacebookMentionComment
        const isFacebookPost =
            source.type === TicketMessageSourceType.FacebookPost
        const isFacebookReview =
            source.type === TicketMessageSourceType.FacebookReview
        const isFacebookReviewComment =
            source.type === TicketMessageSourceType.FacebookReviewComment

        const isFacebookComment = parentId === fullPostId
        const isInstagramMedia =
            source.type === TicketMessageSourceType.InstagramMedia
        const isInstagramAdMedia =
            source.type === TicketMessageSourceType.InstagramAdMedia
        const isInstagramMentionMedia =
            source.type === TicketMessageSourceType.InstagramMentionMedia

        const isYotpoReview =
            source.type === TicketMessageSourceType.YotpoReview
        const tweetId = externalId ? externalId : source.extra.conversation_id
        const twitterFromUsername = source.from?.name
        const twitterToUsername = source.to ? source.to[0]?.name : null
        const isTwitterRootTweet =
            source.type === TicketMessageSourceType.TwitterTweet && !parentId
        const isTwitterReplyTweet =
            source.type === TicketMessageSourceType.TwitterTweet && !!parentId
        const isTwitterQuoteTweet =
            source.type === TicketMessageSourceType.TwitterQuotedTweet
        const isTwitterMentionTweet =
            source.type === TicketMessageSourceType.TwitterMentionTweet

        const getId = (input: string, place = 1) =>
            input && input.includes('_') ? input.split('_')[place] : ''

        let pageFeedId = pageId
        if (isFacebookMentionComment) {
            pageFeedId = getId(fullPostId!, 0)
        }

        if (!!messageId && isYotpoReview) {
            type = 'review'
            link = 'https://reviews.yotpo.com/#/moderation/reviews'
            if (subject) {
                link += `?query=${subject}&sort_by=review_creation_date`
            }
            yotpoReviewScore = source.extra.score
        } else if (isFacebookPost) {
            const postId = isFacebookPost ? getId(fullPostId!) : fullPostId
            type = 'post'
            link = `https://facebook.com/${pageId!}/posts/${postId!}`
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
            type = 'comment'
            if (!permalink) {
                const postId = getId(fullPostId!)
                const commentId = getId(messageId)
                link = `https://facebook.com/${pageFeedId!}/posts/${postId}?comment_id=${commentId}`
            } else {
                link = permalink
            }
        } else if (isTwitterRootTweet || isTwitterMentionTweet) {
            type = 'tweet'
            link = `https://twitter.com/${twitterFromUsername!}/status/${tweetId!}`
        } else if (isTwitterReplyTweet) {
            type = 'tweet'
            label = 'replying to'
            replyingToUsername = twitterToUsername
            link = `https://twitter.com/${twitterFromUsername!}/status/${tweetId!}`
        } else if (isTwitterQuoteTweet) {
            type = 'tweet'
            label = 'retweeting'
            replyingToUsername = meta?.quoted_tweet?.user.username
            link = `https://twitter.com/${twitterFromUsername!}/status/${tweetId!}`
        } else if (!!messageId) {
            const postId = getId(fullPostId!)
            const commentId = getId(parentId!)
            const replyId = getId(messageId)
            type = 'reply'
            link = `https://facebook.com/${pageFeedId!}/posts/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`
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

    if (yotpoReviewScore) {
        const starRatings = starRatingProps(yotpoReviewScore)
        widgets.push(
            <span key={yotpoReviewScore}>
                <ReactStars {...starRatings} />
            </span>
        )
    }

    let sentViaLabel
    let sentViaLink

    if (props.via === 'rule' && props.ruleId) {
        sentViaLabel = 'Rule'
        sentViaLink = `/app/settings/rules/${props.ruleId}`
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
                    <Link to={sentViaLink} title={sentViaLabel}>
                        <i className="material-icons mr-1">settings</i>
                        {sentViaLabel}
                    </Link>
                </b>
            </From>
        )
    }

    return <>{widgets}</>
}
