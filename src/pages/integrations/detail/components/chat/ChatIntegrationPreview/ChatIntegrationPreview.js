import React, {PropTypes} from 'react'
import classnames from 'classnames'

import css from './ChatIntegrationPreview.less'

const ChatIntegrationPreview = ({
    name,
    currentUser,
    introductionText,
    offlineIntroductionText,
    offlineStatusEnabled,
    inputPlaceholder,
    mainColor,
    conversationColor,
    isOnline
}) => {
    const _bgColor = (color) => ({backgroundColor: color})

    // Preserve the space which should be occupied by a string when the string is empty
    const nonbreak = (str) => {
        return str || '\u00a0'
    }

    const offlineColor = '#9DA8B8'
    const shouldHeaderDisplayOnline = isOnline || !offlineStatusEnabled

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
                            <i className="fa fa-user"/>
                            {statusMarker}
                        </div>
                        <div
                            className={classnames(css.agent, css.middle)}
                            style={{borderColor: shouldHeaderDisplayOnline ? mainColor : offlineColor}}
                        >
                            <i className="fa fa-user"/>
                            {statusMarker}
                        </div>
                        <div
                            className={classnames(css.agent, css.last)}
                            style={{borderColor: shouldHeaderDisplayOnline ? mainColor : offlineColor}}
                        >
                            <i className="fa fa-user"/>
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
                    </div>
                </div>
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
                    <div className={css.shadow}></div>
                </div>
            </div>
        </div>
    )
}

ChatIntegrationPreview.propTypes = {
    name: PropTypes.string.isRequired,
    currentUser: PropTypes.object.isRequired,
    introductionText: PropTypes.string,
    offlineIntroductionText: PropTypes.string,
    offlineStatusEnabled: PropTypes.bool,
    headerText: PropTypes.string,
    inputPlaceholder: PropTypes.string,
    mainColor: PropTypes.string,
    conversationColor: PropTypes.string,

    isOnline: PropTypes.bool
}

export default ChatIntegrationPreview
