//@flow
import React from 'react'
import classNamesBind from 'classnames/bind'
import {connect} from 'react-redux'

import * as infobarActions from '../../../../../state/infobar/actions'
import type {Meta, Source} from '../../../../../models/ticket/types'
import hideIcon from '../../../../../../img/integrations/facebook-action-hide.svg'
import unhideIcon from '../../../../../../img/integrations/facebook-action-unhide.svg'

import {
    FACEBOOK_COMMENT_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
} from '../../../../../config/ticket'

import css from './SourceActions.less'

const classNames = classNamesBind.bind(css)

type Props = {
    source?: Source,
    meta?: Meta,
    integrationId?: string,
    messageId?: string,
    fromAgent: boolean,
    executeAction: typeof infobarActions.executeAction,
}

export class SourceActionsHeader extends React.Component<Props> {
    _executeAction = (name: string) => {
        const {integrationId, messageId, executeAction} = this.props
        if (integrationId) {
            executeAction(name, integrationId, undefined, {
                comment_id: messageId,
            })
        }
    }

    _toggleInstagramHideComment = (hide: boolean) => {
        this._executeAction(
            hide ? 'instagramHideComment' : 'instagramUnhideComment'
        )
    }

    _toggleFacebookHideComment = (hide: boolean) => {
        this._executeAction(
            hide ? 'facebookHideComment' : 'facebookUnhideComment'
        )
    }

    render() {
        const {source, meta, fromAgent} = this.props

        const widgets = []

        if (!source || !source.type) {
            return widgets
        }

        const isInstagramComment = [
            INSTAGRAM_COMMENT_SOURCE,
            INSTAGRAM_AD_COMMENT_SOURCE,
        ].includes(source.type)
        const isFacebookComment = source.type === FACEBOOK_COMMENT_SOURCE

        // If the comment is a Facebook comment, posted by the page, then the API will never allow us to hide it.
        // So we don't even display the `hide` button to avoid frustration.
        if (isInstagramComment || (isFacebookComment && !fromAgent)) {
            let hiddenDatetime = null
            let actionIcon = hideIcon
            let actionText = 'Hide'

            if (meta && meta.hidden_datetime) {
                hiddenDatetime = meta.hidden_datetime
            }

            const shouldHide = !hiddenDatetime

            if (!shouldHide) {
                actionIcon = unhideIcon
                actionText = 'Unhide'
            }

            widgets.push(
                <span
                    key="hide-action"
                    className={classNames('hidden-sm-down', css.actionButton)}
                    onClick={() =>
                        isInstagramComment
                            ? this._toggleInstagramHideComment(shouldHide)
                            : this._toggleFacebookHideComment(shouldHide)
                    }
                >
                    <img src={actionIcon} title={actionText} alt={actionText} />
                </span>
            )
        }

        return widgets
    }
}

export default connect(null, {executeAction: infobarActions.executeAction})(
    SourceActionsHeader
)
