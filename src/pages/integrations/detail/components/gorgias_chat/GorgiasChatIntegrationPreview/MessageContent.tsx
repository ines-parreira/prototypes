import React, {Component, Fragment} from 'react'
import classnames from 'classnames'
import {Map} from 'immutable'

import Avatar from '../../../../../common/components/Avatar/Avatar'

import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'

type Props = {
    conversationColor: string
    currentUser?: Map<any, any>
    customerInitialMessages: string[]
    agentMessages: {content: string; isHtml: boolean}[]
    hideMessageTimestamp?: boolean
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

                        {agentMessages.map(({content, isHtml}) => (
                            <Fragment key={content}>
                                {isHtml ? (
                                    <div
                                        className={classnames(
                                            css.bubble,
                                            css.firstMessageOfAppMaker
                                        )}
                                        dangerouslySetInnerHTML={{
                                            __html: content,
                                        }}
                                    />
                                ) : (
                                    <div
                                        className={classnames(
                                            css.bubble,
                                            css.firstMessageOfAppMaker
                                        )}
                                    >
                                        {content}
                                    </div>
                                )}
                            </Fragment>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
}
