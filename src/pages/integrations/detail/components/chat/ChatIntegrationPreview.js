import React, {PropTypes} from 'react'
import classnames from 'classnames'

import css from './ChatIntegrationPreview.less'

const ChatIntegrationPreview = ({
    name,
    currentUser,
    windowTitle,
    headerText,
    inputPlaceholder,
    sendButtonText,
    headerColor,
    conversationColor,
    chatIconColor,
    icon,
}) => {
    const _bgColor = (color) => ({backgroundColor: color})

    function _renderBrandIcon() {
        if (icon) {
            // icon is url
            let preview = icon

            // icon is FileList
            if (icon instanceof FileList && icon.length) {
                preview = icon[0].preview
            }

            const style = {
                backgroundImage: `url(${preview})`
            }

            return (<span className={css.image} style={style}/>)
        }

        return (<i className={classnames(css.icon, css.comments)} />)
    }

    function nonbreak(str) {
        return str || '\u00a0'
    }

    return (
        <div className={css.preview}>
            <div className={css.titlebar}></div>

            <div className={css.dialog}>
                <div
                    className={css.titlebar}
                    style={_bgColor(headerColor)}
                >
                    {nonbreak(windowTitle || 'How can we help?')}

                    <i className={classnames(css.icon, css.times)}></i>
                </div>
                <div className={css.header}>
                    <div className={css.brand}>
                        {_renderBrandIcon()}
                    </div>

                    <div className={css.details}>
                        <h2>
                            {nonbreak(name)}
                        </h2>
                        <p>
                            {nonbreak(headerText)}
                        </p>
                    </div>
                </div>
                <div className={css.content}>
                    <div
                        className={classnames(css.bubble, css.primary)}
                        style={_bgColor(conversationColor)}
                    >
                        Hey, I'm wondering about the status of my order
                    </div>

                    <div className={css.user}>
                        {currentUser.get('name')}
                    </div>

                    <div className={classnames(css.bubble)}>
                        Sure, what's your email / order number?
                    </div>

                    <div className={css.poweredby}>
                        Messaging by <strong>Gorgias</strong>
                    </div>
                </div>
                <div className={css.footer}>
                    <i className={classnames(css.icon, css.camera)}></i>
                    <div className={css.placeholder}>
                        {nonbreak(inputPlaceholder || 'Type a message...')}
                    </div>

                    <span className={classnames(css.send)}>
                        {nonbreak(sendButtonText || 'Send')}
                    </span>
                </div>
            </div>

            <div
                className={css.button}
                style={_bgColor(chatIconColor)}
            >
                <i className={css.icon}></i>
            </div>
        </div>
    )
}

ChatIntegrationPreview.propTypes = {
    name: PropTypes.string.isRequired,
    currentUser: PropTypes.object.isRequired,
    windowTitle: PropTypes.string,
    headerText: PropTypes.string,
    inputPlaceholder: PropTypes.string,
    sendButtonText: PropTypes.string,
    headerColor: PropTypes.string,
    conversationColor: PropTypes.string,
    chatIconColor: PropTypes.string,
    icon: PropTypes.string,
}

export default ChatIntegrationPreview
