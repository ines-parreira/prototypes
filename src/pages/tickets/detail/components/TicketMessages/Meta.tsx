import classnames from 'classnames'
import React, {ReactNode, useEffect, useMemo} from 'react'
import {Link} from 'react-router-dom'
import moment from 'moment'
import ReactStars from 'react-rating-stars-component'

import {fetchRule} from 'models/rule/resources'
import Spinner from 'pages/common/components/Spinner'
import {ruleFetched} from 'state/entities/rules/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {rulesSelector} from 'state/entities/rules/selectors'
import useAppSelector from 'hooks/useAppSelector'
import {ManagedRuleDisplayName} from 'state/rules/constants'
import {ManagedRule, RuleType} from 'state/rules/types'
import {useRuleRecipes} from 'state/entities/ruleRecipes/hooks'
import useAsyncFn from 'hooks/useAsyncFn'
import {
    Meta as MetaType,
    ReplyTicketMessage,
    Source,
} from '../../../../../models/ticket/types'
import {TicketMessageSourceType} from '../../../../../business/types/ticket'
import {starRatingProps} from '../../../../common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/yotpo/Reviews'

import {AgentLabel} from '../../../../common/utils/labels'
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
    repliedBy?: ReplyTicketMessage
    repliedTo?: ReplyTicketMessage
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
        integrationId,
        messageCreatedDatetime,
        repliedBy,
        repliedTo,
    } = props
    const widgets = []

    const dispatch = useAppDispatch()
    const rules = useAppSelector(rulesSelector)
    const recipes = useRuleRecipes()

    const [{loading: isFetchingRule, value: rule}, startFetchingRule] =
        useAsyncFn(
            async () => {
                if (props.via === 'rule' && props.ruleId) {
                    if (rules[props.ruleId]) {
                        return rules[props.ruleId]
                    }
                    const rule = await fetchRule(parseInt(props.ruleId))
                    dispatch(ruleFetched(rule))
                    return rule
                }
            },
            [],
            {loading: true}
        )

    useEffect(() => void startFetchingRule(), [startFetchingRule])

    if (
        source &&
        (source.type === TicketMessageSourceType.ChatContactForm ||
            source.type === TicketMessageSourceType.ChatOfflineCapture)
    ) {
        widgets.push(
            <From label="via" key="from-widget">
                <span>
                    {source.type ===
                        TicketMessageSourceType.ChatContactForm && (
                        <b>contact form</b>
                    )}
                    {source.type ===
                        TicketMessageSourceType.ChatOfflineCapture && (
                        <b>offline capture</b>
                    )}
                    {meta && meta.current_page && (
                        <>
                            {' '}
                            from{' '}
                            <a
                                target="_blank"
                                href={meta.current_page}
                                rel="noopener noreferrer"
                                title={meta.current_page}
                            >
                                {meta.current_page}
                            </a>
                        </>
                    )}
                </span>
            </From>
        )
    } else if (meta && meta.current_page) {
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
            link = `https://reviews.yotpo.com/#/moderation/reviews?filterType=reviews&id=${messageId}`
            yotpoReviewScore = source.extra.score
        } else if (isFacebookPost) {
            const postId = isFacebookPost ? getId(fullPostId!) : fullPostId
            type = 'post'
            link =
                permalink || `https://facebook.com/${pageId!}/posts/${postId!}`
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

    if (!!repliedBy) {
        const agent = repliedBy.user?.name && (
            <AgentLabel name={repliedBy.user?.name} />
        )
        const view_ticket_link = meta?.replied_by?.ticket_id && (
            <>
                <span className={css.separator}>-</span>
                <span className={css.ticketLink}>
                    <a
                        href={`${meta.replied_by.ticket_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View ticket
                    </a>
                </span>
            </>
        )
        const fromComponent = (
            <From label={''} key="ref-widget">
                <span className={css.repliedBy}>
                    responded to via Messenger{' '}
                    <span className={css.filler}>by</span> {agent}{' '}
                    {view_ticket_link}
                </span>
            </From>
        )
        widgets.push(fromComponent)
    }

    if (!!repliedTo) {
        const view_ticket_link = meta?.replied_to?.ticket_id && (
            <>
                <span className={css.separator}> </span>
                <span className={css.ticketLink}>
                    <a
                        href={`${meta.replied_to.ticket_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Comment
                    </a>
                </span>
            </>
        )
        const fromComponent = (
            <From label={''} key="ref-widget">
                <span className={css.repliedIn}>
                    responded via Messenger to {view_ticket_link}
                </span>
            </From>
        )
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

    const ruleName = useMemo(() => {
        if (!rule) {
            return 'Rule'
        }
        if (rule.type === RuleType.Managed) {
            const slug = (rule as ManagedRule).settings.slug
            const ruleDisplayName = ManagedRuleDisplayName.get(slug)
            if (ruleDisplayName) return ruleDisplayName
        }
        return rule.name
    }, [rule])

    if (props.via === 'rule' && props.ruleId) {
        widgets.push(
            <From key="via-widget" label="sent via:">
                <b>
                    {isFetchingRule ? (
                        <Spinner className={css.spinner} color="dark" />
                    ) : (
                        <Link
                            to={`/app/settings/rules/${props.ruleId}`}
                            title="Rule"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {ruleName}
                        </Link>
                    )}
                </b>
            </From>
        )
    } else if (meta && meta.campaign_id && props.integrationId) {
        const sentViaLink = `/app/convert/${props.integrationId}/campaigns/${meta.campaign_id}`

        widgets.push(
            <From key="via-widget" label="sent via a">
                <b>
                    <Link to={sentViaLink} title="Campaign">
                        <i className="material-icons mr-1">settings</i>
                        "Campaign"
                    </Link>
                </b>
            </From>
        )
    } else if (meta && meta.rule_suggestion_slug) {
        const slug = meta.rule_suggestion_slug
        const ruleName = recipes?.[slug]?.rule?.name ?? slug
        widgets.push(
            <From key="via-widget" label="sent via suggested rule:">
                <b>
                    {!recipes ? (
                        <Spinner className={css.spinner} color="dark" />
                    ) : (
                        <Link
                            to={`/app/settings/rules/library?${meta.rule_suggestion_slug}`}
                            title="Rule"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {ruleName}
                        </Link>
                    )}
                </b>
            </From>
        )
    } else if (meta && meta.ai_suggestion) {
        widgets.push(
            <From
                key="via-widget"
                label="answer suggested from Gorgias AI"
            ></From>
        )
    } else if (meta && meta.sms_deflection) {
        widgets.push(<From key="via-widget" label={meta.sms_deflection}></From>)
    }

    return <>{widgets}</>
}
