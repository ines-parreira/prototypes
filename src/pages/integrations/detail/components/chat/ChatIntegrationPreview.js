import React, {PropTypes} from 'react'
import css from './ChatIntegrationPreview.less'
import classnames from 'classnames'

const ChatIntegrationPreview = ({name, decoration, currentUser}) => {
    const titlebarStyle = {
        backgroundColor: decoration.get('header_color')
    }

    const bubbleStyle = {
        backgroundColor: decoration.get('conversation_color')
    }

    const buttonStyle = {
        backgroundColor: decoration.get('chat_icon_color')
    }

    function _renderBrandIcon() {
        const icon = decoration.get('icon')

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
                    style={titlebarStyle}
                >
                    How can we help?

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
                            {nonbreak(decoration.get('header_text'))}
                        </p>
                    </div>
                </div>
                <div className={css.content}>
                    <div
                        className={classnames(css.bubble, css.primary)}
                        style={bubbleStyle}
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
                        Type a message...
                    </div>
                    <button type="button">
                        Send
                    </button>
                </div>
            </div>

            <div
                className={css.button}
                style={buttonStyle}
            >
                <i className={css.icon}></i>
            </div>
        </div>
    )
}

ChatIntegrationPreview.defaultProps = {
    name: ''
}

ChatIntegrationPreview.propTypes = {
    name: PropTypes.string.isRequired,
    currentUser: PropTypes.object.isRequired,
    decoration: PropTypes.object
}

export default ChatIntegrationPreview
