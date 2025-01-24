import {Label} from '@gorgias/merchant-ui-kit'
import {fromJS} from 'immutable'
import React, {useCallback, useMemo, useState} from 'react'

import {
    GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_DEFAULT_COLOR,
    GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
    GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT,
    GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import {
    EMAIL_INTEGRATION_TYPES,
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatBackgroundColorStyle,
    ShopifyIntegration,
    StoreIntegration,
} from 'models/integration/types'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import {ChatIntegrationListSelection} from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import {EmailIntegrationListSelection} from 'pages/aiAgent/components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {Separator} from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {useOnboardingContext} from 'pages/aiAgent/Onboarding/providers/OnboardingContext'

import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'

import {AiAgentScopes} from 'pages/aiAgent/Onboarding/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import CheckBox from 'pages/common/forms/CheckBox'
import ColorField from 'pages/common/forms/ColorField'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import {createGorgiasChatIntegration} from 'state/integrations/actions'
import {
    getIntegrationsByTypes,
    getShopifyIntegrationByShopName,
} from 'state/integrations/selectors'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

import css from './ChannelsStep.less'

const createChatConfiguration = (
    storeIntegration: StoreIntegration,
    color: string
) => {
    const language = GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
    return {
        type: GORGIAS_CHAT_INTEGRATION_TYPE,
        name: storeIntegration.name,
        decoration: {
            conversation_color: color,
            main_color: color,
            introduction_text:
                GORGIAS_CHAT_WIDGET_TEXTS[language].introductionText,
            offline_introduction_text:
                GORGIAS_CHAT_WIDGET_TEXTS[language].offlineIntroductionText,
            avatar_type: GORGIAS_CHAT_WIDGET_AVATAR_TYPE_DEFAULT,
            position: GORGIAS_CHAT_WIDGET_POSITION_DEFAULT,
            avatar: {
                image_type: GorgiasChatAvatarImageType.AGENT_PICTURE,
                name_type: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
            },
            main_font_family: GORGIAS_CHAT_MAIN_FONT_FAMILY_DEFAULT,
            background_color_style: GorgiasChatBackgroundColorStyle.Gradient,
        },
        meta: {
            language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
            languages: GORGIAS_CHAT_WIDGET_LANGUAGES_DEFAULT,
            shop_name: getShopNameFromStoreIntegration(storeIntegration),
            shop_type: storeIntegration.type,
            shop_integration_id: storeIntegration.id,
            preferences: {
                email_capture_enabled:
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
                email_capture_enforcement:
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_DEFAULT,
                auto_responder: {
                    enabled: GORGIAS_CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                    reply: GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
                },
                offline_mode_enabled_datetime:
                    GORGIAS_CHAT_OFFLINE_MODE_ENABLED_DATETIME_DEFAULT,
            },
        },
    }
}

export const ChannelsStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    onNextClick,
    onBackClick,
}) => {
    const {
        setOnboardingData,
        shopName,
        scope,
        emailChannelEnabled,
        emailIntegrationIds,
        chatChannelEnabled,
        chatIntegrationIds,
    } = useOnboardingContext()

    const storeName = shopName || ''
    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(storeName)
    ).toJS()

    const dispatch = useAppDispatch()

    const chatChannels = useSelfServiceChatChannels(
        SHOPIFY_INTEGRATION_TYPE,
        storeName
    )

    const createNewChat = chatChannels.length === 0

    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    )
    const emailChannels = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))
    }, [emailIntegrations])

    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string>()
    const [emailHasError, setEmailHasError] = useState(false)
    const [chatHasError, setChatHasError] = useState(false)
    const [newChatColor, setNewChatColor] = useState<string>(
        GORGIAS_CHAT_DEFAULT_COLOR
    )

    const onNextClickWithValidation = useCallback(() => {
        if (!emailChannelEnabled && !chatChannelEnabled) {
            setErrorMessage('Please select at least one option to continue.')
            return
        }
        setErrorMessage(undefined)

        // no email integrations selected
        if (!!emailChannelEnabled && !emailIntegrationIds) {
            setEmailHasError(true)
            return
        }
        setEmailHasError(false)

        // no chat integrations selected
        if (!!chatChannelEnabled && !createNewChat && !chatIntegrationIds) {
            setChatHasError(true)
            return
        }
        // no chat color selected
        if (!!chatChannelEnabled && createNewChat && !newChatColor) {
            setChatHasError(true)
            return
        }
        setChatHasError(false)

        if (!storeIntegration) {
            return
        }

        if (!!chatChannelEnabled && createNewChat) {
            setIsLoading(true)
            const form = createChatConfiguration(storeIntegration, newChatColor)
            dispatch(createGorgiasChatIntegration(fromJS(form), false))
                .then(() => onNextClick())
                .catch(() =>
                    dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Could not create chat integration',
                        })
                    )
                )
                .finally(() => setIsLoading(false))
        } else {
            onNextClick()
        }
    }, [
        chatChannelEnabled,
        chatIntegrationIds,
        createNewChat,
        dispatch,
        emailChannelEnabled,
        emailIntegrationIds,
        newChatColor,
        onNextClick,
        storeIntegration,
    ])

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClickWithValidation}
                onBackClick={onBackClick}
                isLoading={isLoading}
            >
                <MainTitle
                    titleBlack="Choose which channels to use with "
                    titleMagenta="AI Agent"
                />
                <Separator />

                {errorMessage && (
                    <AIBanner
                        hasError={true}
                        fillStyle="fill"
                        className={css.alert}
                    >
                        {errorMessage}
                    </AIBanner>
                )}

                {scope.includes(AiAgentScopes.SUPPORT) && (
                    <>
                        <Card className={css.card}>
                            <CardContent>
                                <CheckBox
                                    isChecked={emailChannelEnabled}
                                    className={css.checkbox}
                                    onChange={(nextValue) =>
                                        setOnboardingData &&
                                        setOnboardingData({
                                            emailChannelEnabled: nextValue,
                                        })
                                    }
                                >
                                    Email
                                </CheckBox>
                                <p>
                                    Enable your AI Agent to respond to customers
                                    via email.
                                </p>
                                {emailChannelEnabled && (
                                    <>
                                        <Label
                                            isRequired={true}
                                            className={css.label}
                                            id="monitored-email-channels"
                                        >
                                            AI agent will respond to the
                                            following emails
                                        </Label>
                                        <EmailIntegrationListSelection
                                            labelId="monitored-email-channels"
                                            selectedIds={
                                                emailIntegrationIds ?? []
                                            }
                                            onSelectionChange={(
                                                nextSelectedIds
                                            ) =>
                                                setOnboardingData &&
                                                setOnboardingData({
                                                    emailIntegrationIds:
                                                        nextSelectedIds,
                                                })
                                            }
                                            emailItems={emailChannels}
                                            hasError={emailHasError}
                                            isDisabled={false}
                                        />
                                        <a className={css.link}>
                                            Don’t see the email you want? Click
                                            here
                                        </a>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                        <Separator />
                    </>
                )}

                <Card className={css.card}>
                    <CardContent>
                        <CheckBox
                            isChecked={chatChannelEnabled}
                            className={css.checkbox}
                            onChange={(nextValue) =>
                                setOnboardingData &&
                                setOnboardingData({
                                    chatChannelEnabled: nextValue,
                                })
                            }
                        >
                            Chat
                        </CheckBox>
                        <p>
                            Enable your AI Agent to respond to customers via
                            chat.
                        </p>
                        {chatChannelEnabled && (
                            <>
                                {createNewChat ? (
                                    <>
                                        <p>
                                            Personalize your Chat widget to
                                            match your brand’s style and start
                                            connecting with a instantly. Once
                                            the chat is created, you can
                                            customize it further in your
                                            settings.
                                        </p>
                                        <ColorField
                                            value={newChatColor}
                                            onChange={(nextValue) => {
                                                if (
                                                    /^#[0-9A-Fa-f]{0,6}$/.test(
                                                        nextValue
                                                    )
                                                ) {
                                                    setNewChatColor(nextValue)
                                                }
                                            }}
                                            label="Pick you main colour"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <Label
                                            isRequired={true}
                                            className={css.label}
                                            id="monitored-chat-channels"
                                        >
                                            AI Agent responds to tickets sent to
                                            the following Chats
                                        </Label>
                                        <ChatIntegrationListSelection
                                            labelId="monitored-chat-channels"
                                            selectedIds={
                                                chatIntegrationIds ?? []
                                            }
                                            onSelectionChange={(
                                                nextSelectedIds
                                            ) =>
                                                setOnboardingData &&
                                                setOnboardingData({
                                                    chatIntegrationIds:
                                                        nextSelectedIds,
                                                })
                                            }
                                            chatItems={chatChannels}
                                            hasError={chatHasError}
                                            isDisabled={false}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </OnboardingContentContainer>
            <OnboardingPreviewContainer isLoading={false} icon={''}>
                <div className={css.previewContainer}>
                    <div>
                        <ChatIntegrationPreview
                            {...{
                                ...chatPreviewSettings,
                                mainColor: newChatColor,
                            }}
                        >
                            <AiAgentChatConversation
                                {...{
                                    ...agentChatConversationSettings,
                                    conversationColor: newChatColor,
                                }}
                            />
                        </ChatIntegrationPreview>
                    </div>
                </div>
            </OnboardingPreviewContainer>
        </OnboardingBody>
    )
}
