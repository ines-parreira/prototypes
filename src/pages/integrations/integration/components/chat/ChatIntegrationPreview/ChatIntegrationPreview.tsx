import React, {Component, ReactNode} from 'react'
import classnames from 'classnames'

import {
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_TEXTS,
} from 'config/integrations/smooch_inside'

import ChatIntegrationAvatar from './ChatIntegrationAvatar'
import css from './ChatIntegrationPreview.less'

type Props = {
    name: string
    introductionText?: string
    offlineIntroductionText?: string
    headerText?: string
    mainColor: string
    avatarType?: string
    avatarTeamPictureUrl?: string | null
    isOnline: boolean
    language?: string
    children: ReactNode
    renderFooter: boolean
}

export default class ChatIntegrationPreview extends Component<Props> {
    static defaultProps: Pick<Props, 'language' | 'renderFooter'> = {
        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
        renderFooter: true,
    }

    render() {
        const {
            name,
            introductionText,
            offlineIntroductionText,
            avatarType,
            avatarTeamPictureUrl,
            mainColor,
            isOnline,
            language,
            children,
            renderFooter,
        } = this.props

        // Preserve the space which should be occupied by a string when the string is empty
        const nonbreak = (str: string) => {
            return str || '\u00a0'
        }

        const offlineColor = '#A1A9B6'

        const translatedTexts = SMOOCH_INSIDE_WIDGET_TEXTS[language!]

        return (
            <div className={css.preview}>
                <div className={css.titlebar} />
                <div className={css.dialog}>
                    <div
                        className={css.header}
                        style={{
                            backgroundColor: isOnline
                                ? mainColor
                                : offlineColor,
                        }}
                    >
                        <ChatIntegrationAvatar
                            avatarType={avatarType}
                            avatarTeamPictureUrl={avatarTeamPictureUrl}
                            isOnline={isOnline}
                            mainColor={mainColor}
                            offlineColor={offlineColor}
                        />

                        <div className={css.details}>
                            <div className={css.appName}>{nonbreak(name)}</div>
                            <div className={css.introductionText}>
                                {nonbreak(
                                    isOnline
                                        ? introductionText!
                                        : offlineIntroductionText!
                                )}
                            </div>
                            {!isOnline && (
                                <div
                                    className={css['business-hours-back-badge']}
                                >
                                    {translatedTexts.backLabelBackTomorrow}
                                </div>
                            )}
                        </div>
                    </div>

                    {children}

                    <div className={css.poweredby}>
                        {translatedTexts.poweredByGorgias}
                    </div>

                    {renderFooter && (
                        <div className={css.footer}>
                            <div className={css.placeholder}>
                                {nonbreak(translatedTexts.inputPlaceholder)}
                            </div>

                            <i className={classnames(css.icon, css.camera)} />
                        </div>
                    )}
                </div>

                <div
                    className={css.button}
                    style={{backgroundColor: mainColor}}
                >
                    <div className={css.iconWrapper}>
                        <i className={css.icon} />
                        <div className={css.shadow} />
                    </div>
                </div>
            </div>
        )
    }
}
