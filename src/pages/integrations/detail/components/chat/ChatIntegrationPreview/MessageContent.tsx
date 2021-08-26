import React from 'react'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'

import Avatar from '../../../../../common/components/Avatar/Avatar'
import {RootState} from '../../../../../../state/types'

import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'

type Props = {
    conversationColor: string
} & ConnectedProps<typeof connector>

export class MessageContentContainer extends React.Component<Props> {
    render() {
        const {conversationColor, currentUser} = this.props

        if (!currentUser) {
            return null
        }

        return (
            <div className={css.content}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={[
                        'Hey there',
                        "I'm wondering about the status of my order, I've been waiting for a while now and it has not arrived yet.",
                    ]}
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

                        <div
                            className={classnames(
                                css.bubble,
                                css.firstMessageOfAppMaker
                            )}
                        >
                            Sure, what's your email / order number?
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const connector = connect((state: RootState) => ({
    currentUser: state.currentUser,
}))

export default connector(MessageContentContainer)
