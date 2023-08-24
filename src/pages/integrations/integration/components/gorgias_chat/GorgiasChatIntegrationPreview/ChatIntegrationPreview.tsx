/* eslint-disable @typescript-eslint/no-unused-vars */
import classnames from 'classnames'
import moment from 'moment'
import React, {ReactNode} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import styled from '@emotion/styled'
import {ThemeProvider} from '@emotion/react'
import {List} from 'immutable'

import Collapse from 'pages/common/components/Collapse/Collapse'
import useAppSelector from 'hooks/useAppSelector'
import {getBusinessHoursSettings} from 'state/currentAccount/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import ConversationHeader, {
    ConversationHeaderVariant,
} from 'gorgias-design-system/Header/ConversationHeader'
import WidgetHeader from 'gorgias-design-system/Header/WidgetHeader'
import ChatMessageInput from 'gorgias-design-system/Input/ChatMessageInput'
import {Language} from 'constants/languages'
import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_SHORTLY,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
    isAutoresponderReply,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    LanguageItem,
} from '../../../../../../config/integrations/gorgias_chat'
import {
    GorgiasChatPosition,
    GorgiasChatPositionAlignmentEnum,
    GorgiasChatLauncherType,
} from '../../../../../../models/integration/types'
import {PositionAxis} from '../GorgiasChatIntegrationAppearance/GorgiasChatIntegrationAppearance'

import css from './ChatIntegrationPreview.less'
import {
    getTextColorBasedOnBackground,
    getThemeBasedOnContrast,
} from './color-utils'
import GorgiasChatPoweredBy from './GorgiasChatPoweredBy'
import CustomizedChatLauncher from './CustomizedChatLauncher'
import {AddIcon, PlaneIcon} from './icon-utils'

export type ChatTheme = {
    mainColor: string
}

type Props = {
    name: string
    introductionText?: string
    offlineIntroductionText?: string
    headerText?: string
    mainColor: string
    mainFontFamily: string
    isOnline: boolean
    language?: string
    languages?: List<LanguageItem>
    children: ReactNode
    renderFooter?: boolean
    renderPoweredBy?: boolean
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
        renderPoweredBy = false,
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
    } = props

    const shoudShowFontCustomization =
        useFlags()[FeatureFlagKey.ChatFontCustomization]
    const finalMainFontFamily = shoudShowFontCustomization
        ? mainFontFamily
        : GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT

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

    const variant = getThemeBasedOnContrast(isOnline ? mainColor : offlineColor)

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
                            .format('LT')
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
                          style={{color: contrastColor}}
                      >
                          chevron_left
                      </i>
                  </div>,
                  'horizontal'
              )
            : null
    }

    const Gradient = styled.div<{color: string}>`
        position: absolute;
        top: 0;
        height: 100%;
        width: 100%;
        background: ${({color}) =>
            `linear-gradient(${color} 34%, hsla(0, 0%, 100%, 0.4))`};
    `

    const theme: ChatTheme = {
        mainColor,
    }

    return (
        <ThemeProvider theme={theme}>
            <CustomizedChatLauncher
                className={classnames(
                    css.preview,
                    showBackground && css.previewWithBackground
                )}
                mainFontFamily={finalMainFontFamily}
                launcher={launcher}
                position={position}
                mainColor={isOnline ? mainColor : offlineColor}
                hideButton={hideButton}
                editedPositionAxis={editedPositionAxis}
                isClosed={!isOpen || !!editedPositionAxis}
            >
                <div
                    className={css.dialog}
                    style={{
                        backgroundColor: isOnline ? mainColor : offlineColor,
                    }}
                >
                    <Gradient
                        color={isOnline ? mainColor : offlineColor}
                    ></Gradient>
                    <div className={css.noise}></div>
                    {isWidgetConversation && (
                        <ConversationHeader
                            role="region"
                            aria-label="Live chat window header"
                            variant={variant as ConversationHeaderVariant}
                            title={name}
                            message={ConversationHeaderMessage()}
                            leadIcon={ConversationHeaderBackButton()}
                            style={{zIndex: 2}}
                        />
                    )}

                    {!isWidgetConversation && (
                        <WidgetHeader
                            role="region"
                            aria-label="Live chat window header"
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
                            !isWidgetConversation && css.contentWrapper
                        )}
                    >
                        {children}

                        {renderPoweredBy && (
                            <GorgiasChatPoweredBy
                                translatedTexts={translatedTexts}
                            />
                        )}

                        {renderFooter && (
                            <ChatMessageInput
                                aria-label={'Gorgias message input'}
                                placeholder={nonbreak(
                                    translatedTexts.inputPlaceholder
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
    )
}
export default ChatIntegrationPreview
