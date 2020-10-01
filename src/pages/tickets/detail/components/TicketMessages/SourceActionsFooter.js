//@flow
import React from 'react'
import classNamesBind from 'classnames/bind'
import {connect} from 'react-redux'

import {Badge} from 'reactstrap'

import * as infobarActions from '../../../../../state/infobar/actions.ts'
import type {
    FacebookReactionCounter,
    Meta,
    Source,
} from '../../../../../models/ticket/types'

import {FACEBOOK_COMMENT_SOURCE} from '../../../../../config/ticket.ts'

import FacebookReactionType from '../../../../../constants/integrations/facebook'

import likeIcon from '../../../../../../img/integrations/facebook-reaction-like.svg'
import likedIcon from '../../../../../../img/integrations/facebook-reaction-liked.svg'
import hahaIcon from '../../../../../../img/integrations/facebook-reaction-haha.svg'
import wowIcon from '../../../../../../img/integrations/facebook-reaction-wow.svg'
import loveIcon from '../../../../../../img/integrations/facebook-reaction-love.svg'
import angryIcon from '../../../../../../img/integrations/facebook-reaction-angry.svg'
import sadIcon from '../../../../../../img/integrations/facebook-reaction-sad.svg'
import prideIcon from '../../../../../../img/integrations/facebook-reaction-pride.png'
import careIcon from '../../../../../../img/integrations/facebook-reaction-care.svg'

import Loader from '../../../../common/components/Loader/Loader'

import type {FacebookReaction} from '../../../../../models/ticket'

import css from './SourceActions.less'

const classNames = classNamesBind.bind(css)

type Props = {
    source?: Source,
    meta?: Meta,
    integrationId?: string,
    messageId?: string,
    isMessageHidden?: boolean,
    isMessageDeleted?: boolean,
    executeAction: typeof infobarActions.executeAction,
}

export class SourceActionsFooter extends React.Component<Props> {
    reactionIcons: Object = {
        [FacebookReactionType.LIKE]: likedIcon,
        [FacebookReactionType.LOVE]: loveIcon,
        [FacebookReactionType.SAD]: sadIcon,
        [FacebookReactionType.ANGRY]: angryIcon,
        [FacebookReactionType.WOW]: wowIcon,
        [FacebookReactionType.HAHA]: hahaIcon,
        [FacebookReactionType.PRIDE]: prideIcon,
        [FacebookReactionType.CARE]: careIcon,
    }

    _executeAction = (name: string) => {
        const {integrationId, messageId, executeAction} = this.props
        if (integrationId) {
            executeAction(name, integrationId, undefined, {
                comment_id: messageId,
            })
        }
    }

    _handlePageReaction = (pageReactionType: string) => {
        if (pageReactionType === FacebookReactionType.LIKE) {
            return (
                <Badge color="light" pill className={css.pageReactionBadge}>
                    You
                    <img
                        src={likedIcon}
                        title="Unlike"
                        alt="Unlike"
                        key="like-action"
                        className={css.reactionButton}
                        onClick={() => this._toggleLikeComment(false)}
                    />
                </Badge>
            )
        }

        const icon = this.reactionIcons[pageReactionType]
        if (icon) {
            return (
                <Badge
                    color="light"
                    pill
                    className={css.pageReactionBadge}
                    key="page-reaction"
                >
                    You
                    <span className="ml-1">
                        <img
                            src={icon}
                            alt={pageReactionType}
                            title={pageReactionType}
                            className={css.reactionIcon}
                        />
                    </span>
                </Badge>
            )
        }

        return (
            <Badge
                color="light"
                pill
                className={css.pageReactionBadge}
                key="page-reaction"
            >
                <span className="mr-1">You:</span>
                <span className={css.reactionText}>{pageReactionType}</span>
            </Badge>
        )
    }

    _handleCustomerReaction = (customerReaction: FacebookReaction) => {
        const icon = this.reactionIcons[customerReaction.reaction_type]

        let customerName = 'Customer'
        if (customerReaction.reaction_made_by) {
            customerName = customerReaction.reaction_made_by
        }

        if (icon) {
            return (
                <Badge
                    color="light"
                    pill
                    className={css.customerReactionBadge}
                    key="customer-reaction"
                >
                    {customerName}
                    <span className="ml-1">
                        <img
                            src={icon}
                            alt={customerReaction.reaction_type}
                            title={customerReaction.reaction_type}
                            className={css.reactionIcon}
                        />
                    </span>
                </Badge>
            )
        }
        return (
            <Badge
                color="light"
                pill
                className={css.customerReactionBadge}
                key="customer-reaction"
            >
                <span className="mr-1">{customerName}:</span>
                <span className={css.reactionText}>
                    {customerReaction.reaction_type}
                </span>
            </Badge>
        )
    }

