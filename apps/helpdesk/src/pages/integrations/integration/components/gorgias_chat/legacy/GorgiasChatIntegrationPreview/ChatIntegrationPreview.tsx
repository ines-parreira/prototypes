/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ReactNode } from 'react'
import React, { createContext } from 'react'

import { ThemeProvider } from '@emotion/react'
import styled from '@emotion/styled'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import classnames from 'classnames'
import type { List } from 'immutable'
import moment from 'moment'

import noise from 'assets/img/integrations/noise.svg'
import type { ConversationHeaderVariant } from 'gorgias-design-system/Header/ConversationHeader'
import ConversationHeader from 'gorgias-design-system/Header/ConversationHeader'
import WidgetHeader from 'gorgias-design-system/Header/WidgetHeader'
import ChatMessageInput from 'gorgias-design-system/Input/ChatMessageInput'
import useAppSelector from 'hooks/useAppSelector'
import type {
    GorgiasChatAvatarSettings,
    GorgiasChatPosition,
} from 'models/integration/types'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    GorgiasChatLauncherType,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'
import Collapse from 'pages/common/components/Collapse/Collapse'
import type { PositionAxis } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/types'
import { getBusinessHoursSettings } from 'state/currentAccount/selectors'

import type { LanguageItem } from '../../../../../../../config/integrations/gorgias_chat'
import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
    isAutoresponderReply,
} from '../../../../../../../config/integrations/gorgias_chat'
import {
    getTextColorBasedOnBackground,
    getThemeBasedOnContrast,
} from './color-utils'
import CustomizedChatLauncher from './CustomizedChatLauncher'
import { AddIcon, PlaneIcon } from './icon-utils'
import PrivacyPolicyDisclaimer from './PrivacyPolicyDisclaimer'

import css from './ChatIntegrationPreview.less'

type ChatIntegrationPreviewContextState = {
    displayBotLabel: boolean
    avatar: GorgiasChatAvatarSettings
}

export const ChatIntegrationPreviewContext =
    createContext<ChatIntegrationPreviewContextState>({
        displayBotLabel: true,
        avatar: {
            companyLogoUrl: undefined,
            imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
            nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        },
    })

export type ChatTheme = {
    mainColor: string
}

type Props = {
    name: string
    introductionText?: string
    offlineIntroductionText?: string
    headerText?: string
    mainColor: string
    background?: string
    mainFontFamily: string
    isOnline: boolean
    language?: string
    languages?: List<LanguageItem>
    children: ReactNode
    renderFooter?: boolean
    renderPrivacyPolicyDisclaimer?: boolean
    position?: GorgiasChatPosition
    editedPositionAxis?: PositionAxis | null
    autoResponderEnabled?: boolean
    autoResponderReply?: string
    hideButton?: boolean
    showGoBackButton?: boolean
    enableAnimations?: boolean
    launcher?: {
        type: GorgiasChatLauncherType
        label?: string
    }
    isOpen?: boolean
    showBackground?: boolean
    isWidgetConversation?: boolean
    backgroundColorStyle?: GorgiasChatBackgroundColorStyle
    headerPictureUrl?: string
    privacyPolicyDisclaimerText?: string
    avatar: GorgiasChatAvatarSettings
    displayBotLabel: boolean
    useMainColorOutsideBusinessHours: boolean
}

