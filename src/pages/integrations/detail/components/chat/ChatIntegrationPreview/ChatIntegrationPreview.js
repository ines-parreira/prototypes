// @flow
import React, {type Node} from 'react'
import {type Map} from 'immutable'
import classnames from 'classnames'

import {
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_TEXTS
} from '../../../../../../config/integrations/chat'


import css from './ChatIntegrationPreview.less'


type Props = {
    name?: string,
    currentUser?: Map<*,*>,
    introductionText?: string,
    offlineIntroductionText?: string,
    headerText?: string,
    mainColor?: string,

    isOnline?: boolean,
    language: string,

    children: Node,
    renderFooter: boolean
}

export default class ChatIntegrationPreview extends React.Component<Props> {
    static defaultProps = {
        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
        renderFooter: true
    }

    render() {
        let {
            name,
            introductionText,
            offlineIntroductionText,
            mainColor,
            isOnline,
            language,
            children,
            renderFooter
        } = this.props

        // Preserve the space which should be occupied by a string when the string is empty
        const nonbreak = (str) => {
            return str || '\u00a0'
        }

        const offlineColor = '#A1A9B6'

        const statusMarker = (
            <div className={classnames({
                [css.onlineMarker]: isOnline,
                [css.offlineMarker]: !isOnline
            })}/>
        )

        const translatedTexts = SMOOCH_INSIDE_WIDGET_TEXTS[language]

        return (
            <div className={css.preview}>
                <div className={css.titlebar}/>
                <div className={css.dialog}>
                    <div
                        className={css.header}
                        style={{backgroundColor: isOnline ? mainColor : offlineColor}}
                    >
                        <div className={css.agents}>
                            <div
                                className={classnames(css.agent, css.first)}
                                style={{borderColor: isOnline ? mainColor : offlineColor}}
                            >
                                <i className="material-icons">
                                person
                                </i>
                                {statusMarker}
                            </div>
                            <div
                                className={classnames(css.agent, css.middle)}
                                style={{borderColor: isOnline ? mainColor : offlineColor}}
                            >
                                <i className="material-icons">
                                person
                                </i>
                                {statusMarker}
                            </div>
                            <div
                                className={classnames(css.agent, css.last)}
                                style={{borderColor: isOnline ? mainColor : offlineColor}}
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
                                        {translatedTexts.backLabelBackTomorrow}
                                    </div>
                                )
                            }
                        </div>
                    </div>

                    { children }

                    <div className={css.poweredby}>
                        {translatedTexts.poweredByGorgias}
                    </div>

                    {
                        renderFooter && (
                            <div className={css.footer}>
                                <div className={css.placeholder}>
                                    {nonbreak(translatedTexts.inputPlaceholder)}
                                </div>

                                <i className={classnames(css.icon, css.camera)}/>
                            </div>
                        )
                    }
                </div>

                <div
                    className={css.button}
                    style={{backgroundColor: mainColor}}
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
