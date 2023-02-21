import classnames from 'classnames'
import moment from 'moment'
import React, {ReactNode} from 'react'

import {useFlags} from 'launchdarkly-react-client-sdk'
import Collapse from 'pages/common/components/Collapse/Collapse'
import {FeatureFlagKey} from 'config/featureFlags'

import {
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    isAutoresponderReply,
} from '../../../../../../config/integrations'
import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'
import {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
    GorgiasChatLauncherType,
} from '../../../../../../models/integration/types'
import {PositionAxis} from '../GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'

import ChatIntegrationAvatar from './ChatIntegrationAvatar'
import css from './ChatIntegrationPreview.less'
import {getTextColorBasedOnBackground} from './color-utils'
import GorgiasChatPoweredBy from './GorgiasChatPoweredBy'
import ChatLauncher from './ChatLauncher'

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
    renderFooter?: boolean
    renderPoweredBy?: boolean
    position?: GorgiasChatPosition
    editedPositionAxis?: PositionAxis | null
    autoResponderEnabled?: boolean
    autoResponderReply?: string
    hideButton?: boolean
    shouldHideAvatarOnlineMarker?: boolean
    showGoBackButton?: boolean
    enableAnimations?: boolean
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
    isOpen?: boolean
    showBackground?: boolean
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
        shouldHideAvatarOnlineMarker = false,
        language = GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
        children,
        renderFooter = true,
        renderPoweredBy = true,
        position = {
            alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
            offsetX: 0,
            offsetY: 0,
        },
        editedPositionAxis,
        autoResponderReply,
        autoResponderEnabled,
        hideButton,
        showGoBackButton,
        enableAnimations,
        launcher = {
            type: GorgiasChatLauncherType.ICON,
        },
        isOpen = true,
        showBackground = true,
    } = props

    const isLauncherCustomizationEnabled =
        useFlags()[FeatureFlagKey.ChatLauncherCustomization]

    // Preserve the space which should be occupied by a string when the string is empty
    const nonbreak = (str?: string) => {
        return str || '\u00a0'
    }

    const isButtonOnTop =
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_RIGHT ||
        position.alignment === GorgiasChatPositionAlignmentEnum.TOP_LEFT

    const offlineColor = '#EBEBEB' // Colors.LightGrey in chat client

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

    const contrastColor = getTextColorBasedOnBackground(
        isOnline ? mainColor : offlineColor
    )

    const ClockIcon = (
        <i className="material-icons" style={{color: contrastColor}}>
            schedule
        </i>
    )

    const renderWithAnimationIfEnabled = (
        node: ReactNode,
        direction: 'vertical' | 'horizontal'
    ) => {
        if (!enableAnimations) {
            return node
        }

        return (
            <Collapse isOpen appear direction={direction}>
                {node}
            </Collapse>
        )
    }

    if (!isOpen) {
        return (
            <div
                className={classnames(
                    css.preview,
                    showBackground && css.previewWithBackground
                )}
                style={{...getPreviewCustomStyle()}}
            >
                <div
                    className={classnames(
                        css.buttonWrapper,
                        css[position.alignment],
                        css.onlyButton
                    )}
                >
                    <ChatLauncher
                        {...launcher}
                        backgroundColor={mainColor}
                        windowState="closed"
                    />
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
            </div>
        )
    }

    const ChatButton = isLauncherCustomizationEnabled ? (
        <ChatLauncher
            {...launcher}
            backgroundColor={mainColor}
            windowState="opened"
        />
    ) : (
        <ChatLauncher
            {...launcher}
            backgroundColor={mainColor}
            windowState="closed"
        />
    )

    return (
        <div
            className={classnames(
                css.preview,
                showBackground && css.previewWithBackground
            )}
            style={{...getPreviewCustomStyle()}}
        >
            {isButtonOnTop && !hideButton && (
                <div
                    className={classnames(
                        css.buttonWrapper,
                        css[position.alignment]
                    )}
                >
                    {ChatButton}
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
                    {showGoBackButton &&
                        renderWithAnimationIfEnabled(
                            <div className={css.goBackButton}>
                                <i
                                    className="material-icons"
                                    style={{color: contrastColor}}
                                >
                                    chevron_left
                                </i>
                            </div>,
                            'horizontal'
                        )}
                    <ChatIntegrationAvatar
                        avatarType={avatarType}
                        avatarTeamPictureUrl={avatarTeamPictureUrl}
                        isOnline={isOnline}
                        shouldHideAvatarOnlineMarker={
                            shouldHideAvatarOnlineMarker
                        }
                        mainColor={mainColor}
                        offlineColor={offlineColor}
                    />

                    <div className={css.details} style={{color: contrastColor}}>
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
                                {ClockIcon}
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
                            autoResponderReply &&
                            autoResponderReply !==
                                GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC && (
                                <div className={css.replyTime}>
                                    {ClockIcon}
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

            {!isButtonOnTop && !hideButton && (
                <div
                    className={classnames(
                        css.buttonWrapper,
                        css[position.alignment]
                    )}
                >
                    {ChatButton}
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
