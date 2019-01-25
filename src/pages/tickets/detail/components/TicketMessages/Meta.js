//@flow
import React, {type Node} from 'react'
import type {Meta, Source} from '../../../../../models/ticketElement/types'
import css from './Meta.less'
import {Link} from 'react-router'
import classnames from 'classnames'

type Props = {
    messageId?: string,
    via: string,
    integrationId?: string,
    ruleId?: string,
    meta?: Meta,
    source?: Source
}

const From = (props: {children?: Node}) => (
    <span className={classnames(css.from, 'd-none d-md-inline-block')}>
        {props.children}
    </span>
)

export default (props: Props) => {
    const {meta, source, messageId} = props
    const widgets = []

    if (meta && meta.current_page) {
        let displayString = meta.current_page

        if (displayString.length > 28) {
            displayString = `...${displayString.substr(displayString.length - 25)}`
        }

        widgets.push(
            <From key="from-widget">
                from <a
                    target="_blank"
                    href={meta.current_page}
                >
                    {displayString}
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
            <From key="ref-widget">
                go to{' '}
                <a
                    target="_blank"
                    href={link}
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
            <From key="via-widget">
                sent via a{' '}
                <b>
                    <Link
                        tag="a"
                        to={sentViaLink}
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
