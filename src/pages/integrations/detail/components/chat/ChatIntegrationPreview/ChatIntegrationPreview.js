// @flow
import React from 'react'
import classnames from 'classnames'

import css from './ChatIntegrationPreview.less'

type Props = {
    name?: string,
    currentUser?: Object,
    introductionText?: string,
    offlineIntroductionText?: string,
    headerText?: string,
    inputPlaceholder?: string,
    mainColor?: string,
    conversationColor?: string,

    isOnline?: boolean,
    quickReplies?: Array<string>
}

export default class ChatIntegrationPreview extends React.Component<Props> {

    _renderMessageContent = () => {
        const {conversationColor, currentUser} = this.props
        const _bgColor = (color) => ({backgroundColor: color})

        if (!currentUser) {
            return null
        }

        return (
            <div className={css.content}>
                <div
                    className={classnames(css.bubble, css.primary, css.firstMessageOfAppUser)}
                    style={_bgColor(conversationColor)}
                >
                    Hey there
                </div>
                <div
                    className={classnames(css.bubble, css.primary, css.lastMessage)}
                    style={_bgColor(conversationColor)}
                >
                    I'm wondering about the status of my order, I've been waiting for a while now and it has
                    not arrived yet.
                </div>

                <div className={css.user}>
                    {currentUser.get('name')}
                </div>

                <div className={classnames(css.bubble, css.firstMessageOfAppMaker)}>
                    Sure, what's your email / order number?
                </div>
            </div>
        )
    }

    _renderQuickReplies = () => {
        const {quickReplies, mainColor} = this.props

        if (!quickReplies) {
            return null
        }

        return (
            <div className={classnames(css.content, css['quick-replies-content'])}>
                <div className={css['quick-replies-wrapper']}>
                    {
                        quickReplies.map((quickReply, index) => (
                            <button
                                key={`${quickReply}-${index}`}
                                className={classnames('btn btn-reply-action', css.reply)}
                                style={{
                                    color: mainColor,
                                    borderColor: mainColor,
                                }}
                            >
                                {quickReply}
                            </button>
                        ))
                    }
                </div>
            </div>
        )
    }

    render() {
        let {
            name,
            introductionText,
            offlineIntroductionText,
            inputPlaceholder,
            mainColor,
            isOnline,
            quickReplies
        } = this.props

        const _bgColor = (color) => ({backgroundColor: color})

        // Preserve the space which should be occupied by a string when the string is empty
        const nonbreak = (str) => {
            return str || '\u00a0'
        }

        const offlineColor = '#A1A9B6'
        const shouldHeaderDisplayOnline = isOnline

        const statusMarker = (
            <div className={classnames({
                [css.onlineMarker]: isOnline,
                [css.offlineMarker]: !isOnline
            })}/>
        )

        return (
            <div className={css.preview}>
                <div className={css.titlebar}/>
                <div className={css.dialog}>
                    <div
                        className={css.header}
                        style={_bgColor(shouldHeaderDisplayOnline ? mainColor : offlineColor)}
                    >
                        <div className={css.agents}>
                            <div
                                className={classnames(css.agent, css.first)}
                                style={{borderColor: shouldHeaderDisplayOnline ? mainColor : offlineColor}}
                            >
                                <i className="material-icons">
                                person
                                </i>
                                {statusMarker}
                            </div>
                            <div
                                className={classnames(css.agent, css.middle)}
                                style={{borderColor: shouldHeaderDisplayOnline ? mainColor : offlineColor}}
                            >
                                <i className="material-icons">
                                person
                                </i>
                                {statusMarker}
                            </div>
                            <div
                                className={classnames(css.agent, css.last)}
                                style={{borderColor: shouldHeaderDisplayOnline ? mainColor : offlineColor}}
                            >
                                <i className="material-icons">
                                person
                                </i>
                                {statusMarker}
                            </div>
                        </div>

                        <div className={css.details}>
                            <div className={css.appName}>
                                {nonbreak(name)}
                            </div>
                            <div className={css.introductionText}>
                                {nonbreak(isOnline ? introductionText : offlineIntroductionText)}
                            </div>
                            {
                                !isOnline && (
                                    <div className={css['business-hours-back-badge']}>
                                        Back tomorrow
                                    </div>
                                )
                            }
                        </div>
                    </div>

                    { quickReplies ? this._renderQuickReplies() : this._renderMessageContent() }

                    <div className={css.poweredby}>
                        Powered by Gorgias
                    </div>

                    <div className={css.footer}>
                        <div className={css.placeholder}>
                            {nonbreak(inputPlaceholder)}
                        </div>

                        <i className={classnames(css.icon, css.camera)}/>
                    </div>
                </div>

                <div
                    className={css.button}
                    style={_bgColor(mainColor)}
                >
                    <div className={css.iconWrapper}>
                        <i className={css.icon}/>
                        <div className={css.shadow}/>
                    </div>
                </div>
            </div>
        )
    }
}
