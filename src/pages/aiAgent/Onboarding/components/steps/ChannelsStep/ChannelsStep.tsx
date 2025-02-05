import {Label} from '@gorgias/merchant-ui-kit'
import {zodResolver} from '@hookform/resolvers/zod'
import {fromJS} from 'immutable'
import React, {useMemo, useState} from 'react'

import {FormProvider, useForm} from 'react-hook-form'

import {GORGIAS_CHAT_DEFAULT_COLOR} from 'config/integrations/gorgias_chat'
import {
    EMAIL_INTEGRATION_TYPES,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {ShopifyIntegration} from 'models/integration/types'
import {ChatIntegrationListSelection} from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import {EmailIntegrationListSelection} from 'pages/aiAgent/components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import {Card, CardContent} from 'pages/aiAgent/Onboarding/components/Card'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import {Separator} from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import css from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep.less'
import {
    ChannelsFormValues,
    useChannelsSchema,
} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/useChannelsSchema'
import {createChatConfiguration} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/utils/createGorgiasConfiguration'
import {StepProps} from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import {
    useGetOnboardingData,
    useUpdateOnboardingCache,
} from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'

import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'

import {AiAgentScopes, WizardStepEnum} from 'pages/aiAgent/Onboarding/types'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import CheckBox from 'pages/common/forms/CheckBox'
import ColorField from 'pages/common/forms/ColorField'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import {createGorgiasChatIntegration} from 'state/integrations/actions'
import {
    getIntegrationsByTypes,
    getShopifyIntegrationByShopName,
} from 'state/integrations/selectors'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export const ChannelsStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    setCurrentStep,
}) => {
    const {data, isLoading} = useGetOnboardingData()
    const updateOnboardingCache = useUpdateOnboardingCache()

    const storeName = data?.shop || ''
    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(storeName)
    ).toJS()

    useCheckStoreIntegration({storeName, isLoading, setCurrentStep})

    const dispatch = useAppDispatch()

    const chatChannels = useSelfServiceChatChannels(
        SHOPIFY_INTEGRATION_TYPE,
        storeName
    )

    const [newChatColor, setNewChatColor] = useState<string>(
        GORGIAS_CHAT_DEFAULT_COLOR
    )

    const {integration} = useShopifyIntegrationAndScope(storeName)

    const createNewChat = chatChannels.length === 0

    const schema = useChannelsSchema(createNewChat)

    const methods = useForm<ChannelsFormValues>({
        values: {
            emailChannelEnabled: data?.emailChannelEnabled ?? false,
            emailIntegrationIds: data?.emailIntegrationIds ?? [],
            chatChannelEnabled: data?.chatChannelEnabled ?? false,
            chatIntegrationIds: data?.chatIntegrationIds ?? [],
        },
        mode: 'onChange',
        resolver: zodResolver(schema),
    })

    const {
        watch,
        setValue,
        formState: {errors},
        handleSubmit,
    } = methods

    // Watch form state values
    const emailChannelEnabled = watch('emailChannelEnabled')
    const emailIntegrationIds = watch('emailIntegrationIds')
    const chatChannelEnabled = watch('chatChannelEnabled')
    const chatIntegrationIds = watch('chatIntegrationIds')

    const [isCreatingChat, setIsCreatingChat] = useState<boolean>(false)

    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    )
    const emailChannels = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))
    }, [emailIntegrations])

    // Handle selection change and update cache
    const handleUpdate = (field: keyof ChannelsFormValues, value: any) => {
        setValue(field, value, {shouldValidate: true})
    }

    // Handle form submission
    const onNextClickWithValidation = () => {
        if (!!chatChannelEnabled && createNewChat) {
            setIsCreatingChat(true)

            const form = createChatConfiguration(storeIntegration, newChatColor)
            dispatch(createGorgiasChatIntegration(fromJS(form), false))
                .then(() => {
                    onNextClick()
                })
                .catch(() =>
                    dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Could not create chat integration',
                        })
                    )
                )
                .finally(() => setIsCreatingChat(false))
        } else {
            onNextClick()
        }
    }

    const updateCacheData = () => {
        updateOnboardingCache('emailChannelEnabled', emailChannelEnabled)
        updateOnboardingCache('emailIntegrationIds', emailIntegrationIds)
        updateOnboardingCache('chatChannelEnabled', chatChannelEnabled)
        updateOnboardingCache('chatIntegrationIds', chatIntegrationIds)
    }

    const onNextClick = () => {
        setCurrentStep?.(WizardStepEnum.PERSONALITY_PREVIEW)
        updateCacheData()
    }

    const onBackClick = () => {
        updateCacheData()
        if (!emailIntegrations) {
            setCurrentStep?.(WizardStepEnum.EMAIL_INTEGRATION)
            return
        }

        if (!integration) {
            setCurrentStep?.(WizardStepEnum.SHOPIFY_INTEGRATION)
            return
        }

        setCurrentStep?.(WizardStepEnum.SKILLSET)
    }

    return (
        <FormProvider {...methods}>
            <OnboardingBody>
                <OnboardingContentContainer
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                    onNextClick={handleSubmit(onNextClickWithValidation)}
                    onBackClick={onBackClick}
                    isLoading={isLoading || isCreatingChat}
                >
                    <MainTitle
                        titleBlack="Choose which channels to use with "
                        titleMagenta="AI Agent"
                    />
                    <Separator />

                    {(errors.emailChannelEnabled ||
                        errors.chatChannelEnabled) && (
                        <AIBanner
                            hasError={true}
                            fillStyle="fill"
                            className={css.alert}
                        >
                            Please select at least one option to continue.
                        </AIBanner>
                    )}

                    {data?.scope.includes(AiAgentScopes.SUPPORT) && (
                        <>
                            <Card className={css.card}>
                                <CardContent>
                                    <CheckBox
                                        isChecked={emailChannelEnabled}
                                        className={css.checkbox}
                                        onChange={(nextValue) =>
                                            handleUpdate(
                                                'emailChannelEnabled',
                                                nextValue
                                            )
                                        }
                                    >
                                        Email
                                    </CheckBox>
                                    <p>
                                        Enable your AI Agent to respond to
                                        customers via email.
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
                                                    handleUpdate(
                                                        'emailIntegrationIds',
                                                        nextSelectedIds
                                                    )
                                                }
                                                emailItems={emailChannels}
                                                hasError={
                                                    !!errors.emailIntegrationIds
                                                }
                                                isDisabled={false}
                                            />
                                            <a className={css.link}>
                                                Don’t see the email you want?
                                                Click here
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
                                    handleUpdate(
                                        'chatChannelEnabled',
                                        nextValue
                                    )
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
                                                match your brand’s style and
                                                start connecting with a
                                                instantly. Once the chat is
                                                created, you can customize it
                                                further in your settings.
                                            </p>
                                            <ColorField
                                                value={newChatColor}
                                                onChange={(nextValue) => {
                                                    setNewChatColor(nextValue)
                                                }}
                                                label="Pick your main color"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <Label
                                                isRequired={true}
                                                className={css.label}
                                                id="monitored-chat-channels"
                                            >
                                                AI Agent responds to tickets
                                                sent to the following Chats
                                            </Label>
                                            <ChatIntegrationListSelection
                                                labelId="monitored-chat-channels"
                                                selectedIds={
                                                    chatIntegrationIds ?? []
                                                }
                                                onSelectionChange={(
                                                    nextSelectedIds
                                                ) =>
                                                    handleUpdate(
                                                        'chatIntegrationIds',
                                                        nextSelectedIds
                                                    )
                                                }
                                                chatItems={chatChannels}
                                                hasError={
                                                    !!errors.chatIntegrationIds
                                                }
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
        </FormProvider>
    )
}
