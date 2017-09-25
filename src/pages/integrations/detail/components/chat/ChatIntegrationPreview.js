import React, {PropTypes} from 'react'
import classnames from 'classnames'

import css from './ChatIntegrationPreview.less'

const ChatIntegrationPreview = ({
    name,
    currentUser,
    introductionText,
    inputPlaceholder,
    mainColor,
    conversationColor,
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

        return (
            <svg version="1.0" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 100 100"
                 style={{overflow: 'visible', shapeRendering: 'geometricPrecision'}}>
                <filter id="33c9df204aeec9aa096f1fd360bd4160">
                    <feGaussianBlur stdDeviation="0,4" in="SourceAlpha"></feGaussianBlur>
                    <feOffset dx="0" dy="4" result="offsetblur"></feOffset>
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.4"></feFuncA>
                    </feComponentTransfer>
                    <feComposite operator="in" in2="offsetblur"></feComposite>
                    <feMerge>
                        <feMergeNode></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                </filter>
                <path fill="#fff"
                      d="M50,0C22.4,0,0,22.4,0,50s22.4,50,50,50h30.8l0-10.6C92.5,80.2,100,66,100,50C100,22.4,77.6,0,50,0z M32,54.5 c-2.5,0-4.5-2-4.5-4.5c0-2.5,2-4.5,4.5-4.5s4.5,2,4.5,4.5C36.5,52.5,34.5,54.5,32,54.5z M50,54.5c-2.5,0-4.5-2-4.5-4.5 c0-2.5,2-4.5,4.5-4.5c2.5,0,4.5,2,4.5,4.5C54.5,52.5,52.5,54.5,50,54.5z M68,54.5c-2.5,0-4.5-2-4.5-4.5c0-2.5,2-4.5,4.5-4.5 s4.5,2,4.5,4.5C72.5,52.5,70.5,54.5,68,54.5z"></path>
            </svg>
        )
    }

    function nonbreak(str) {
        return str || '\u00a0'
    }

    return (
        <div className={css.preview}>
            <div className={css.titlebar}/>
            <div className={css.dialog}>
                <div
                    className={css.header}
                    style={_bgColor(mainColor)}
                >
                    <div className={css.brand}>
                        {_renderBrandIcon()}
                    </div>

                    <div className={css.details}>
                        <div className={css.appName}>
                            {nonbreak(name)}
                        </div>
                        <div className={css.introductionText}>
                            {nonbreak(introductionText)}
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
                <i className={css.icon}/>
            </div>
        </div>
    )
}

ChatIntegrationPreview.propTypes = {
    name: PropTypes.string.isRequired,
    currentUser: PropTypes.object.isRequired,
    introductionText: PropTypes.string,
    headerText: PropTypes.string,
    inputPlaceholder: PropTypes.string,
    mainColor: PropTypes.string,
    conversationColor: PropTypes.string,
    icon: PropTypes.string,
}

export default ChatIntegrationPreview
