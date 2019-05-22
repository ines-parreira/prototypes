import React from 'react'
import classnames from 'classnames'
import {type Map} from 'immutable'

import Avatar from '../../../../../common/components/Avatar'

import css from './ChatIntegrationPreview.less'


type Props = {
    conversationColor?: string,
    currentUser?: Map<*,*>
}

export default class MessageContent extends React.Component<Props> {
    render() {
        const {conversationColor, currentUser} = this.props

        if (!currentUser) {
            return null
        }

        return (
            <div className={css.content}>
                <div
                    className={classnames(css.bubble, css.primary, css.firstMessageOfAppUser)}
                    style={{backgroundColor: conversationColor}}
                >
                    Hey there
                </div>
                <div
                    className={classnames(css.bubble, css.primary, css.lastMessage)}
                    style={{backgroundColor: conversationColor}}
                >
                    I'm wondering about the status of my order, I've been waiting for a while now and it has
                    not arrived yet.
                </div>


                <div className={css.appMakerMessageWrapper}>
                    <Avatar
                        email={currentUser.get('email')}
                        name={currentUser.get('name')}
                        url={currentUser.getIn(['meta', 'profile_picture_url'])}
                        size="35"
                        className={css.avatar}
                    />
                    <div>
                        <div className={css.user}>
                            {currentUser.get('name')}
                        </div>

                        <div className={classnames(css.bubble, css.firstMessageOfAppMaker)}>
                            Sure, what's your email / order number?
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
