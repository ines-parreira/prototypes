import type { ComponentProps } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { reportError } from '@repo/logging'
import { history } from '@repo/routing'
import { List } from 'immutable'
import { useParams } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import type { CustomField } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useSearchParam } from 'hooks/useSearchParam'
import type { Tag } from 'models/aiAgent/types'
import type { HelpCenter } from 'models/helpCenter/types'
import { AiAgentConfigurationModal } from 'pages/aiAgent/AiAgentConfigurationView/AiAgentConfigurationModal'
import { TicketPreview } from 'pages/aiAgent/AiAgentOnboardingWizard/TicketPreview'
import { PublicSourcesSection } from 'pages/aiAgent/components//PublicSourcesSection/PublicSourcesSection'
import { AiAgentNameFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/AiAgentNameFormComponent'
import { ChannelsFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ChannelsFormComponent'
import { CustomFieldsFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/CustomFieldsFormComponent'
import { StoreConfigDrawer } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/StoreConfigDrawer'
import { StoreConfigUnsavedChangesPrompt } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/StoreConfigUnsavedChangesPrompt'
import { ToneOfVoiceFormComponent } from 'pages/aiAgent/components/StoreConfigForm/FormComponents/ToneOfVoiceFormComponent'
import { isPreviewModeActivated } from 'pages/aiAgent/components/StoreConfigForm/StoreConfigForm.utils'
import {
    EXCLUDED_TOPIC_MAX_LENGTH,
    INITIAL_FORM_VALUES,
    MAX_EXCLUDED_TOPICS,
    StoreConfigFormSection,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from 'pages/aiAgent/constants'
import { useAccountStoreConfiguration } from 'pages/aiAgent/hooks/useAccountStoreConfiguration'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentOnboardingNotification } from 'pages/aiAgent/hooks/useAiAgentOnboardingNotification'
import useCustomToneOfVoicePreview from 'pages/aiAgent/hooks/useCustomToneOfVoicePreview'
import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { useGetOrCreateSnippetHelpCenter } from 'pages/aiAgent/hooks/useGetOrCreateSnippetHelpCenter'
import { usePublicResources } from 'pages/aiAgent/hooks/usePublicResources'
import { useStoreConfigurationForm } from 'pages/aiAgent/hooks/useStoreConfigurationForm'
import { getFormValuesFromStoreConfiguration } from 'pages/aiAgent/hooks/utils/configurationForm.utils'
import { useAiAgentFormChangesContext } from 'pages/aiAgent/providers/AiAgentFormChangesContext'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import type { FormValues } from 'pages/aiAgent/types'
import { isHandoffEnabled } from 'pages/aiAgent/util'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import UnsavedChangesModal from 'pages/common/components/UnsavedChangesModal'
import ListField from 'pages/common/forms/ListField'
import { HandoverConfigurationDrawer } from 'pages/standalone/components/HandoverConfigurationDrawer'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { TicketTagsFormComponent } from './FormComponents/TicketTagsFormComponent'
import { useVerifyChannelsActivation } from './hooks/useVerifyChannelsActivation'

import css from './StoreConfigForm.less'

const AI_SETTINGS_TICKET_VIEW_MODAL_VIEWED =
    'ai-settings-ticket-view-modal-viewed'

type Props = {
    shopName: string
    shopType: string
    accountDomain: string
    faqHelpCenters: HelpCenter[]
    section?: 'chat' | 'email' | 'sms'
}

export const StoreConfigForm = ({
    shopName,
    accountDomain,
    shopType,
    faqHelpCenters,
    section,
}: Props) => {
    const isFollowUpAiAgentPreviewModeEnabled = useFlag(
        FeatureFlagKey.FollowUpAiAgentPreviewMode,
    )
    const isAiAutofillSectionEnabled = useFlag(
        FeatureFlagKey.AiAgentUsesStoreConfigurationCustomFields,
    )
    const standaloneFFEnabled = useFlag(
        FeatureFlagKey.StandaloneHandoverCapabilities,
    )
    const newToneOfVoiceEnabled = useFlag(FeatureFlagKey.AiAgentToneOfVoice)

    const { tab = 'general' } = useParams<{ tab?: 'channels' }>()
    const shouldDisplayChannelsSection = section ? true : tab === 'channels'
    const shouldDisplayGeneralSections = section ? false : tab === 'general'

    const dispatch = useAppDispatch()

    const [sectionQueryParam, setSectionQueryParam] = useSearchParam('section')

    const [wizardQueryParam] = useSearchParam(WIZARD_POST_COMPLETION_QUERY_KEY)

    const {
        aiAgentTicketViewId,
        aiAgentPreviewTicketViewId,
        accountConfiguration,
    } = useAccountStoreConfiguration({
        storeNames: [shopName],
    })

    const [ticketModalViewed, setTicketModalViewed] = useLocalStorage<string[]>(
        AI_SETTINGS_TICKET_VIEW_MODAL_VIEWED,
        [],
    )

    const [
        isAiAgentConfigurationModalOpen,
        setIsAiAgentConfigurationModalOpen,
    ] = useState(false)

    const knowledgeSectionRef = useRef<HTMLDivElement>(null)
    const emailSectionRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (
            knowledgeSectionRef.current !== null &&
            (sectionQueryParam === 'knowledge' ||
                wizardQueryParam === WIZARD_POST_COMPLETION_STATE.knowledge)
        ) {
            knowledgeSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
        } else if (
            emailSectionRef.current !== null &&
            sectionQueryParam === 'email'
        ) {
            emailSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
        }

        setSectionQueryParam(null)
    }, [
        sectionQueryParam,
        knowledgeSectionRef,
        emailSectionRef,
        setSectionQueryParam,
        wizardQueryParam,
    ])

    const { storeConfiguration, updateStoreConfiguration } =
        useAiAgentStoreConfigurationContext()

    const { setIsFormDirty, setActionCallback } = useAiAgentFormChangesContext()

    const isCreate = storeConfiguration === undefined

    // because this selector is a function which return function we need to memoized it before send to reselect
    const selector = useMemo(
        () => getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
        [],
    )
    const emailIntegrations = useAppSelector(selector)
    const emailItems = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))
    }, [emailIntegrations])

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const defaultFormValues: Partial<FormValues> = useMemo(() => {
        const initialHelpCenter = faqHelpCenters[0]
        const initialEmail = emailItems[0]

        return storeConfiguration
            ? getFormValuesFromStoreConfiguration(storeConfiguration)
            : {
                  ...INITIAL_FORM_VALUES,
                  monitoredEmailIntegrations: [initialEmail],
                  helpCenterId: initialHelpCenter?.id ?? null,
              }
    }, [emailItems, faqHelpCenters, storeConfiguration])

    const {
        handleOnSave,
        formValues,
        isFormDirty,
        resetForm,
        updateValue,
        isPendingCreateOrUpdate,
        isChatChannelEnabled,
        isEmailChannelEnabled,
        isSmsChannelEnabled,
    } = useStoreConfigurationForm(shopName, shopType, faqHelpCenters)

    const { data: { data: accountCustomFields = [] } = {} } =
        useCustomFieldDefinitions({
            archived: false,
            object_type: OBJECT_TYPES.TICKET,
        })

    const availableCustomFields = accountCustomFields.filter(
        (field: CustomField) => formValues.customFieldIds?.includes(field.id),
    )

    const { updateSettingsAfterAiAgentEnabled } = useAiAgentEnabled({
        monitoredEmailIntegrations: formValues.monitoredEmailIntegrations ?? [],
        monitoredChatIntegrations: formValues.monitoredChatIntegrations ?? [],
        isEnablingChatChannel:
            Boolean(defaultFormValues.chatChannelDeactivatedDatetime) &&
            !formValues.chatChannelDeactivatedDatetime,
        isEnablingEmailChannel:
            Boolean(defaultFormValues.emailChannelDeactivatedDatetime) &&
            formValues.emailChannelDeactivatedDatetime === null,
    })

    const {
        latestCustomToneOfVoicePreview,
        onGenerateCustomToneOfVoicePreview,
        isLoading: isCustomToneOfVoicePreviewLoading,
        isError,
    } = useCustomToneOfVoicePreview({
        customToneOfVoice: formValues.customToneOfVoiceGuidance ?? '',
        shopName,
    })

    const aiAgentMode = useMemo(() => {
        const isTrialMode =
            !!storeConfiguration &&
            isPreviewModeActivated({
                isPreviewModeActive: storeConfiguration.isPreviewModeActive,
                emailChannelDeactivatedDatetime:
                    formValues?.emailChannelDeactivatedDatetime,
                chatChannelDeactivatedDatetime:
                    formValues?.chatChannelDeactivatedDatetime,
                previewModeValidUntilDatetime:
                    formValues?.previewModeValidUntilDatetime,
            })

        if (isTrialMode) {
            return 'trial'
        }

        if (isEmailChannelEnabled || isChatChannelEnabled) {
            return 'enabled'
        }

        return 'disabled'
    }, [
        storeConfiguration,
        formValues,
        isEmailChannelEnabled,
        isChatChannelEnabled,
    ])

    const deactivateAiAgent = useCallback(
        async (silentUpdate?: boolean) => {
            if (isCreate) return

            const deactivatedDatetime = new Date().toISOString()
            updateValue('emailChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('chatChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('previewModeActivatedDatetime', null)
            updateValue('previewModeValidUntilDatetime', null)

            try {
                await updateStoreConfiguration({
                    ...storeConfiguration,
                    chatChannelDeactivatedDatetime: deactivatedDatetime,
                    emailChannelDeactivatedDatetime: deactivatedDatetime,
                    previewModeActivatedDatetime: null,
                    previewModeValidUntilDatetime: null,
                })

                if (!silentUpdate) {
                    void dispatch(
                        notify({
                            message:
                                'AI Agent has been disabled, because no Knowledge source is connected.',
                            status: NotificationStatus.Warning,
                        }),
                    )
                }
            } catch (error) {
                // nothing to notify here for the user as we do silent disable AI Agent
                reportError(error, {
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context: 'Error during disabling AI Agent',
                    },
                })
            }
        },
        [
            isCreate,
            updateValue,
            updateStoreConfiguration,
            storeConfiguration,
            dispatch,
        ],
    )

    useVerifyChannelsActivation({
        chatChannels,
        emailItems,
        storeConfiguration,
        updateStoreConfiguration,
        updateValue,
    })

    const [isHandoverDrawerOpen, setIsHandoverDrawerOpen] = useState(false)

    const isHandoffToggled = isHandoffEnabled(
        formValues.silentHandover !== null
            ? formValues.silentHandover
            : INITIAL_FORM_VALUES.silentHandover,
    )

    const { helpCenter: snippetHelpCenter } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    const { sourceItems } = usePublicResources({
        helpCenterId: snippetHelpCenter?.id,
    })

    const { ingestedFiles } = useFileIngestion({
        helpCenterId: snippetHelpCenter?.id ?? 0,
    })

    const externalKnowledgeSources = useMemo(
        () => ({
            publicUrls: sourceItems
                ?.filter((source) => source.status !== 'error')
                .map((source) => source.url)
                .filter((url): url is string => !!url),
            hasExternalFiles:
                ingestedFiles?.some(
                    (ingestedFile) => ingestedFile.status === 'SUCCESSFUL',
                ) ?? false,
        }),
        [sourceItems, ingestedFiles],
    )

    const shouldDisplayAiAgentConfigurationModal = useMemo(() => {
        const hasViewedModal = ticketModalViewed?.includes(shopName)
        const isAiAgentDeactivated =
            storeConfiguration?.emailChannelDeactivatedDatetime !== null &&
            storeConfiguration?.chatChannelDeactivatedDatetime !== null
        const isFormPendingActivation =
            formValues.emailChannelDeactivatedDatetime === null ||
            formValues.chatChannelDeactivatedDatetime === null

        return (
            !hasViewedModal && isFormPendingActivation && isAiAgentDeactivated
        )
    }, [
        formValues.chatChannelDeactivatedDatetime,
        formValues.emailChannelDeactivatedDatetime,
        shopName,
        storeConfiguration?.chatChannelDeactivatedDatetime,
        storeConfiguration?.emailChannelDeactivatedDatetime,
        ticketModalViewed,
    ])

    const {
        isLoading: isLoadingOnboardingNotificationState,
        handleOnCancelActivateAiAgentNotification,
    } = useAiAgentOnboardingNotification({ shopName })

    const isAiAgentWasEnabledForChat = useMemo(
        () =>
            storeConfiguration?.chatChannelDeactivatedDatetime !== null &&
            formValues.chatChannelDeactivatedDatetime === null,
        [
            storeConfiguration?.chatChannelDeactivatedDatetime,
            formValues.chatChannelDeactivatedDatetime,
        ],
    )

    const isAiAgentWasEnabledForEmail = useMemo(
        () =>
            storeConfiguration?.emailChannelDeactivatedDatetime !== null &&
            formValues.emailChannelDeactivatedDatetime === null,
        [
            storeConfiguration?.emailChannelDeactivatedDatetime,
            formValues.emailChannelDeactivatedDatetime,
        ],
    )

    const onSubmit = useCallback(() => {
        const shouldCancelActivateNotification =
            isAiAgentWasEnabledForChat || isAiAgentWasEnabledForEmail

        if (shouldCancelActivateNotification) {
            handleOnCancelActivateAiAgentNotification()
        }

        const shouldUpdateSettingsAfterAiAgentEnabled =
            isAiAgentWasEnabledForChat || isAiAgentWasEnabledForEmail

        void handleOnSave({
            publicUrls: externalKnowledgeSources.publicUrls,
            hasExternalFiles: externalKnowledgeSources.hasExternalFiles,
            shopName,
            aiAgentMode,
            silentNotification:
                shouldUpdateSettingsAfterAiAgentEnabled ||
                shouldDisplayAiAgentConfigurationModal,
            onSuccess: () => {
                if (shouldUpdateSettingsAfterAiAgentEnabled) {
                    updateSettingsAfterAiAgentEnabled()
                }

                if (
                    shouldDisplayAiAgentConfigurationModal &&
                    aiAgentTicketViewId
                ) {
                    setIsAiAgentConfigurationModalOpen(true)
                    setTicketModalViewed([
                        ...(ticketModalViewed ?? []),
                        shopName,
                    ])
                }

                setIsDrawerOpen(false)
            },
        })

        setIsDrawerDirty(false)
    }, [
        isAiAgentWasEnabledForChat,
        isAiAgentWasEnabledForEmail,
        handleOnCancelActivateAiAgentNotification,
        externalKnowledgeSources,
        shopName,
        aiAgentMode,
        shouldDisplayAiAgentConfigurationModal,
        handleOnSave,
        updateSettingsAfterAiAgentEnabled,
        aiAgentTicketViewId,
        setIsAiAgentConfigurationModalOpen,
        setTicketModalViewed,
        ticketModalViewed,
    ])

    useEffect(() => {
        // Used as protection for the case when we disable AI agent feature flag Can be removed after the feature flag is removed
        let isAIAgentDeactivationRequired
        if (isFollowUpAiAgentPreviewModeEnabled) {
            // if preview mode is on we want to deactivate AI Agent only for users that are not migrated to preview mode
            isAIAgentDeactivationRequired =
                !formValues.previewModeValidUntilDatetime
        } else {
            isAIAgentDeactivationRequired = true
        }
        if (aiAgentMode === 'trial' && isAIAgentDeactivationRequired) {
            void deactivateAiAgent(true)
        }
    }, [
        aiAgentMode,
        deactivateAiAgent,
        formValues.previewModeActivatedDatetime,
        isFollowUpAiAgentPreviewModeEnabled,
        formValues.previewModeValidUntilDatetime,
    ])

    const shouldDisablePreviewMode = useMemo(() => {
        if (formValues.previewModeActivatedDatetime === null) {
            return false
        }
        if (
            (storeConfiguration?.emailChannelDeactivatedDatetime !== null ||
                storeConfiguration?.chatChannelDeactivatedDatetime !== null) &&
            (formValues.emailChannelDeactivatedDatetime === null ||
                formValues.chatChannelDeactivatedDatetime === null)
        ) {
            return true
        }

        return false
    }, [storeConfiguration, formValues])

    useEffect(() => {
        if (shouldDisablePreviewMode) {
            updateValue('previewModeActivatedDatetime', null)
            updateValue('previewModeValidUntilDatetime', null)
        }
    }, [shouldDisablePreviewMode, updateValue])

    const onCloseAiAgentConfigurationModal = () => {
        setIsAiAgentConfigurationModalOpen(false)
    }

    const onShowMeAiAgentConfigurationModal = () => {
        setIsAiAgentConfigurationModalOpen(false)
        if (aiAgentTicketViewId) {
            history.push(`/app/views/${aiAgentTicketViewId}`, {
                skipRedirect: true,
            })
        }
    }

    useEffect(() => {
        setIsFormDirty(
            tab === 'general'
                ? StoreConfigFormSection.generalSettings
                : StoreConfigFormSection.channelSettings,
            isFormDirty,
        )
    }, [isFormDirty, setIsFormDirty, tab])

    useEffect(() => {
        setActionCallback(
            tab === 'general'
                ? StoreConfigFormSection.generalSettings
                : StoreConfigFormSection.channelSettings,
            {
                onSave: onSubmit,
                onDiscard: resetForm,
            },
        )
    }, [setActionCallback, onSubmit, resetForm, tab])

    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [activeDrawerContent, setActiveDrawerContent] = useState<
        'tags' | 'customFieldIds' | 'excludedTopics'
    >('tags')
    const [activeDrawerValues, setActiveDrawerValues] = useState<{
        tags: Tag[]
        customFieldIds: number[]
        excludedTopics: string[]
    }>({
        tags: formValues.tags ?? [],
        customFieldIds: formValues.customFieldIds ?? [],
        excludedTopics: formValues.excludedTopics ?? [],
    })
    const [isDrawerDirty, setIsDrawerDirty] = useState(false)

    useEffect(() => {
        setActiveDrawerValues({
            tags: formValues.tags ?? [],
            customFieldIds: formValues.customFieldIds ?? [],
            excludedTopics: formValues.excludedTopics ?? [],
        })
    }, [formValues.tags, formValues.customFieldIds, formValues.excludedTopics])

    const onSaveDrawer = async () => {
        const updatedFormValues = {
            ...formValues,
            [activeDrawerContent]: activeDrawerValues[activeDrawerContent],
        }
        Object.assign(formValues, updatedFormValues)
        updateValue(
            activeDrawerContent,
            activeDrawerValues[activeDrawerContent],
        )
        setIsFormDirty(StoreConfigFormSection.generalSettings, false)
        onSubmit()
    }

    const onCloseDrawer = () => {
        if (
            JSON.stringify(formValues[activeDrawerContent]) !==
            JSON.stringify(activeDrawerValues[activeDrawerContent])
        ) {
            setIsDrawerDirty(true)
        } else {
            setIsDrawerOpen(false)
        }
    }

    const onDiscardUnsavedChanges = () => {
        setActiveDrawerValues({
            ...activeDrawerValues,
            [activeDrawerContent]: formValues[activeDrawerContent] ?? [],
        })
        setIsDrawerOpen(false)
        setIsDrawerDirty(false)
        setIsFormDirty(StoreConfigFormSection.generalSettings, false)
    }

    const drawerContent = {
        tags: {
            content: (
                <TicketTagsFormComponent
                    tags={activeDrawerValues.tags ?? []}
                    updateValue={(key, value) => {
                        setActiveDrawerValues({
                            ...activeDrawerValues,
                            [key]: value,
                        })
                        setIsFormDirty(
                            StoreConfigFormSection.generalSettings,
                            true,
                        )
                    }}
                />
            ),
            title: 'Tags',
            values: formValues.tags,
        },
        customFieldIds: {
            content: (
                <CustomFieldsFormComponent
                    data-testid="ai-agent-store-configuration-custom-fields-form-component"
                    updateValue={(key, value) => {
                        setActiveDrawerValues({
                            ...activeDrawerValues,
                            [key]: value,
                        })
                        setIsFormDirty(
                            StoreConfigFormSection.generalSettings,
                            true,
                        )
                    }}
                    customFieldIds={activeDrawerValues.customFieldIds}
                    isStoreCreated={!isCreate}
                />
            ),
            title: 'Ticket Fields',
            values: formValues.customFieldIds,
        },
        excludedTopics: {
            content: (
                <div>
                    Define topics for AI Agent to always hand over to agents. We
                    recommend limiting it to 5 or less.{' '}
                    <a
                        href="https://docs.gorgias.com/en-US/customize-how-ai-agent-behaves-567324"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more about handovers.
                    </a>
                    <ListField
                        className={css.container}
                        items={List(activeDrawerValues.excludedTopics)}
                        onChange={(excludedTopics: List<string>) => {
                            setActiveDrawerValues({
                                ...activeDrawerValues,
                                excludedTopics: excludedTopics.toJS(),
                            })
                            setIsFormDirty(
                                StoreConfigFormSection.generalSettings,
                                true,
                            )
                        }}
                        placeholder="e.g. Legal inquiry"
                        maxLength={EXCLUDED_TOPIC_MAX_LENGTH}
                        maxItems={MAX_EXCLUDED_TOPICS}
                        addLabel="Add Topic"
                        dataCanduId="ai-agent-configuration-handover-topics"
                    />
                </div>
            ),
            title: 'Handover Topics',
            values: formValues.excludedTopics,
        },
    }

    return (
        <>
            <StoreConfigUnsavedChangesPrompt />
            <UnsavedChangesModal
                onDiscard={onDiscardUnsavedChanges}
                isOpen={isDrawerDirty}
                onClose={() => setIsDrawerDirty(false)}
                onSave={onSaveDrawer}
            />
            <div className={css.storeConfigSettings}>
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className={css.automateView}
                >
                    {shouldDisplayGeneralSections && (
                        <>
                            <section className={css.section}>
                                <AiAgentNameFormComponent
                                    agentsName={
                                        accountConfiguration?.conversationBot
                                            ?.name
                                    }
                                    agentsUserId={
                                        accountConfiguration?.conversationBot
                                            ?.id
                                    }
                                />
                                <ToneOfVoiceFormComponent
                                    toneOfVoice={formValues.toneOfVoice}
                                    customToneOfVoiceGuidance={
                                        formValues.customToneOfVoiceGuidance
                                    }
                                    updateValue={updateValue}
                                    storeConfiguration={storeConfiguration}
                                    aiAgentMode={aiAgentMode}
                                    aiAgentPreviewTicketViewId={
                                        aiAgentPreviewTicketViewId
                                    }
                                    setIsPristine={(isPristine) =>
                                        setIsFormDirty(
                                            'generalSettings',
                                            !isPristine,
                                        )
                                    }
                                    aiAgentLanguage={formValues.aiAgentLanguage}
                                />
                            </section>
                        </>
                    )}

                    {shouldDisplayChannelsSection && (
                        <ChannelsFormComponent
                            shopName={shopName}
                            shopType={shopType}
                            updateValue={updateValue}
                            monitoredChatIntegrations={
                                formValues.monitoredChatIntegrations
                            }
                            isChatChannelEnabled={isChatChannelEnabled}
                            chatChannelDeactivatedDatetime={
                                formValues.chatChannelDeactivatedDatetime
                            }
                            updateChatChannelDeactivatedDatetime={(
                                deactivatedDatetime,
                            ) => {
                                updateValue(
                                    'chatChannelDeactivatedDatetime',
                                    deactivatedDatetime,
                                )
                            }}
                            signature={formValues.signature}
                            useEmailIntegrationSignature={
                                formValues.useEmailIntegrationSignature
                            }
                            monitoredEmailIntegrations={
                                formValues.monitoredEmailIntegrations
                            }
                            isEmailChannelEnabled={isEmailChannelEnabled}
                            emailChannelDeactivatedDatetime={
                                formValues.emailChannelDeactivatedDatetime
                            }
                            updateEmailChannelDeactivatedDatetime={(
                                deactivatedDatetime,
                            ) => {
                                updateValue(
                                    'emailChannelDeactivatedDatetime',
                                    deactivatedDatetime,
                                )
                            }}
                            setIsFormDirty={setIsFormDirty}
                            monitoredSmsIntegrations={
                                formValues.monitoredSmsIntegrations
                            }
                            smsDisclaimer={formValues.smsDisclaimer}
                            isSmsChannelEnabled={isSmsChannelEnabled}
                            smsChannelDeactivatedDatetime={
                                formValues.smsChannelDeactivatedDatetime
                            }
                            updateSmsChannelDeactivatedDatetime={(
                                deactivatedDatetime,
                            ) => {
                                updateValue(
                                    'smsChannelDeactivatedDatetime',
                                    deactivatedDatetime,
                                )
                            }}
                            section={section}
                        />
                    )}

                    {shouldDisplayGeneralSections && (
                        <>
                            <section className={css.section}>
                                <SettingsCard>
                                    <SettingsCardHeader>
                                        <SettingsCardTitle>
                                            AI ticket tagging
                                        </SettingsCardTitle>
                                        <p>
                                            Tags and Ticket Fields selected will
                                            be filled out automatically by AI
                                            Agent, helping categorize and
                                            prioritize tickets with less manual
                                            work.
                                        </p>
                                    </SettingsCardHeader>
                                    <SettingsCardContent>
                                        <SettingsFeatureRow
                                            title="Tags"
                                            description="Provide quick instructions in
                                                    everyday speech, and let AI Agent
                                                    handle the rest, saving you time and
                                                    ensuring consistent categorization."
                                            nbFeatures={
                                                formValues.tags?.length ?? 0
                                            }
                                            badgeText={
                                                formValues.tags?.length === 0
                                                    ? 'No tags'
                                                    : `${formValues.tags?.length} tags`
                                            }
                                            onClick={() => {
                                                setIsDrawerOpen(true)
                                                setActiveDrawerContent('tags')
                                            }}
                                        />
                                        {isAiAutofillSectionEnabled && (
                                            <SettingsFeatureRow
                                                title="Ticket Fields"
                                                description="Ticket Fields selected will be
                                                        filled out automatically by AI Agent,
                                                        helping categorize and prioritize
                                                        tickets with less manual work."
                                                nbFeatures={
                                                    availableCustomFields?.length ??
                                                    0
                                                }
                                                badgeText={
                                                    !availableCustomFields?.length
                                                        ? 'No ticket fields'
                                                        : `${availableCustomFields?.length} ticket fields`
                                                }
                                                onClick={() => {
                                                    setIsDrawerOpen(true)
                                                    setActiveDrawerContent(
                                                        'customFieldIds',
                                                    )
                                                }}
                                            />
                                        )}
                                    </SettingsCardContent>
                                </SettingsCard>
                            </section>
                            <section>
                                <SettingsCard>
                                    <SettingsCardHeader>
                                        <SettingsCardTitle>
                                            Handover and exclusion
                                        </SettingsCardTitle>
                                        <p>
                                            When AI Agent is not confident in an
                                            answer, it automatically hands
                                            tickets over to your team. Choose
                                            how AI Agent behaves when handing
                                            over tickets, and add specific{' '}
                                            <a
                                                href="#"
                                                onClick={() => {
                                                    setIsDrawerOpen(true)
                                                    setActiveDrawerContent(
                                                        'excludedTopics',
                                                    )
                                                }}
                                            >
                                                handover topics
                                            </a>{' '}
                                            that should never be resolved by AI
                                            Agent.
                                        </p>
                                    </SettingsCardHeader>
                                    <SettingsCardContent>
                                        <SettingsFeatureRow
                                            title="Tell customers when handing over"
                                            description="When enabled, AI Agent will promptly respond and tell customers their request is being handed over for further assistance. When disabled, AI Agent will not respond before handing over."
                                            type="toggle"
                                            isChecked={isHandoffToggled}
                                            onChange={(value) => {
                                                updateValue(
                                                    'silentHandover',
                                                    !value,
                                                )
                                            }}
                                            toggleName="toggle-ai-agent-handover"
                                        />
                                        {standaloneFFEnabled && (
                                            <SettingsFeatureRow
                                                title="Handover method"
                                                description="Choose the method for which AI Agent will handover tickets."
                                                badgeText={
                                                    formValues.handoverMethod ??
                                                    undefined
                                                }
                                                nbFeatures={1}
                                                onClick={() =>
                                                    setIsHandoverDrawerOpen(
                                                        true,
                                                    )
                                                }
                                            />
                                        )}
                                        <SettingsFeatureRow
                                            title="Prevent AI Agent from answering specific tickets"
                                            description="Configure the Prevent AI Agent from answering rule
                                                                    to prevent AI Agent from reviewing
                                                                    specific tickets altogether. (e.g.
                                                                    tickets from certain email addresses,
                                                                    tickets with certain tags)."
                                            type="link"
                                            link="/app/settings/rules/library?auto-tag-ai-ignore"
                                        />
                                    </SettingsCardContent>
                                </SettingsCard>
                            </section>
                        </>
                    )}

                    <section>
                        <Button
                            onClick={onSubmit}
                            isDisabled={
                                isPendingCreateOrUpdate ||
                                isLoadingOnboardingNotificationState
                            }
                            className="mb-3"
                        >
                            Save Changes
                        </Button>
                        <p className={css.legalDisclaimer}>
                            By using AI Agent, you agree to comply with all
                            applicable laws, including, but not limited to, laws
                            prohibiting misleading consumers about the
                            artificial identity of an automated online account,
                            such as the California Bolstering Online
                            Transparency Act.
                        </p>
                    </section>
                </form>
                {shouldDisplayGeneralSections && !newToneOfVoiceEnabled && (
                    <div className={css.ticketPreviewContainer}>
                        <TicketPreview
                            toneOfVoice={formValues.toneOfVoice}
                            signature={formValues.signature}
                            aiAgentName={
                                accountConfiguration?.conversationBot?.name
                            }
                            customToneOfVoiceGuidance={
                                formValues.customToneOfVoiceGuidance
                            }
                            customToneOfVoicePreview={
                                latestCustomToneOfVoicePreview
                            }
                            isLoadingCustomToneOfVoicePreview={
                                isCustomToneOfVoicePreviewLoading
                            }
                            onGenerateCustomToneOfVoicePreview={
                                onGenerateCustomToneOfVoicePreview
                            }
                            isError={isError}
                        />
                    </div>
                )}
            </div>
            <StoreConfigDrawer
                title={drawerContent[activeDrawerContent].title}
                open={isDrawerOpen}
                onSave={onSaveDrawer}
                onClose={onDiscardUnsavedChanges}
                onBackdropClick={onCloseDrawer}
                isLoading={
                    isPendingCreateOrUpdate ||
                    isLoadingOnboardingNotificationState
                }
            >
                {drawerContent[activeDrawerContent].content}
            </StoreConfigDrawer>
            <AiAgentConfigurationModal
                isOpen={isAiAgentConfigurationModalOpen}
                onClose={onCloseAiAgentConfigurationModal}
                onShowMe={onShowMeAiAgentConfigurationModal}
            />
            <HandoverConfigurationDrawer
                isOpen={isHandoverDrawerOpen}
                onClose={() => setIsHandoverDrawerOpen(false)}
                shopName={shopName}
                shopType={shopType}
                faqHelpcenters={faqHelpCenters}
            />
        </>
    )
}

export const CreatePublicSourcesSection = ({
    onPublicURLsChanged,
    ...props
}: ComponentProps<typeof PublicSourcesSection>) => {
    const { sourceItems } = usePublicResources({
        helpCenterId: props.helpCenterId,
    })

    useEffect(() => {
        if (sourceItems) {
            const publicURLs = sourceItems
                ?.filter((source) => source.status !== 'error')
                .map((source) => source.url)
                .filter((url): url is string => !!url)

            onPublicURLsChanged(publicURLs)
        }
    }, [onPublicURLsChanged, sourceItems])

    return (
        <PublicSourcesSection
            {...props}
            sourceItems={sourceItems}
            onPublicURLsChanged={onPublicURLsChanged}
        />
    )
}
