import { useEffect, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useAsyncFn } from '@repo/hooks'
import moment from 'moment'
import { Link } from 'react-router-dom'

import { TicketMessageSourceType } from 'business/types/ticket'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { fetchRule } from 'models/rule/resources'
import type { Meta as MetaType, Source } from 'models/ticket/types'
import StarRating from 'pages/common/components/StarRating'
import { useRuleRecipes } from 'state/entities/ruleRecipes/hooks'
import { ruleFetched } from 'state/entities/rules/actions'
import { rulesSelector } from 'state/entities/rules/selectors'
import { ManagedRuleDisplayName } from 'state/rules/constants'
import type { ManagedRule } from 'state/rules/types'
import { RuleType } from 'state/rules/types'

import MetaLabel from './MetaLabel'
import MetaRepliedByLabel from './MetaRepliedByLabel'
import MetaRepliedToLabel from './MetaRepliedToLabel'

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

export default function Meta(props: Props) {
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const {
        meta,
        source,
        messageId,
        externalId,
        integrationId,
        messageCreatedDatetime,
    } = props
    const widgets = []

    const dispatch = useAppDispatch()
    const rules = useAppSelector(rulesSelector)
    const recipes = useRuleRecipes()

    const [{ loading: isFetchingRule, value: rule }, startFetchingRule] =
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
            { loading: true },
        )

    useEffect(() => void startFetchingRule(), [startFetchingRule])

    if (!hasTicketThreadRevamp) {
        if (
            source &&
            (source.type === TicketMessageSourceType.ChatContactForm ||
                source.type === TicketMessageSourceType.ChatOfflineCapture)
        ) {
            widgets.push(
                <MetaLabel label="via" key="from-widget">
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
                </MetaLabel>,
            )
        } else if (meta && meta.current_page) {
            widgets.push(
                <MetaLabel label="from" key="from-widget">
                    <a
                        target="_blank"
                        href={meta.current_page}
                        rel="noopener noreferrer"
                        title={meta.current_page}
                    >
                        {meta.current_page}
                    </a>
                </MetaLabel>,
            )
        }
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
            <MetaLabel label={label} key="ref-widget">
                <a
                    target="_blank"
                    href={link}
                    title={link}
                    rel="noopener noreferrer"
                >
                    {type}
                </a>
            </MetaLabel>
        )

        if (replyingToUsername) {
            const profileLink = `https://twitter.com/${replyingToUsername}`
            fromComponent = (
                <MetaLabel label={label} key="ref-widget">
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
                </MetaLabel>
            )
        }

        widgets.push(fromComponent)
    }

    if (!!meta?.replied_by) {
        widgets.push(
            <MetaRepliedByLabel reply={meta.replied_by} key="replied-by" />,
        )
    }

    if (!!meta?.replied_to) {
        widgets.push(
            <MetaRepliedToLabel reply={meta.replied_to} key="replied-to" />,
        )
    }

    if (yotpoReviewScore) {
        widgets.push(
            <span key={yotpoReviewScore}>
                <StarRating value={yotpoReviewScore || 0} />
            </span>,
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
            <MetaLabel
                key="via-widget"
                label="sent via:"
                isLoading={isFetchingRule}
            >
                <b>
                    <Link
                        to={`/app/settings/rules/${props.ruleId}`}
                        title="Rule"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {ruleName}
                    </Link>
                </b>
            </MetaLabel>,
        )
    } else if (meta && meta.campaign_id && props.integrationId) {
        const sentViaLink = `/app/convert/${props.integrationId}/campaigns/${meta.campaign_id}`

        widgets.push(
            <MetaLabel key="via-widget" label="sent via a">
                <b>
                    <Link to={sentViaLink} title="Campaign">
                        <i className="material-icons mr-1">settings</i>
                        {`"Campaign"`}
                    </Link>
                </b>
            </MetaLabel>,
        )
    } else if (
        meta &&
        meta.ai_campaign_id &&
        meta.ai_campaign_trigger_operator === 'aiSalesAgentHelpOnSearch'
    ) {
        widgets.push(
            <MetaLabel key="via-widget" label="from search">
                <b>{meta.ai_campaign_trigger_value}</b>
            </MetaLabel>,
        )
    } else if (meta && meta.rule_suggestion_slug) {
        const slug = meta.rule_suggestion_slug
        const ruleName = recipes?.[slug]?.rule?.name ?? slug
        widgets.push(
            <MetaLabel
                key="via-widget"
                label="sent via suggested rule:"
                isLoading={!recipes}
            >
                <b>
                    <Link
                        to={`/app/settings/rules/library?${meta.rule_suggestion_slug}`}
                        title="Rule"
                        target="_blank"
                        rel="noreferrer"
                    >
                        {ruleName}
                    </Link>
                </b>
            </MetaLabel>,
        )
    } else if (meta && meta.ai_suggestion) {
        widgets.push(
            <MetaLabel
                key="via-widget"
                label="answer suggested from Gorgias AI"
            ></MetaLabel>,
        )
    } else if (meta && meta.sms_deflection) {
        widgets.push(
            <MetaLabel
                key="via-widget"
                label={meta.sms_deflection}
            ></MetaLabel>,
        )
    }

    return <>{widgets}</>
}
