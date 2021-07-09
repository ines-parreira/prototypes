import React, {Component, ReactNode} from 'react'
import classNamesBind from 'classnames/bind'
import moment, {Moment} from 'moment'
import {fromJS, Map} from 'immutable'

import {scrollToReactNode} from '../../../../common/utils/keyboard'
import Avatar from '../../../../common/components/Avatar/Avatar'
import {isFailed, isPending} from '../../../../../models/ticket/predicates'
import {TicketMessage} from '../../../../../models/ticket/types'

import css from './Container.less'
import Header from './Header'
import Footer from './Footer'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string
    className?: string
    message: TicketMessage
    hasCursor: boolean
    lastMessageDatetimeAfterMount: Moment | null
    children?: ReactNode
    timezone: string
    isLastRead: boolean
    isMessageHidden: boolean
    isMessageDeleted: boolean
    isBodyHighlighted: boolean
}

export default class Container extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
        // only if it just got the cursor.
        // to prevent focusing on the cursor item when a different one updates.
        if (this.props.hasCursor && !prevProps.hasCursor) {
            scrollToReactNode(this)
        }
        if (this.props.isBodyHighlighted && !prevProps.isBodyHighlighted) {
            scrollToReactNode(this)
        }
    }

    render() {
        const {
            children,
            message,
            isMessageHidden,
            isMessageDeleted,
        } = this.props
        const sender = fromJS(message.sender || {}) as Map<any, any>
        let avatar

        const isMessageDuplicated = message?.meta?.is_duplicated
        const shouldRenderAvatar =
            (!isMessageHidden && !isMessageDeleted) ||
            (isMessageHidden && isMessageDuplicated)

        if (shouldRenderAvatar) {
            avatar = (
                <div className={css.avatar}>
                    <Avatar
                        email={message.from_agent ? null : sender.get('email')}
                        name={sender.get('name')}
                        url={sender.getIn(['meta', 'profile_picture_url'])}
                        size={36}
                    />
                </div>
            )
        }

        // appear animation if message is created after the ticket body component is mounted
        const {lastMessageDatetimeAfterMount} = this.props
        const appear =
            !!lastMessageDatetimeAfterMount &&
            !message.from_agent &&
            moment(message.created_datetime).diff(
                lastMessageDatetimeAfterMount
            ) > 0

        return (
            <div
                className={classNames(
                    'ticket-message',
                    this.props.className,
                    css.component,
                    {
                        fromAgent: message.from_agent,
                        internal: !message.public,
                        appear: appear,
                        hasError: isFailed(message),
                        'ticket-message-loading': isPending(message),
                        ticketMessagesHighlighted: this.props.isBodyHighlighted,
                    }
                )}
            >
                {avatar}
                <div
                    className={classNames(css.bodyWrapper, {
                        bodyWrapperForHiddenOrDeletedMessage:
                            (isMessageHidden && !isMessageDuplicated) ||
                            isMessageDeleted,
                    })}
                >
                    <Header
                        id={this.props.id}
                        message={message}
                        isLastRead={this.props.isLastRead}
                        timezone={this.props.timezone}
                        hasError={isFailed(message)}
                        isMessageHidden={isMessageHidden}
                        isMessageDeleted={isMessageDeleted}
                        showIntents={
                            React.Children.count(children) <= 1 &&
                            !message.from_agent
                        }
                    />
                    {children}
                    <Footer
                        id={this.props.id}
                        message={message}
                        isMessageHidden={isMessageHidden}
                        isMessageDeleted={isMessageDeleted}
                    />
                </div>
            </div>
        )
    }
}
