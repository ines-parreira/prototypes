//@flow
import classNamesBind from 'classnames/bind'
import React from 'react'

import {
    hasFailedAction,
    isFailed,
    isPending,
    TicketMessage,
} from '../../../../../models/ticket'

import {
    FACEBOOK_COMMENT_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
} from '../../../../../config/ticket'

import Actions from './Actions'
import Attachments from './Attachments'
import Body from './Body'
import Errors from './Errors'
import css from './Message.less'
import SourceDetailsHeader from './SourceDetailsHeader'

const classNames = classNamesBind.bind(css)

type Props = {
    message: TicketMessage,
    ticketId: number,
    setStatus: () => void,
    showSourceDetails: boolean,
    isLastRead: boolean,
    timezone: string,
}

export default function Message(props: Props) {
    const {message} = props
    const hasError = isFailed(message)
    let isMessageHidden = false
    let contentToRender = null

    if (message.source && message.source.type) {
        const isInstagramComment = [
            INSTAGRAM_COMMENT_SOURCE,
            INSTAGRAM_AD_COMMENT_SOURCE,
        ].includes(message.source.type)
        const isFacebookComment =
            message.source.type === FACEBOOK_COMMENT_SOURCE
        if (isInstagramComment || isFacebookComment) {
            if (message.meta && message.meta.hidden_datetime) {
                isMessageHidden = true
            }
        }
    }

    if (!isMessageHidden) {
        contentToRender = (
            <div
                className={classNames('wrapper', {
                    hasSourceDetails: props.showSourceDetails,
                })}
            >
                {props.showSourceDetails && (
                    <SourceDetailsHeader
                        className={classNames('sourceDetails', {
                            internal: !message.public,
                        })}
                        message={message}
                        timezone={props.timezone}
                        isLastRead={props.isLastRead}
                    />
                )}
                <Body message={message} hasError={hasError} />
                <Attachments message={message} />
                <Actions message={message} />
                <Errors
                    message={message}
                    ticketId={props.ticketId}
                    loading={isPending(message)}
                    hasActionError={hasFailedAction(message)}
                    setStatus={props.setStatus}
                />
            </div>
        )
    }

    return contentToRender
}
