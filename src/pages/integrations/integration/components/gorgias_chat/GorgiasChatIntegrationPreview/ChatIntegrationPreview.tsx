import classnames from 'classnames'
import moment from 'moment'
import React, {ReactNode} from 'react'

import Collapse from 'pages/common/components/Collapse/Collapse'

import useAppSelector from 'hooks/useAppSelector'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
    isAutoresponderReply,
} from '../../../../../../config/integrations/gorgias_chat'
import {
    GorgiasChatAvatarSettings,
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
    GorgiasChatLauncherType,
} from '../../../../../../models/integration/types'
import {PositionAxis} from '../GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'

import ChatTitle from './ChatTitle'
import ChatIntegrationAvatar from './ChatIntegrationAvatar'
import css from './ChatIntegrationPreview.less'
import {getTextColorBasedOnBackground} from './color-utils'
import GorgiasChatPoweredBy from './GorgiasChatPoweredBy'
import CustomizedChatLauncher from './CustomizedChatLauncher'

type Props = {
    name: string
    introductionText?: string
    offlineIntroductionText?: string
    headerText?: string
    mainColor: string
    avatar?: GorgiasChatAvatarSettings
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
    contentClassName?: string
}

const ChatIntegrationPreview = (props: Props) => {
    const {
        name,
        introductionText,
        offlineIntroductionText,
        avatar,
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
        contentClassName,
    } = props

    const businessHoursSettings = useAppSelector(getBusinessHoursSettings)

    const businessHours = businessHoursSettings?.data.business_hours || []

    const businessHoursFromHour = businessHours.length
        ? Number(businessHours[0].from_time.split(':')[0])
        : 9

    // Preserve the space which should be occupied by a string when the string is empty
    const nonbreak = (str?: string) => {
        return str || '\u00a0'
    }

    const offlineColor = '#EBEBEB' // Colors.LightGrey in chat client

    const translatedTexts = GORGIAS_CHAT_WIDGET_TEXTS[language]

    const getTypicalResponseText = () => {
        if (!isAutoresponderReply(autoResponderReply)) {
            return null
        }

        return {
            [GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC]:
                translatedTexts.replyTimeMoments,
            [GORGIAS_CHAT_AUTO_RESPONDER_REPLY_SHORTLY]:
                translatedTexts.usualReplyTimeMinutes,
            [GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES]:
                translatedTexts.usualReplyTimeMinutes,
            [GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS]:
                translatedTexts.usualReplyTimeHours,
            [GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_DAY]:
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

    return (
        <CustomizedChatLauncher
            className={classnames(
                css.preview,
                showBackground && css.previewWithBackground
            )}
            launcher={launcher}
            position={position}
            mainColor={isOnline ? mainColor : offlineColor}
            hideButton={hideButton}
            editedPositionAxis={editedPositionAxis}
            isClosed={!isOpen || !!editedPositionAxis}
        >
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
                        avatar={avatar}
                        avatarType={avatarType}
                        avatarTeamPictureUrl={avatarTeamPictureUrl}
                        isOnline={isOnline}
                        shouldHideAvatarOnlineMarker={
                            !isOnline || shouldHideAvatarOnlineMarker
                        }
                        mainColor={mainColor}
                        offlineColor={offlineColor}
                    />

                    <div className={css.details} style={{color: contrastColor}}>
                        <ChatTitle title={name} />
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
                                        .hour(businessHoursFromHour)
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
                                    {ClockIcon}
                                    {getTypicalResponseText()}
                                </div>
                            )}
                    </div>
                </div>

                <div className={classnames(css.content, contentClassName)}>
                    {children}
                </div>

                {renderPoweredBy && (
                    <GorgiasChatPoweredBy translatedTexts={translatedTexts} />
                )}

                {renderFooter && (
                    <div className={css.footer}>
                        <div className={css.placeholder}>
                            {nonbreak(translatedTexts.inputPlaceholder)}
                        </div>

                        <i
                            className={classnames(
                                'material-icons',
                                css.icon,
                                css.attachmentIcon
                            )}
                        >
                            attach_file
                        </i>
                    </div>
                )}
            </div>
        </CustomizedChatLauncher>
    )
}
export default ChatIntegrationPreview
