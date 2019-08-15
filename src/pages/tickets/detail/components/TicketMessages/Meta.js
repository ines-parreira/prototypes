//@flow
import classnames from 'classnames'
import React, {type Node} from 'react'
import {Link} from 'react-router'

import type {Meta as MetaType, Source} from '../../../../../models/ticket/types'

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

    if (source && source.type && source.extra &&
        ['facebook-post', 'facebook-comment', 'instagram-media'].includes(source.type)
    ) {
        const postId = source.extra.post_id
        const parentId = source.extra.parent_id
        const permalink = source.extra.permalink

        const isFacebookPost = source.type === 'facebook-post'
        const isFacebookComment = parentId === postId
        const isInstagramMedia = source.type === 'instagram-media'

        let type = 'reply'
        let link = `https://facebook.com/${messageId || ''}`

        if (isFacebookPost) {
            type = 'post'
            link = `https://facebook.com/${postId}`
        } else if (isInstagramMedia) {
            type = 'media'
            link = permalink
        } else if (isFacebookComment) {
            type = 'comment'
            link = `https://facebook.com/${messageId || ''}`
        }

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