    _handleOtherReactions = (
        reactionCounter: FacebookReactionCounter,
        pageReactionType: string,
        customerReactionType: string
    ) => {
        let totalReactions = reactionCounter.total_reactions
        let reactionImages = []

        const reactionsCounterKeys = Object.keys(reactionCounter)
        const reactions = reactionsCounterKeys.filter(
            (key) => key !== 'total_reactions'
        )

        for (let i = 0; i < reactions.length; i++) {
            let reaction = reactions[i]
            let reactionCount = reactionCounter[reaction]

            if (
                reaction === customerReactionType ||
                reaction === pageReactionType
            ) {
                reactionCount -= 1
                totalReactions -= 1
            }

            if (reactionCount > 0) {
                const icon = this.reactionIcons[reaction]
                if (icon) {
                    reactionImages.push(
                        <img
                            className={css.groupedReactions}
                            src={icon}
                            alt="Other reactions"
                        />
                    )
                }
            }
        }

        if (totalReactions > 0) {
            return (
                <Badge
                    color="light"
                    pill
                    className={classNames(
                        'hidden-sm-down',
                        css.totalReactionsBadge
                    )}
                    key="other-reactions"
                >
                    {totalReactions} Other
                    <span
                        color="light"
                        className={classNames('ml-1', css.slide)}
                    >
                        {reactionImages}
                    </span>
                </Badge>
            )
        }
    }

    _getLikeButton = () => {
        return (
            <span className="mr-3">
                <img
                    src={likeIcon}
                    title="Like"
                    alt="Like"
                    key="like-action"
                    className={css.reactionButton}
                    onClick={() => this._toggleLikeComment(true)}
                    style={{width: '18px'}}
                />
            </span>
        )
    }

    _getLikingLoader = (pageReaction: FacebookReaction) => {
        let likingState = 'Liking'
        if (
            pageReaction.reaction_type &&
            pageReaction.reaction_type === FacebookReactionType.LIKE
        ) {
            likingState = 'Unliking'
        }

        return (
            <span className="mr-3" style={{color: '#ababab'}}>
                {likingState}
                <span>
                    <Loader
                        className={css.spinner}
                        minHeight="15px"
                        size="15px"
                        key="loader"
                    />
                </span>
            </span>
        )
    }

    _toggleLikeComment = (like: boolean) => {
        this._executeAction(
            like ? 'facebookLikeComment' : 'facebookUnlikeComment'
        )
    }

    render() {
        const {source, meta, isMessageHidden, isMessageDeleted} = this.props
        const widgets = []

        if (
            !source ||
            !source.type ||
            isMessageHidden ||
            isMessageDeleted ||
            source.type !== FACEBOOK_COMMENT_SOURCE
        ) {
            return widgets
        }

        // Handle page action/reaction
        if (
            !meta ||
            !meta.facebook_reactions ||
            !meta.facebook_reactions.page_reaction
        ) {
            widgets.push(this._getLikeButton())
        } else if (
            meta &&
            meta.facebook_reactions &&
            meta.facebook_reactions.page_reaction
        ) {
            if (meta.facebook_reactions.page_reaction.is_reacting) {
                widgets.push(
                    this._getLikingLoader(meta.facebook_reactions.page_reaction)
                )
            } else if (meta.facebook_reactions.page_reaction.reaction_type) {
                widgets.push(
                    this._handlePageReaction(
                        meta.facebook_reactions.page_reaction.reaction_type
                    )
                )
            } else {
                widgets.push(this._getLikeButton())
            }
        }

        if (meta && meta.facebook_reactions) {
            let customerReactionType = ''

            // Handle Customer reaction
            if (meta.facebook_reactions.customer_reaction) {
                customerReactionType =
                    meta.facebook_reactions.customer_reaction.reaction_type
                widgets.push(
                    this._handleCustomerReaction(
                        meta.facebook_reactions.customer_reaction
                    )
                )
            }

            // Handle other reactions
            if (meta.facebook_reactions.reactions_counter) {
                let pageReactionType = ''
                if (
                    meta.facebook_reactions.page_reaction &&
                    meta.facebook_reactions.page_reaction.reaction_type
                ) {
                    pageReactionType =
                        meta.facebook_reactions.page_reaction.reaction_type
                }

                widgets.push(
                    this._handleOtherReactions(
                        meta.facebook_reactions.reactions_counter,
                        pageReactionType,
                        customerReactionType
                    )
                )
            }
        }

        return widgets
    }
}

export default connect(null, {executeAction: infobarActions.executeAction})(
    SourceActionsFooter
)
