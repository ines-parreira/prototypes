//@flow
import React, {type Node} from 'react'
import classNamesBind from 'classnames/bind'
import moment from 'moment'
import {fromJS} from 'immutable/dist/immutable'

import {scrollToReactNode} from '../../../../common/utils/keyboard'
import Avatar from '../../../../common/components/Avatar'
import {TicketMessage, isFailed, isPending} from '../../../../../models/ticket'

import css from './Container.less'
import Header from './Header'

const classNames = classNamesBind.bind(css)

type Props = {
    id: string,
    className?: string,
    message: TicketMessage,
    hasCursor: boolean,
    lastMessageDatetimeAfterMount: string,
    children?: Node,
    timezone: string,
    isLastRead: boolean
}

export default class Container extends React.Component<Props> {
    componentDidUpdate(prevProps: Props) {
        // only if it just got the cursor.
        // to prevent focusing on the cursor item when a different one updates.
        if (this.props.hasCursor && !prevProps.hasCursor) {
            scrollToReactNode(this)
        }
    }

    render() {
        const {children, message} = this.props

        const sender = fromJS(message.sender || {})

        // appear animation if message is created after the ticket body component is mounted
        const appear = !!this.props.lastMessageDatetimeAfterMount
            && !message.from_agent
            && moment(message.created_datetime).diff(this.props.lastMessageDatetimeAfterMount) > 0

        return (
            <div className={classNames('ticket-message', this.props.className, css.component, {
                fromAgent: message.from_agent,
                internal: !message.public,
                appear: appear,
                hasError: isFailed(message),
                'ticket-message-loading': isPending(message),
            })}>
                <div className={css.avatar}>
                    <Avatar
                        email={sender.get('email')}
                        name={sender.get('name')}
                        url={sender.getIn(['meta', 'profile_picture_url'])}
                        size="36"
                    />
                </div>
                <div className={css.bodyWrapper}>
                    <Header
                        id={this.props.id}
                        message={message}
                        isLastRead={this.props.isLastRead}
                        timezone={this.props.timezone}
                        hasError={isFailed(message)}
                    />
                    {children}
                </div>
            </div>
        )
    }
}
