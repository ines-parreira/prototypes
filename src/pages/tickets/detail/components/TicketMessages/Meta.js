//@flow
import classnames from 'classnames'
import React, {type Node} from 'react'
import {Link} from 'react-router'

import type {Meta as MetaType, Source} from '../../../../../models/ticket/types'

import {
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_POST_SOURCE,
    INSTAGRAM_AD_MEDIA_SOURCE,
    INSTAGRAM_MEDIA_SOURCE
} from '../../../../../config/ticket'

import css from './Meta.less'

type Props = {
    messageId?: string,
    via: string,
    integrationId?: string,
    ruleId?: string,
    meta?: MetaType,
    source?: Source
}

const From = ({label, children}: { label: string, children?: Node }) => (
    <span className={classnames(css.from)}>
        <span className={css.fromLabel}>{label}</span>{' '}
        <span className={css.fromValue}>{children}</span>
    </span>
)

export default function Meta(props: Props) {
    const {meta, source, messageId} = props
    const widgets = []

    if (meta && meta.current_page) {
        widgets.push(
            <From
                label="from"
                key="from-widget"
            >
                <a
                    target="_blank"
                    href={meta.current_page}
                    rel="noopener noreferrer"
                    title={meta.current_page}
                >
                    {meta.current_page}
                </a>
            </From>,
        )
    }

    const GO_TO_WIDGET_SOURCES = [
        FACEBOOK_COMMENT_SOURCE, FACEBOOK_POST_SOURCE, INSTAGRAM_AD_MEDIA_SOURCE, INSTAGRAM_MEDIA_SOURCE
    ]

    if (source && source.type && source.extra && GO_TO_WIDGET_SOURCES.includes(source.type)) {
        const fullPostId = source.extra.post_id
        const parentId = source.extra.parent_id
        const permalink = source.extra.permalink

        const isFacebookPost = source.type === FACEBOOK_POST_SOURCE
        const isFacebookComment = parentId === fullPostId
        const isInstagramMedia = source.type === INSTAGRAM_MEDIA_SOURCE
        const isInstagramAdMedia = source.type === INSTAGRAM_AD_MEDIA_SOURCE

        const getId = (input) => input && input.includes('_') ? input.split('_')[1] : ''

        let type
        let link

        if (isFacebookPost) {
            const postId = getId(fullPostId)
            type = 'post'
            link = `https://facebook.com/${postId}`
        } else if (isInstagramMedia || isInstagramAdMedia) {
            type = 'media'
            link = permalink
        } else if (!!messageId && isFacebookComment) {
            const postId = getId(fullPostId)
            const commentId = getId(messageId)
            type = 'comment'
            link = `https://facebook.com/${postId}?comment_id=${commentId}`
        } else if (!!messageId) {
            const postId = getId(fullPostId)
            const commentId = getId(parentId)
            const replyId = getId(messageId)
            type = 'reply'
            link = `https://facebook.com/${postId}?comment_id=${commentId}&reply_comment_id=${replyId}`
        }

        if (type && link) {
            widgets.push(
                <From
                    label="go to"
                    key="ref-widget"
                >
                    <a
                        target="_blank"
                        href={link}
                        title={link}
                        rel="noopener noreferrer"
                    >
                        {type}
                    </a>
                </From>,
            )
        }
    }

    let sentViaLabel
    let sentViaLink

    if (props.via === 'rule' && props.ruleId) {
        sentViaLabel = 'Rule'
        sentViaLink = `/app/settings/rules?ruleId=${props.ruleId}`
    } else if (meta && meta.campaign_id && props.integrationId) {
        sentViaLabel = 'Campaign'
        sentViaLink = `/app/settings/integrations/smooch_inside/${props.integrationId}/campaigns/${meta.campaign_id}`
    }

    if (sentViaLabel && sentViaLink) {
        widgets.push(
            <From
                key="via-widget"
                label="sent via a"
            >
                <b>
                    <Link
                        tag="a"
                        to={sentViaLink}
                        title={sentViaLabel}
                    >
                        <i className="material-icons mr-1">
                            settings
                        </i>
                        {sentViaLabel}
                    </Link>
                </b>
            </From>,
        )
    }

    return widgets
}
