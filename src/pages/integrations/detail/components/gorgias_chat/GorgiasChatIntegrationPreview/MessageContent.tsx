import React, {Component, Fragment} from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'

import Avatar from '../../../../../common/components/Avatar/Avatar'

import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'
import ProductCardAttachment, {ProductAttachment} from './ProductCardAttachment'

type Props = {
    conversationColor: string
    currentUser?: Map<any, any>
    customerInitialMessages: string[]
    agentMessages: {
        content: string
        isHtml: boolean
        attachments: ProductAttachment[]
    }[]
    hideMessageTimestamp?: boolean
}

const renderAgentMessage = ({
    content,
    isHtml,
    attachments,
}: {
    content: string
    isHtml: boolean
    attachments: ProductAttachment[]
}) => {
    if (isHtml) {
        return (
            <>
                <div
                    dangerouslySetInnerHTML={{
                        __html: content,
                    }}
                />
                {attachments.map((attachment, index) => {
                    const {url} = attachment

                    return (
                        <ProductCardAttachment
                            key={`${url}-${index}`}
                            attachment={attachment}
                        />
                    )
                })}
            </>
        )
    }
    return <>{content}</>
}

export default class MessageContent extends Component<Props> {
    render() {
        const {
            conversationColor,
            currentUser,
            customerInitialMessages,
            agentMessages,
            hideMessageTimestamp,
        } = this.props

        if (!currentUser) {
            return null
        }

        return (
            <div className={css.content}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={customerInitialMessages}
                    hideMessageTimestamp={hideMessageTimestamp}
                />

                <div className={css.appMakerMessageWrapper}>
                    <Avatar
                        email={currentUser.get('email')}
                        name={currentUser.get('name')}
                        url={currentUser.getIn(['meta', 'profile_picture_url'])}
                        size={35}
                        className={css.avatar}
                    />
                    <div>
                        <div className={css.user}>
                            {currentUser.get('name')}
                        </div>

                        {agentMessages.map((message) => (
                            <div
                                className={classnames(
                                    css.bubble,
                                    css.firstMessageOfAppMaker
                                )}
                                key={message.content}
                            >
                                {renderAgentMessage(message)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}
