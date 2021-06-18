// @flow
import React from 'react'
import classnames from 'classnames'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat.ts'

import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'

type Props = {
    conversationColor: string,
    name?: string,
    language?: string,
}

export default class OptionalEmailCapture extends React.Component<Props> {
    render() {
        const {conversationColor, name, language} = this.props

        const translatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        return (
            <div className={css.content}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={['hi']}
                />

                <div className={css.appMakerMessageWrapper}>
                    <div className={classnames(css.avatar, css.robotLogo)}>
                        <img
                            src={`${
                                window.GORGIAS_ASSETS_URL || ''
                            }/static/private/img/icons/robot-icon.svg`}
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
                            {translatedTexts.emailCaptureOnlineTriggerText}
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
                                    <i className="material-icons">
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
