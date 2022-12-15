import React from 'react'
import classnames from 'classnames'

import {assetsUrl} from 'utils'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'

import css from './ChatIntegrationPreview.less'
import {getTextColorBasedOnBackground} from './color-utils'

type Props = {
    name: Maybe<string>
    language: Maybe<string>
    conversationColor: string
}

export default class RequiredEmailCapture extends React.Component<Props> {
    static defaultProps: Pick<Props, 'language'> = {
        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    }

    render() {
        const {conversationColor, name, language} = this.props
        const contrastColor = getTextColorBasedOnBackground(conversationColor)

        const translatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        return (
            <div
                className={classnames(
                    css.content,
                    css.requiredEmailCaptureContent
                )}
            >
                <div className={css.appMakerMessageWrapper}>
                    <div className={classnames(css.avatar, css.robotLogo)}>
                        <img
                            src={assetsUrl('/img/icons/robot-icon.svg')}
                            alt="Robot icon"
                        />
                    </div>
                    <div>
                        <div className={css.user}>{name}</div>

                        <div
                            className={classnames(
                                css.bubble,
                                css.firstMessageOfAppMaker,
                                'mb-2'
                            )}
                        >
                            {translatedTexts.requiredEmailCaptureWelcomeMessage}
                        </div>

                        <div className={css.optionalEmailCapture}>
                            <div className={css.inputLabel}>
                                {translatedTexts.emailCaptureInputLabel}
                            </div>
                            <div className={css.inputWrapper}>
                                <input
                                    className="input"
                                    placeholder={
                                        translatedTexts.emailCapturePlaceholder
                                    }
                                    type="email"
                                    readOnly
                                />
                                <button
                                    style={{backgroundColor: conversationColor}}
                                >
                                    <i
                                        className="material-icons"
                                        style={{color: contrastColor}}
                                    >
                                        chevron_right
                                    </i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
