import React, { useMemo, useRef, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { fromJS } from 'immutable'
import { FormProvider, useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'

import { Label } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'
import {
    EMAIL_INTEGRATION_TYPES,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, ShopifyIntegration } from 'models/integration/types'
import { ChatIntegrationListSelection } from 'pages/aiAgent/components/ChatIntegrationListSelection/ChatIntegrationListSelection'
import {
    EmailIntegrationListSelection,
    EmailItem,
} from 'pages/aiAgent/components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import { useGetUsedEmailIntegrations } from 'pages/aiAgent/hooks/useGetUsedEmailIntegrations'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import AiAgentChatConversation from 'pages/aiAgent/Onboarding/components/AiAgentChatConversation/AiAgentChatConversation'
import { Card, CardContent } from 'pages/aiAgent/Onboarding/components/Card'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import { Separator } from 'pages/aiAgent/Onboarding/components/Separator/Separator'
import css from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/ChannelsStep.less'
import {
    ChannelsFormValues,
    useChannelsSchema,
} from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/useChannelsSchema'
import { usePreselectedChat } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedChat'
import { usePreselectedEmails } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/hooks/usePreselectedEmails'
import { createChatConfiguration } from 'pages/aiAgent/Onboarding/components/steps/ChannelsStep/utils/createGorgiasConfiguration'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useGetChatIntegrationColor } from 'pages/aiAgent/Onboarding/hooks/useGetChatIntegrationColor'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'
import { useOnboardingIntegrationRedirection } from 'pages/aiAgent/Onboarding/hooks/useOnboardingIntegrationRedirection'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import { useUpdateOnboarding } from 'pages/aiAgent/Onboarding/hooks/useUpdateOnboarding'
import {
    LoadingPulserIcon,
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import {
    agentChatConversationSettings,
    chatPreviewSettings,
} from 'pages/aiAgent/Onboarding/settings'
import { AiAgentScopes, WizardStepEnum } from 'pages/aiAgent/Onboarding/types'
import useSelfServiceChatChannels, {
    SelfServiceChatChannel,
} from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import CheckBox from 'pages/common/forms/CheckBox'
import ColorField from 'pages/common/forms/ColorField'
import ChatIntegrationPreview from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationPreview/ChatIntegrationPreview'
import { getCurrentDomain } from 'state/currentAccount/selectors'
import { createGorgiasChatIntegration } from 'state/integrations/actions'
import {
    getIntegrationsByTypes,
    getShopifyIntegrationByShopName,
    getShopifyIntegrationsSortedByName,
} from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import EmailIntegrationModal from '../../EmailIntegrationModal/EmailIntegrationModal'

export const emailSortingCallback = (a: EmailItem, b: EmailItem) => {
    if (a.isDisabled && !b.isDisabled) {
        return 1
    }
    if (b.isDisabled && !a.isDisabled) {
        return -1
    }
    if (a.isDefault) {
        return -1
    }
    if (b.isDefault) {
        return 1
    }
    return a.email.localeCompare(b.email)
}

export const chatSortingCallback = (
    a: SelfServiceChatChannel,
    b: SelfServiceChatChannel,
) => {
    if (a.value.isDisabled && !b.value.isDisabled) {
        return 1
    }
    if (b.value.isDisabled && !a.value.isDisabled) {
        return -1
    }
    return a.value.name.localeCompare(b.value.name)
}

export const ChannelsStep: React.FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
    isStoreSelected,
}) => {
    const chatCheckboxRef = useRef<HTMLDivElement | null>(null)
    const chatDropdownRef = useRef<HTMLDivElement | null>(null)
    const chatColorPickerRef = useRef<HTMLDivElement | null>(null)
    const emailCheckboxRef = useRef<HTMLDivElement | null>(null)
    const emailDropdownRef = useRef<HTMLDivElement | null>(null)

    const { shopName } = useParams<{ shopName: string }>()
    const { validSteps } = useSteps({ shopName, isStoreSelected })

    const { data, isLoading: isLoadingOnboardingData } =
        useGetOnboardingData(shopName)

    const { redirectToIntegration, integrationId, integrationType } =
        useOnboardingIntegrationRedirection()

    const {
        mutate: doUpdateOnboardingMutation,
        isLoading: isUpdatingOnboarding,
    } = useUpdateOnboarding()

    const storeIntegration: ShopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName),
    ).toJS()

    const stores = useAppSelector(getShopifyIntegrationsSortedByName)
    const accountDomain = useAppSelector(getCurrentDomain)
    const [redirectionIntegrationId] = useState(integrationId)
    const [redirectionIntegrationType] = useState(integrationType)

    const storesName = useMemo(
        () =>
            stores
                .filter((element) => element.name !== shopName)
                .map((store) => store.name),
        [stores, shopName],
    )

    const { isLoading: isLoadingStoreConfigurations, storeConfigurations } =
        useStoreConfigurationForAccount({
            accountDomain,
            storesName,
        })

    const isLoading =
        isLoadingOnboardingData ||
        isUpdatingOnboarding ||
        isLoadingStoreConfigurations

    const usedEmailIntegrations = useGetUsedEmailIntegrations()
    const usedChatChannels = useMemo(() => {
        return storeConfigurations
            ? storeConfigurations.reduce<number[]>(
                  (acc, element) =>
                      acc.concat(element.monitoredChatIntegrations),
                  [],
              )
            : []
    }, [storeConfigurations])

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()

    const emailIntegrationPath = '/app/settings/channels/email/new'

    const dispatch = useAppDispatch()

    const chatIntegrations = useSelfServiceChatChannels(
        SHOPIFY_INTEGRATION_TYPE,
        shopName,
    )

    const [newChatColor, setNewChatColor] = useState<string>(
        GORGIAS_CHAT_DEFAULT_COLOR,
    )

    const chatChannels: SelfServiceChatChannel[] = useMemo(() => {
        return chatIntegrations.map((channel) => ({
            ...channel,
            value: {
                ...channel.value,
                isDisabled: usedChatChannels.includes(channel.value.id),
            },
        }))
    }, [chatIntegrations, usedChatChannels])

    const createNewChat = chatIntegrations.length === 0

    const schema = useChannelsSchema(createNewChat)

    const getRedirectionEmail = (): undefined | number => {
        switch (redirectionIntegrationType) {
            case IntegrationType.Email:
            case IntegrationType.GorgiasChat:
                return parseInt(redirectionIntegrationId)
            default:
                return undefined
        }
    }

    const preRenderEmails = [
        ...(data?.emailIntegrationIds ?? []),
        getRedirectionEmail(),
    ].filter((entry) => entry !== undefined)

    const preselectedEmails = usePreselectedEmails({
        storeId: storeIntegration.id,
        onboardingEmailIntegrationIds: preRenderEmails as number[],
    })
    const preselectedChats = usePreselectedChat({
        onboardingChatIntegrationIds: data?.chatIntegrationIds,
        chatChannels,
    })

    const methods = useForm<ChannelsFormValues>({
        // Before the next step is visited we always
        // pre-select both the integrations
        values: {
            emailChannelEnabled:
                data?.currentStepName === WizardStepEnum.CHANNELS
                    ? true
                    : !!data?.emailIntegrationIds?.length,
            emailIntegrationIds: preselectedEmails.filter(
                (entry) => !usedEmailIntegrations.includes(entry),
            ),
            chatChannelEnabled:
                data?.currentStepName === WizardStepEnum.CHANNELS
                    ? true
                    : !!data?.chatIntegrationIds?.length,
            chatIntegrationIds: preselectedChats.filter(
                (entry) => !usedChatChannels.includes(entry),
            ),
        },
        mode: 'onChange',
        resolver: zodResolver(schema),
    })

    const {
        watch,
        setValue,
        formState: { errors },
        handleSubmit,
    } = methods

    // Watch form state values
    const emailChannelEnabled = watch('emailChannelEnabled')
    const emailIntegrationIds = watch('emailIntegrationIds')
    const chatChannelEnabled = watch('chatChannelEnabled')
    const chatIntegrationIds = watch('chatIntegrationIds')

    const { mainColor, conversationColor } = useGetChatIntegrationColor({
        shopName,
        chatIntegrationIds,
    })

    const [isCreatingChat, setIsCreatingChat] = useState<boolean>(false)

    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
    )

    const emailChannels = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
            isDefault: integration.meta.preferred,
            isDisabled: usedEmailIntegrations.includes(integration.id),
        }))
    }, [emailIntegrations, usedEmailIntegrations])

    const logChannelViewEvent = (
        updatedField: keyof ChannelsFormValues,
        updatedValue: boolean,
        currentEmailValue: boolean,
        currentChatValue: boolean,
    ) => {
        const newEmailValue =
            updatedField === 'emailChannelEnabled'
                ? updatedValue
                : currentEmailValue
        const newChatValue =
            updatedField === 'chatChannelEnabled'
                ? updatedValue
                : currentChatValue

        let channel: 'email' | 'chat' | 'both' | null = null

        if (newEmailValue && newChatValue) {
            channel = 'both'
        } else if (newEmailValue) {
            channel = 'email'
        } else if (newChatValue) {
            channel = 'chat'
        }

        if (channel) {
            logEvent(SegmentEvent.AiAgentNewOnboardingWizardChannelSelected, {
                channel,
            })
        }
    }

    const handleUpdate = (field: keyof ChannelsFormValues, value: any) => {
        setValue(field, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
        if (field === 'emailChannelEnabled' || field === 'chatChannelEnabled') {
            logChannelViewEvent(
                field,
                value,
                emailChannelEnabled,
                chatChannelEnabled,
            )
        }
    }

    // Handle form submission
    const onNextClickWithValidation = () => {
        if (!!chatChannelEnabled && createNewChat) {
            setIsCreatingChat(true)
            const form = createChatConfiguration(storeIntegration, newChatColor)
            dispatch(createGorgiasChatIntegration(fromJS(form), false, true))
                .then((savedIntegrationId) => {
                    onNextClick(Number(savedIntegrationId))
                })
                .catch(() =>
                    dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Could not create chat integration',
                        }),
                    ),
                )
                .finally(() => setIsCreatingChat(false))
        } else {
            onNextClick()
        }
    }

    const goToNextStep = () => {
        const nextStep = validSteps[currentStep]?.step

        goToStep(nextStep)
    }

    const onNextClick = (savedIntegrationId?: number) => {
        if (data && 'id' in data) {
            const updatedData = {
                ...data,
                currentStepName: WizardStepEnum.PERSONALITY_PREVIEW,
                emailIntegrationIds: emailChannelEnabled
                    ? emailIntegrationIds
                    : [],
                chatIntegrationIds: chatChannelEnabled
                    ? savedIntegrationId
                        ? [...chatIntegrationIds, savedIntegrationId]
                        : chatIntegrationIds
                    : [],
            }

            doUpdateOnboardingMutation(
                { id: data.id as string, data: updatedData },
                {
                    onSuccess: () => {
                        goToNextStep()
                    },
                },
            )
        }
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    const redirectToEmailIntegration = (url: string) => {
        redirectToIntegration(url, IntegrationType.Email)
    }

    const [modalOpen, setModalOpen] = useState(false)

    const renderContent = () => {
        if (isLoading) {
            return <LoadingPulserIcon icon="" />
        }

        return (
            <>
                <EmailIntegrationModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen((prev) => !prev)}
                    redirectToIntegration={redirectToEmailIntegration}
                ></EmailIntegrationModal>
                {(errors.emailChannelEnabled || errors.chatChannelEnabled) && (
                    <AIBanner
                        hasError={true}
                        fillStyle="fill"
                        className={css.alert}
                    >
                        Please select at least one option to continue.
                    </AIBanner>
                )}

                {data?.scopes.includes(AiAgentScopes.SUPPORT) && (
                    <>
                        <Card
                            className={css.card}
                            onClick={({ target }) => {
                                const clickedOnCheckboxOrDropdown =
                                    target instanceof HTMLElement &&
                                    (emailDropdownRef.current?.contains(
                                        target,
                                    ) ||
                                        emailCheckboxRef.current?.contains(
                                            target,
                                        ))

                                if (clickedOnCheckboxOrDropdown) {
                                    return
                                }

                                handleUpdate(
                                    'emailChannelEnabled',
                                    !emailChannelEnabled,
                                )
                            }}
                        >
                            <CardContent>
                                <div ref={emailCheckboxRef}>
                                    <CheckBox
                                        isChecked={emailChannelEnabled}
                                        className={css.checkbox}
                                        onChange={(nextValue) =>
                                            handleUpdate(
                                                'emailChannelEnabled',
                                                nextValue,
                                            )
                                        }
                                    >
                                        Email
                                    </CheckBox>
                                </div>
                                <p>
                                    Enable your AI Agent to respond to customers
                                    via email.
                                </p>
                                {emailChannelEnabled && (
                                    <div ref={emailDropdownRef}>
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
                                                nextSelectedIds,
                                            ) =>
                                                handleUpdate(
                                                    'emailIntegrationIds',
                                                    nextSelectedIds,
                                                )
                                            }
                                            emailItems={emailChannels}
                                            error={
                                                errors.emailIntegrationIds
                                                    ?.message
                                            }
                                            isDisabled={false}
                                            sortingCallback={
                                                emailSortingCallback
                                            }
                                            withDefaultTag
                                        />
                                        <a
                                            // The href is for a11y purposes only
                                            href={emailIntegrationPath}
                                            className={css.link}
                                            onClick={(event) => {
                                                event.preventDefault()
                                                setModalOpen(true)
                                            }}
                                        >
                                            Don’t see the email you want? Click
                                            here
                                        </a>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Separator />
                    </>
                )}

                <Card
                    className={css.card}
                    onClick={({ target }) => {
                        const clickedOnCheckboxOrDropdown =
                            target instanceof HTMLElement &&
                            (chatDropdownRef.current?.contains(target) ||
                                chatCheckboxRef.current?.contains(target) ||
                                chatColorPickerRef.current?.contains(target))

                        if (clickedOnCheckboxOrDropdown) {
                            return
                        }

                        handleUpdate('chatChannelEnabled', !chatChannelEnabled)
                    }}
                >
                    <CardContent>
                        <div ref={chatCheckboxRef}>
                            <CheckBox
                                isChecked={chatChannelEnabled}
                                className={css.checkbox}
                                onChange={(nextValue) =>
                                    handleUpdate(
                                        'chatChannelEnabled',
                                        nextValue,
                                    )
                                }
                            >
                                Chat
                            </CheckBox>
                        </div>
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
                                        <div ref={chatColorPickerRef}>
                                            <ColorField
                                                shouldStopPropagation
                                                value={newChatColor}
                                                onChange={(nextValue) =>
                                                    setNewChatColor(nextValue)
                                                }
                                                label="Pick your main color"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div ref={chatDropdownRef}>
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
                                                nextSelectedIds,
                                            ) =>
                                                handleUpdate(
                                                    'chatIntegrationIds',
                                                    nextSelectedIds,
                                                )
                                            }
                                            chatItems={chatChannels}
                                            error={
                                                errors.chatIntegrationIds
                                                    ?.message
                                            }
                                            isDisabled={false}
                                            sortingCallback={
                                                chatSortingCallback
                                            }
                                            withDisabledText
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </>
        )
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
                        titleBlack="Next, which channels would you like "
                        titleMagenta="to connect"
                    />
                    <Separator />
                    {renderContent()}
                </OnboardingContentContainer>
                <OnboardingPreviewContainer isLoading={false} icon={''}>
                    <div className={css.previewContainer}>
                        <div>
                            <ChatIntegrationPreview
                                {...{
                                    ...chatPreviewSettings,
                                    mainColor: mainColor ?? newChatColor,
                                }}
                            >
                                <AiAgentChatConversation
                                    {...{
                                        ...agentChatConversationSettings,
                                        conversationColor:
                                            conversationColor ?? newChatColor,
                                        removeLinksFromMessages: true,
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