const ChatIntegrationPreview = (props: Props) => {
    const {
        name,
        introductionText,
        offlineIntroductionText,
        mainFontFamily,
        mainColor,
        isOnline,
        language = GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
        children,
        renderFooter = true,
        renderPrivacyPolicyDisclaimer = false,
        privacyPolicyDisclaimerText = '',
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
        isWidgetConversation = true,
        backgroundColorStyle = GorgiasChatBackgroundColorStyle.Gradient,
        background,
        headerPictureUrl,
        displayBotLabel,
        avatar,
        useMainColorOutsideBusinessHours,
    } = props

    const isControlBotLabelEnabled = useFlag(
        FeatureFlagKey.ChatControlBotLabelVisibility,
    )
    const isControlUseMainColorOutsideBusinessHoursEnabled = useFlag(
        FeatureFlagKey.ChatControlOutsideBusinessHoursColor,
    )

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

    const currentColor =
        (isControlUseMainColorOutsideBusinessHoursEnabled &&
            useMainColorOutsideBusinessHours) ||
        isOnline
            ? mainColor
            : offlineColor

    const contrastColor = getTextColorBasedOnBackground(currentColor)

    const variant = getThemeBasedOnContrast(currentColor)

    const ClockIcon = (
        <i className="material-icons" style={{ color: contrastColor }}>
            schedule
        </i>
    )

    const renderWithAnimationIfEnabled = (
        node: ReactNode,
        direction: 'vertical' | 'horizontal',
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

    const ConversationHeaderMessage = () => {
        if (!isOnline) {
            return (
                <>
                    {ClockIcon}
                    {translatedTexts.backLabelBackAt.replace(
                        '{time}',
                        moment()
                            .hour(businessHoursFromHour)
                            .minutes(0)
                            .locale(language)
                            .format('LT'),
                    )}
                </>
            )
        }
        if (isOnline && autoResponderEnabled && autoResponderReply) {
            return (
                <>
                    {ClockIcon}
                    {getTypicalResponseText()}
                </>
            )
        }
    }

    const ConversationHeaderBackButton = () => {
        return showGoBackButton
            ? renderWithAnimationIfEnabled(
                  <div className={css.backButton}>
                      <i
                          className="material-icons"
                          style={{ color: contrastColor }}
                      >
                          chevron_left
                      </i>
                  </div>,
                  'horizontal',
              )
            : null
    }

    const Gradient = styled.div<{ color: string }>`
        position: absolute;
        top: 0;
        height: 100%;
        width: 100%;
        background: ${({ color }) =>
            `linear-gradient(${color} 34%, hsla(0, 0%, 100%, 0.4))`};
    `

    const NoiseEffect = styled.div`
        position: absolute;
        top: 0;
        height: 100%;
        width: 100%;
        opacity: 0.1;
        background-image: url(${noise});
    `

    const context: ChatIntegrationPreviewContextState = {
        displayBotLabel: isControlBotLabelEnabled ? displayBotLabel : true,
        avatar,
    }

    const theme: ChatTheme = {
        mainColor,
    }

    return (
        <ChatIntegrationPreviewContext.Provider value={context}>
            <ThemeProvider theme={theme}>
                <CustomizedChatLauncher
                    className={classnames(
                        css.preview,
                        showBackground && css.previewWithBackground,
                    )}
                    mainFontFamily={mainFontFamily}
                    launcher={launcher}
                    position={position}
                    mainColor={currentColor}
                    hideButton={hideButton}
                    editedPositionAxis={editedPositionAxis}
                    isClosed={!isOpen || !!editedPositionAxis}
                >
                    <div
                        className={css.dialog}
                        data-testid={'previewHeader'}
                        style={{
                            backgroundColor: currentColor,
                        }}
                    >
                        {backgroundColorStyle ===
                            GorgiasChatBackgroundColorStyle.Gradient && (
                            <Gradient
                                data-testid={'gradientColor'}
                                color={currentColor}
                            ></Gradient>
                        )}
                        <NoiseEffect></NoiseEffect>
                        <div className={css.noise}></div>
                        {isWidgetConversation && (
                            <ConversationHeader
                                role="region"
                                aria-label="Live chat window header"
                                variant={variant as ConversationHeaderVariant}
                                title={name}
                                message={ConversationHeaderMessage()}
                                leadIcon={ConversationHeaderBackButton()}
                                style={{ zIndex: 2 }}
                            />
                        )}

                        {!isWidgetConversation && (
                            <WidgetHeader
                                role="region"
                                aria-label="Live chat window header"
                                headerPictureUrl={headerPictureUrl}
                                variant={variant as ConversationHeaderVariant}
                                title={name}
                                message={
                                    isOnline
                                        ? introductionText
                                        : offlineIntroductionText
                                }
                            />
                        )}

                        <div
                            className={classnames(
                                isWidgetConversation &&
                                    css.conversationContentWrapper,
                                !isWidgetConversation && css.contentWrapper,
                            )}
                            style={
                                background
                                    ? {
                                          background: background,
                                      }
                                    : {}
                            }
                        >
                            {children}

                            {renderPrivacyPolicyDisclaimer && (
                                <PrivacyPolicyDisclaimer
                                    mainColor={mainColor}
                                    privacyPolicyDisclaimerText={
                                        privacyPolicyDisclaimerText
                                    }
                                    variant="collapsed"
                                />
                            )}

                            {renderFooter && (
                                <ChatMessageInput
                                    aria-label={'Gorgias message input'}
                                    placeholder={nonbreak(
                                        translatedTexts.inputPlaceholder,
                                    )}
                                    leadIcon={<AddIcon />}
                                    leadIconAriaLabel="Add attachment"
                                    trailIcon={<PlaneIcon />}
                                    trailIconAriaLabel="Send message"
                                    readOnly
                                />
                            )}
                        </div>
                    </div>
                </CustomizedChatLauncher>
            </ThemeProvider>
        </ChatIntegrationPreviewContext.Provider>
    )
}
export default ChatIntegrationPreview
