import React from 'react'

import classnames from 'classnames'
import _noop from 'lodash/noop'
import moment from 'moment'
import { UncontrolledTooltip } from 'reactstrap'

import messengerIcon from 'assets/img/integrations/facebook-messenger-dark-icon.svg'
import instagramDirectMessageIcon from 'assets/img/integrations/Instagram-direct-message-blue.svg'
import type { Meta } from 'models/ticket/types'

import css from './PrivateReplyButton.less'

type ComponentProps = {
    className?: string
    onClick?: React.MouseEventHandler
    isDisabled?: boolean
    id?: string
    type?: 'button' | 'reset' | 'submit'
    children: React.ReactNode
}

type Component =
    | React.FunctionComponent<ComponentProps>
    | React.ComponentClass<ComponentProps>
    | React.ForwardRefExoticComponent<any>

type Props = {
    buttonComponent: Component
    ticketMessageId: number
    meta?: Meta
    messageCreatedDatetime: string
    isFacebookComment: boolean
    className?: string
    onClick?: () => void
}

export default function PrivateReplyButton({
    buttonComponent: Component,
    ticketMessageId,
    meta,
    messageCreatedDatetime,
    isFacebookComment,
    className,
    onClick = _noop,
}: Props) {
    const icon = isFacebookComment ? messengerIcon : instagramDirectMessageIcon
    const buttonText = isFacebookComment ? 'Message' : 'Direct message'

    let isAlreadySent = false

    // We can't send a private reply to a comment older than 7 days old
    const limit = moment().subtract(7, 'day') // 7 days ago
    const isMessageTooOld = moment(messageCreatedDatetime).isBefore(limit)

    let tooltipMessage =
        'Private replies are allowed within 7 days of the creation date of the comment'

    if (meta?.private_reply?.already_sent) {
        isAlreadySent = true
        tooltipMessage = 'Only one private reply per comment is allowed'
    }

    const isDisabled = isAlreadySent || isMessageTooOld

    return (
        <>
            <div id={`private-reply-button-${ticketMessageId}`}>
                <Component
                    type="submit"
                    className={classnames(css.container, css.button, className)}
                    onClick={onClick}
                    isDisabled={isDisabled}
                >
                    <div className={css.logoWrapper}>
                        <div
                            className={classnames(
                                css.logo,
                                isFacebookComment
                                    ? css.messengerIcon
                                    : css.instagramDirectMessageIcon,
                                {
                                    [css.disabled]: isDisabled,
                                },
                            )}
                            style={{
                                WebkitMaskImage: `url(${icon})`,
                                maskImage: `url(${icon})`,
                            }}
                        />
                    </div>
                    {buttonText}
                </Component>
            </div>
            {isDisabled && (
                <UncontrolledTooltip
                    target={`private-reply-button-${ticketMessageId}`}
                >
                    {tooltipMessage}
                </UncontrolledTooltip>
            )}
        </>
    )
}
