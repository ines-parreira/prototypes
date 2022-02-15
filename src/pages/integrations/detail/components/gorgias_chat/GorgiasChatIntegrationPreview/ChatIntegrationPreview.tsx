import React, {ReactNode} from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'
import moment from 'moment'

import clockIcon from 'assets/img/icons/clock.svg'
import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'
import {
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    isAutoresponderReply,
} from '../../../../../../config/integrations'
import {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
} from '../../../../../../models/integration/types'
import {PositionAxis} from '../GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'

import ChatIntegrationAvatar from './ChatIntegrationAvatar'
import css from './ChatIntegrationPreview.less'
import GorgiasChatPoweredBy from './GorgiasChatPoweredBy'

type Props = {
    name: string
    currentUser?: Map<any, any>
    introductionText?: string
    offlineIntroductionText?: string
    headerText?: string
    mainColor: string
    avatarType?: string
    avatarTeamPictureUrl?: string
    isOnline: boolean
    language?: string
    children: ReactNode
    renderFooter?: boolean
    renderPoweredBy?: boolean
    position: GorgiasChatPosition
    editedPositionAxis?: PositionAxis | null
    autoResponderEnabled?: boolean
    autoResponderReply?: string
}

const ChatIntegrationPreview = (props: Props) => {
    const {
        name,
        introductionText,
        offlineIntroductionText,
        avatarType,
        avatarTeamPictureUrl,
        mainColor,
        isOnline,
        language = GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
        children,
        renderFooter = true,
        renderPoweredBy = true,
        position,
        editedPositionAxis,
        autoResponderReply,
        autoResponderEnabled,
    } = props

    // Preserve the space which should be occupied by a string when the string is empty
    const nonbreak = (str?: string) => {
        return str || '\u00a0'
    }

    const isButtonOnTop =
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_LEFT

    const offlineColor = '#A1A9B6'

    const translatedTexts = GORGIAS_CHAT_WIDGET_TEXTS[language]

    const getOffsetXWidth = (): number => {
        const strLength = `${position.offsetX}px`.length
        if (strLength <= 4) {
            return 40
        }

        return strLength * 10
    }

    const getPreviewCustomStyle = () => {
        if (editedPositionAxis !== PositionAxis.AXIS_X) {
            return {}
        }

        return {
            [[
                GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                GorgiasChatPositionAlignmentEnum.TOP_LEFT,
            ].includes(position.alignment)
                ? 'paddingLeft'
                : 'paddingRight']: getOffsetXWidth(),
            width: 380 + getOffsetXWidth(),
        }
    }

    const getOffsetBarCustomStyle = () => {
        return {
            [[
                GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                GorgiasChatPositionAlignmentEnum.TOP_LEFT,
            ].includes(position.alignment)
                ? 'left'
                : 'right']: -getOffsetXWidth(),
            width: getOffsetXWidth(),
        }
    }

    const getTypicalResponseText = () => {
        if (!isAutoresponderReply(autoResponderReply)) {
            return null
        }

        return {
            [CHAT_AUTO_RESPONDER_REPLY_SHORTLY]:
                translatedTexts.usualReplyTimeMinutes,
            [CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES]:
                translatedTexts.usualReplyTimeMinutes,
            [CHAT_AUTO_RESPONDER_REPLY_IN_HOURS]:
                translatedTexts.usualReplyTimeHours,
            [CHAT_AUTO_RESPONDER_REPLY_IN_DAY]:
                translatedTexts.usualReplyTimeDay,
        }[autoResponderReply]
    }

    return (
        <div className={css.preview} style={{...getPreviewCustomStyle()}}>
            <div className={css.titlebar} />
            {isButtonOnTop && (
                <div
                    className={classnames(css.button, css[position.alignment])}
                    style={{backgroundColor: mainColor}}
                >
                    <div className={css.iconWrapper}>
                        <i className={css.icon} />
                        <div className={css.shadow} />
                    </div>
                    {editedPositionAxis === PositionAxis.AXIS_X && (
                        <div
                            className={css['axis-x']}
                            style={{...getOffsetBarCustomStyle()}}
                        >
                            <div className={css.offsetLine} />
                            <div className={css.offsetContent}>
                                {`${position.offsetX}px`}
                            </div>
                        </div>
                    )}
                    {editedPositionAxis === PositionAxis.AXIS_Y && (
                        <div className={css['axis-y']}>
                            <div className={css.offsetLine} />
                            <div className={css.offsetContent}>
                                {`${position.offsetY}px`}
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className={css.dialog}>
                <div
                    className={css.header}
                    style={{
                        backgroundColor: isOnline ? mainColor : offlineColor,
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
                                    ? introductionText
                                    : offlineIntroductionText
                            )}
                        </div>
                        {!isOnline && (
                            <div className={css.replyTime}>
                                <img src={clockIcon} alt="Back online time" />
                                {translatedTexts.backLabelBackAt.replace(
                                    '{time}',
                                    moment()
                                        .hour(9)
                                        .minutes(0)
                                        .locale(language)
                                        .format('LT')
                                )}
                            </div>
                        )}
                        {isOnline &&
                            autoResponderEnabled &&
                            autoResponderReply && (
                                <div className={css.replyTime}>
                                    <img
                                        src={clockIcon}
                                        alt="Typical reply time"
                                    />
                                    {getTypicalResponseText()}
                                </div>
                            )}
                    </div>
                </div>

                {children}

                {renderPoweredBy && (
                    <GorgiasChatPoweredBy translatedTexts={translatedTexts} />
                )}

                {renderFooter && (
                    <div className={css.footer}>
                        <div className={css.placeholder}>
                            {nonbreak(translatedTexts.inputPlaceholder)}
                        </div>

                        <i className={classnames(css.icon, css.camera)} />
                    </div>
                )}
            </div>

            {!isButtonOnTop && (
                <div
                    className={classnames(css.button, css[position.alignment])}
                    style={{backgroundColor: mainColor}}
                >
                    <div className={css.iconWrapper}>
                        <i className={css.icon} />
                        <div className={css.shadow} />
                    </div>
                    {editedPositionAxis === PositionAxis.AXIS_X && (
                        <div
                            className={css['axis-x']}
                            style={{...getOffsetBarCustomStyle()}}
                        >
                            <div className={css.offsetLine} />
                            <div className={css.offsetContent}>
                                {`${position.offsetX}px`}
                            </div>
                        </div>
                    )}
                    {editedPositionAxis === PositionAxis.AXIS_Y && (
                        <div className={css['axis-y']}>
                            <div className={css.offsetLine} />
                            <div className={css.offsetContent}>
                                {`${position.offsetY}px`}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
export default ChatIntegrationPreview
