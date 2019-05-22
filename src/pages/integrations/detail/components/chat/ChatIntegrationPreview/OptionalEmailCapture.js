import React from 'react'
import classnames from 'classnames'

import {
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_TEXTS
} from '../../../../../../config/integrations/chat'

import css from './ChatIntegrationPreview.less'


type Props = {
    conversationColor?: string,
    name?: string,
    language?: string
}

export default class OptionalEmailCapture extends React.Component<Props> {
    render() {
        const {conversationColor, name, language} = this.props

        const translatedTexts = SMOOCH_INSIDE_WIDGET_TEXTS[language || SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT]

        return (
            <div className={css.content}>
                <div
                    className={classnames(css.bubble, css.primary, css.firstMessageOfAppUser, css.lastMessage)}
                    style={{backgroundColor: conversationColor}}
                >
                    hi
                </div>

                <div className={css.appMakerMessageWrapper}>
                    <div className={classnames(css.avatar, css.gorgiasLogo)}>
                        <img src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/gorgias-icon-logo-white.png`}/>
                    </div>
                    <div>
                        <div className={css.user}>
                            {name}
                        </div>

                        <div className={classnames(css.bubble, css.firstMessageOfAppMaker, 'mb-2')}>
                            {translatedTexts.emailCaptureOfflineTriggerText}
                        </div>

                        <div className={css.optionalEmailCapture}>
                            <div className={css.inputLabel}>
                                {translatedTexts.emailCaptureInputLabel}
                            </div>
                            <div className={css.inputWrapper}>
                                <input
                                    className="input"
                                    placeholder={translatedTexts.emailCapturePlaceholder}
                                    type='email'
                                    readOnly
                                />
                                <button style={{backgroundColor: conversationColor}}>
                                    <i className='material-icons'>chevron_right</i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
