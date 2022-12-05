import React, {Component} from 'react'
import classnames from 'classnames'

import {assetsUrl} from 'utils'

import {
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_TEXTS,
} from '../../../../../../config/integrations/smooch_inside'

import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'

type Props = {
    conversationColor: string
    name?: string
    language?: string
}

export default class OptionalEmailCapture extends Component<Props> {
    render() {
        const {conversationColor, name, language} = this.props

        const translatedTexts =
            SMOOCH_INSIDE_WIDGET_TEXTS[
                language || SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT
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
                            alt="robot icon"
                            src={assetsUrl('/img/icons/robot-icon.svg')}
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
