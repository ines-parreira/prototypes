// External Libraries
import {useId} from '@floating-ui/react'
import {Label} from '@gorgias/merchant-ui-kit'
import {List} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import {Link, useParams} from 'react-router-dom'

// Absolute Imports
import {AiAgentNotificationType} from 'automate/notifications/types'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {FeatureFlagKey} from 'config/featureFlags'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import {useSearchParam} from 'hooks/useSearchParam'
import {
    AiAgentOnboardingState,
    OnboardingNotificationState,
    Tag,
} from 'models/aiAgent/types'
import {HelpCenter} from 'models/helpCenter/types'
import {useStoreConfigurationForm} from 'pages/aiAgent/hooks/useStoreConfigurationForm'
import {getFormValuesFromStoreConfiguration} from 'pages/aiAgent/hooks/utils/configurationForm.utils'
import {FormValues} from 'pages/aiAgent/types'
import HelpCenterSelect, {
    EMPTY_HELP_CENTER_ID,
} from 'pages/automate/common/components/HelpCenterSelect'
import Button from 'pages/common/components/button/Button'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import ListField from 'pages/common/forms/ListField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import history from 'pages/history'
import {getIntegrationsByTypes} from 'state/integrations/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'

// Relative Imports

import {AiAgentConfigurationModal} from '../../AiAgentConfigurationView/AiAgentConfigurationModal'
import PostCompletionWizardModal from '../../AiAgentOnboardingWizard/PostCompletionWizardModal'
import {TicketPreview} from '../../AiAgentOnboardingWizard/TicketPreview'
import {
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    INITIAL_FORM_VALUES,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../../constants'
import {useAccountStoreConfiguration} from '../../hooks/useAccountStoreConfiguration'
import {useAiAgentEnabled} from '../../hooks/useAiAgentEnabled'
import {useAiAgentOnboardingNotification} from '../../hooks/useAiAgentOnboardingNotification'
import useCustomToneOfVoicePreview from '../../hooks/useCustomToneOfVoicePreview'
import {useFileIngestion} from '../../hooks/useFileIngestion'
import {useGetOrCreateSnippetHelpCenter} from '../../hooks/useGetOrCreateSnippetHelpCenter'
import {usePublicResources} from '../../hooks/usePublicResources'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'

import {isHandoffEnabled} from '../../util'
import {AIAgentIntroduction} from '../AIAgentIntroduction/AIAgentIntroduction'
import {AiAgentPreviewModeSection} from '../AIAgentPreviewModeSection/AiAgentPreviewModeSection'
import {ConfigurationSection} from '../ConfigurationSection/ConfigurationSection'
import {PublicSourcesSection} from '../PublicSourcesSection/PublicSourcesSection'
import TagList from '../TicketTag/TagList'

import {ChannelsFormComponent} from './FormComponents/ChannelsFormComponent'
import {ToneOfVoiceFormComponent} from './FormComponents/ToneOfVoiceFormComponent'
import css from './StoreConfigForm.less'
import {isPreviewModeActivated} from './StoreConfigForm.utils'

const AI_SETTINGS_TICKET_VIEW_MODAL_VIEWED =
    'ai-settings-ticket-view-modal-viewed'

type Props = {
    shopName: string
    shopType: string
    accountDomain: string
    faqHelpCenters: HelpCenter[]
}

export const StoreConfigForm = ({
    shopName,
    accountDomain,
    shopType,
    faqHelpCenters,
}: Props) => {
    const flags = useFlags()
    const trialModeAvailable = flags[FeatureFlagKey.AiAgentTrialMode]
    const isAiAgentOnboardingWizardEnabled =
        flags[FeatureFlagKey.AiAgentOnboardingWizard]
    const isFollowUpAiAgentPreviewModeEnabled =
        flags[FeatureFlagKey.FollowUpAiAgentPreviewMode]
    const isAiAgentKnowledgeTabEnabled =
        flags[FeatureFlagKey.AiAgentKnowledgeTab]
    const isStandaloneMenuEnabled = flags[FeatureFlagKey.ConvAiStandaloneMenu]

    // Because this component is heavy and difficult to rework
    // Standalone team decided to add the capability to show/hide some sections based on the current route (tab param)
    const {tab = 'general'} = useParams<{tab?: 'channels'}>()
    // Standalone menu feature flag is used to detect if we need to use the old settings page (all in one settings) or
    // the new one (separated tabs for general and channels settings)
    // On "old" settings page, we display all sections
    // On "new" general settings page, we hide channels section and display the rest
    // On "new" channels settings page, we hide general sections and display channels section
    const shouldDisplayOldSettingsPage = !isStandaloneMenuEnabled
    const shouldDisplayChannelsSection =
        shouldDisplayOldSettingsPage || tab === 'channels'
    const shouldDisplayGeneralSections =
        shouldDisplayOldSettingsPage || tab === 'general'

    const dispatch = useAppDispatch()

    const [isUrlSyncSuccess, setIsUrlSyncSuccess] = useState(false)
    const [isUrlSyncFail, setIsUrlSyncFail] = useState(false)

    const [sectionQueryParam, setSectionQueryParam] = useSearchParam('section')
    const [wizardQueryParam, setWizardQueryParam] = useSearchParam(
        WIZARD_POST_COMPLETION_QUERY_KEY
    )

    const {aiAgentTicketViewId, aiAgentPreviewTicketViewId} =
        useAccountStoreConfiguration({
            storeNames: [shopName],
        })

    const [ticketModalViewed, setTicketModalViewed] = useLocalStorage<string[]>(
        AI_SETTINGS_TICKET_VIEW_MODAL_VIEWED,
        []
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
            knowledgeSectionRef.current?.scrollIntoView({behavior: 'smooth'})
        } else if (
            emailSectionRef.current !== null &&
            sectionQueryParam === 'email'
        ) {
            emailSectionRef.current?.scrollIntoView({behavior: 'smooth'})
        }

        setSectionQueryParam(null)
    }, [
        sectionQueryParam,
        knowledgeSectionRef,
        emailSectionRef,
        setSectionQueryParam,
        wizardQueryParam,
    ])

    useEffect(() => {
        if (
            wizardQueryParam === WIZARD_POST_COMPLETION_STATE.knowledge &&
            (isUrlSyncSuccess || isUrlSyncFail)
        ) {
            if (isUrlSyncSuccess) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'URL sources have successfully synced.',
                        showDismissButton: true,
                    })
                )
            } else {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message:
                            'One or more URL sources for AI Agent failed to sync. Review URLs and try again.',
                        showDismissButton: true,
                    })
                )
            }
            setWizardQueryParam(null)
        }
    }, [
        dispatch,
        isUrlSyncFail,
        isUrlSyncSuccess,
        setWizardQueryParam,
        wizardQueryParam,
    ])

    const {storeConfiguration, updateStoreConfiguration} =
        useAiAgentStoreConfigurationContext()
    const isCreate = storeConfiguration === undefined

    // because this selector is a function which return function we need to memoized it before send to reselect
    const selector = useMemo(
        () => getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES),
        []
    )
    const emailIntegrations = useAppSelector(selector)
    const emailItems = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))
    }, [emailIntegrations])

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
    } = useStoreConfigurationForm(shopName, faqHelpCenters)

    const {updateSettingsAfterAiAgentEnabled} = useAiAgentEnabled({
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

    const toggleHandoffId = `toggle-handoff-${useId()}`

    const aiAgentMode = useMemo(() => {
        const isTrialMode =
            !!storeConfiguration &&
            isPreviewModeActivated({
                isPreviewModeActive: storeConfiguration.isPreviewModeActive,
                deactivatedDatetime: formValues?.deactivatedDatetime,
                emailChannelDeactivatedDatetime:
                    formValues?.emailChannelDeactivatedDatetime,
                chatChannelDeactivatedDatetime:
                    formValues?.chatChannelDeactivatedDatetime,
                trialModeActivatedDatetime:
                    formValues?.trialModeActivatedDatetime,
                previewModeValidUntilDatetime:
                    formValues?.previewModeValidUntilDatetime,
                isTrialModeAvailable: trialModeAvailable,
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
        trialModeAvailable,
        isEmailChannelEnabled,
        isChatChannelEnabled,
    ])

    const deactivateAiAgent = useCallback(
        async (silentUpdate?: boolean) => {
            if (isCreate) return

            const deactivatedDatetime = new Date().toISOString()
            updateValue('deactivatedDatetime', deactivatedDatetime)
            updateValue('emailChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('chatChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('trialModeActivatedDatetime', null)
            updateValue('previewModeActivatedDatetime', null)
            updateValue('previewModeValidUntilDatetime', null)

            try {
                await updateStoreConfiguration({
                    ...storeConfiguration,
                    deactivatedDatetime,
                    chatChannelDeactivatedDatetime: deactivatedDatetime,
                    emailChannelDeactivatedDatetime: deactivatedDatetime,
                    trialModeActivatedDatetime: null,
                    previewModeActivatedDatetime: null,
                    previewModeValidUntilDatetime: null,
                })
                if (!silentUpdate) {
                    void dispatch(
                        notify({
                            message:
                                'AI Agent has been disabled, because no Knowledge source is connected.',
                            status: NotificationStatus.Warning,
                        })
                    )
                }
            } catch (error) {
                // nothing to notify here for the user as we do silent disable AI Agent
                reportError(error, {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
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
        ]
    )

    const selectedHelpCenter = faqHelpCenters.find((helpCenter) => {
        return helpCenter.id === formValues.helpCenterId
    })

    const setHelpCenterId = (id: number) => {
        if (id === EMPTY_HELP_CENTER_ID) {
            updateValue('helpCenterId', null)
            return
        }

        updateValue('helpCenterId', id)
    }

    const isHandoffToggled = isHandoffEnabled(
        formValues.silentHandover !== null
            ? formValues.silentHandover
            : INITIAL_FORM_VALUES.silentHandover
    )

    const {helpCenter: snippetHelpCenter} = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    const {sourceItems} = usePublicResources({
        helpCenterId: snippetHelpCenter?.id,
    })

    const {ingestedFiles} = useFileIngestion({
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
                    (ingestedFile) => ingestedFile.status === 'SUCCESSFUL'
                ) ?? false,
        }),
        [sourceItems, ingestedFiles]
    )

    const handlePublicURLsChange = useCallback(
        (publicURLs: string[]) => {
            // Because it's possible to delete public URLs without saving the form, we should deactivate AI Agent when no knowledge base
            if (
                publicURLs.length === 0 &&
                storeConfiguration?.helpCenterId === null &&
                storeConfiguration?.deactivatedDatetime === null
            ) {
                void deactivateAiAgent()
            }
        },
        [deactivateAiAgent, storeConfiguration]
    )

    const shouldDisplayAiAgentConfigurationModal = useMemo(() => {
        const hasViewedModal = ticketModalViewed?.includes(shopName)
        const isAiAgentDeactivated =
            storeConfiguration?.deactivatedDatetime !== null &&
            storeConfiguration?.emailChannelDeactivatedDatetime !== null &&
            storeConfiguration?.chatChannelDeactivatedDatetime !== null
        const isFormPendingActivation =
            formValues.deactivatedDatetime === null ||
            formValues.emailChannelDeactivatedDatetime === null ||
            formValues.chatChannelDeactivatedDatetime === null

        const isTrialModeActivated = !!formValues.trialModeActivatedDatetime
        const isTrialModeActive = trialModeAvailable && isTrialModeActivated

        // if user has enabled trial mode, we should not show the modal
        // if trial mode feature flag is false, and we have trialModeActivatedDatetime in store config -> user was in trial mode and is switching to live
        // if trial mode is false, and we don't have trialModeActivatedDatetime in store config -> check if user activated ai agent before
        const isAiAgentDeactivatedWithTrialMode = isTrialModeActive
            ? false
            : !!storeConfiguration?.trialModeActivatedDatetime ||
              isAiAgentDeactivated

        return (
            !hasViewedModal &&
            isFormPendingActivation &&
            isAiAgentDeactivatedWithTrialMode
        )
    }, [
        formValues.chatChannelDeactivatedDatetime,
        formValues.deactivatedDatetime,
        formValues.emailChannelDeactivatedDatetime,
        formValues.trialModeActivatedDatetime,
        shopName,
        storeConfiguration?.chatChannelDeactivatedDatetime,
        storeConfiguration?.deactivatedDatetime,
        storeConfiguration?.emailChannelDeactivatedDatetime,
        storeConfiguration?.trialModeActivatedDatetime,
        ticketModalViewed,
        trialModeAvailable,
    ])

    const onSubmit = () => {
        const isAiAgentWasEnabled =
            storeConfiguration?.deactivatedDatetime !== null &&
            formValues.deactivatedDatetime === null
        const isAiAgentWasEnabledForChat =
            storeConfiguration?.chatChannelDeactivatedDatetime !== null &&
            formValues.chatChannelDeactivatedDatetime === null
        const isAiAgentWasEnabledForEmail =
            storeConfiguration?.emailChannelDeactivatedDatetime !== null &&
            formValues.emailChannelDeactivatedDatetime === null

        const shouldUpdateSettingsAfterAiAgentEnabled =
            isAiAgentOnboardingWizardEnabled &&
            (isAiAgentWasEnabled ||
                isAiAgentWasEnabledForChat ||
                isAiAgentWasEnabledForEmail)

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
            },
        })
    }

    useEffect(() => {
        // Used as protection for the case when we disable AI agent feature flag Can be removed after the feature flag is removed
        let isAIAgentDeactivationRequired
        if (trialModeAvailable) {
            // If trial mode is available, we don't want to deactivate AI Agent
            isAIAgentDeactivationRequired = false
        } else if (isFollowUpAiAgentPreviewModeEnabled) {
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
        trialModeAvailable,
        formValues.trialModeActivatedDatetime,
        formValues.previewModeActivatedDatetime,
        isFollowUpAiAgentPreviewModeEnabled,
        formValues.previewModeValidUntilDatetime,
    ])

    const shouldDisablePreviewMode = useMemo(() => {
        if (
            formValues.trialModeActivatedDatetime === null &&
            formValues.previewModeActivatedDatetime === null
        ) {
            return false
        }
        if (
            (storeConfiguration?.deactivatedDatetime !== null ||
                storeConfiguration?.emailChannelDeactivatedDatetime !== null ||
                storeConfiguration?.chatChannelDeactivatedDatetime) &&
            (formValues.deactivatedDatetime === null ||
                formValues.emailChannelDeactivatedDatetime === null ||
                formValues.chatChannelDeactivatedDatetime === null)
        ) {
            return true
        }

        return false
    }, [storeConfiguration, formValues])

    useEffect(() => {
        if (shouldDisablePreviewMode) {
            updateValue('trialModeActivatedDatetime', null)
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

    const {
        isLoading,
        onboardingNotificationState,
        handleOnSave: handleOnSaveOnboardingNotificationState,
        handleOnSendOrCancelNotification,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({shopName})

    useEffect(() => {
        if (isLoading || !isAiAgentOnboardingNotificationEnabled) return

        const isFullyOnboarded =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.FullyOnboarded
        const isActivated =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.Activated

        if (isFullyOnboarded || isActivated) return

        if (
            !!storeConfiguration?.previewModeActivatedDatetime ||
            storeConfiguration?.chatChannelDeactivatedDatetime === null ||
            storeConfiguration?.emailChannelDeactivatedDatetime === null
        ) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.ActivateAiAgent,
                isCancel: true,
            })

            const payload: Partial<OnboardingNotificationState> = {
                onboardingState: AiAgentOnboardingState.Activated,
                firstActivationDatetime:
                    onboardingNotificationState?.firstActivationDatetime ??
                    new Date().toISOString(),
            }

            void handleOnSaveOnboardingNotificationState(payload)
        }
    }, [
        handleOnSaveOnboardingNotificationState,
        handleOnSendOrCancelNotification,
        isAiAgentOnboardingNotificationEnabled,
        isLoading,
        onboardingNotificationState?.firstActivationDatetime,
        onboardingNotificationState?.onboardingState,
        storeConfiguration?.chatChannelDeactivatedDatetime,
        storeConfiguration?.emailChannelDeactivatedDatetime,
        storeConfiguration?.previewModeActivatedDatetime,
    ])

    return (
        <>
            <UnsavedChangesPrompt
                onSave={onSubmit}
                when={isFormDirty}
                onDiscard={resetForm}
                shouldRedirectAfterSave={true}
            />

            <div className={css.storeConfigSettings}>
                <form onSubmit={onSubmit} className={css.automateView}>
                    <AIAgentIntroduction />
                    {shouldDisplayGeneralSections && (
                        <section>
                            <div className={css.generalSettingsWrapper}>
                                <h2 className={css.generalSettingsTitle}>
                                    General settings
                                </h2>
                                <span>How should AI Agent send responses?</span>
                            </div>
                            {(trialModeAvailable ||
                                isFollowUpAiAgentPreviewModeEnabled) && (
                                <AiAgentPreviewModeSection
                                    storeConfiguration={storeConfiguration}
                                    updateValue={updateValue}
                                    aiAgentMode={aiAgentMode}
                                    aiAgentPreviewTicketViewId={
                                        aiAgentPreviewTicketViewId
                                    }
                                    isFollowUpAiAgentPreviewModeEnabled={
                                        isFollowUpAiAgentPreviewModeEnabled
                                    }
                                />
                            )}
                            <ToneOfVoiceFormComponent
                                toneOfVoice={formValues.toneOfVoice}
                                customToneOfVoiceGuidance={
                                    formValues.customToneOfVoiceGuidance
                                }
                                updateValue={updateValue}
                            />
                        </section>
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
                                deactivatedDatetime
                            ) => {
                                updateValue(
                                    'chatChannelDeactivatedDatetime',
                                    deactivatedDatetime
                                )
                            }}
                            signature={formValues.signature}
                            monitoredEmailIntegrations={
                                formValues.monitoredEmailIntegrations
                            }
                            isEmailChannelEnabled={isEmailChannelEnabled}
                            emailChannelDeactivatedDatetime={
                                formValues.emailChannelDeactivatedDatetime
                            }
                            updateEmailChannelDeactivatedDatetime={(
                                deactivatedDatetime
                            ) => {
                                updateValue(
                                    'emailChannelDeactivatedDatetime',
                                    deactivatedDatetime
                                )
                            }}
                        />
                    )}

                    {shouldDisplayGeneralSections && (
                        <>
                            {!isAiAgentKnowledgeTabEnabled && (
                                <ConfigurationSection
                                    title="Knowledge"
                                    isRequired
                                    subtitle="Select a Help Center or add at least one URL in order to enable AI Agent."
                                    sectionRef={knowledgeSectionRef}
                                    data-candu-id="ai-agent-configuration-knowledge-copy"
                                >
                                    <div className={css.formGroup}>
                                        <Label className={css.label}>
                                            Help Center
                                        </Label>
                                        <HelpCenterSelect
                                            helpCenter={selectedHelpCenter}
                                            setHelpCenterId={setHelpCenterId}
                                            helpCenters={faqHelpCenters}
                                            withEmptyItemSelection
                                            className={css.helpCenterSelect}
                                        />
                                        <div
                                            className={css.formInputFooterInfo}
                                        >
                                            Select a Help Center to connect to
                                            AI Agent.
                                        </div>
                                    </div>

                                    {snippetHelpCenter ? (
                                        <CreatePublicSourcesSection
                                            helpCenterId={snippetHelpCenter.id}
                                            selectedHelpCenterId={
                                                selectedHelpCenter?.id
                                            }
                                            onPublicURLsChanged={
                                                handlePublicURLsChange
                                            }
                                            shopName={shopName}
                                            setIsFailedResources={
                                                setIsUrlSyncFail
                                            }
                                            setIsSuccessResources={
                                                setIsUrlSyncSuccess
                                            }
                                        />
                                    ) : null}
                                </ConfigurationSection>
                            )}

                            <section>
                                <h2
                                    className={css.sectionHeader}
                                    style={{marginBottom: '4px'}}
                                >
                                    Handover and exclusion
                                </h2>
                                <div
                                    className={css.sectionDescription}
                                    style={{marginBottom: '24px'}}
                                >
                                    When AI Agent is not confident in an answer,
                                    it automatically hands tickets over to your
                                    team. Choose how AI Agent behaves when
                                    handing over tickets, and add specific
                                    handover topics that should never be
                                    resolved by AI Agent.
                                </div>
                                <div className={css.formGroup}>
                                    <ToggleInput
                                        className={css.featureToggle}
                                        isToggled={isHandoffToggled}
                                        onClick={() => {
                                            if (
                                                formValues.silentHandover !==
                                                null
                                            ) {
                                                updateValue(
                                                    'silentHandover',
                                                    !formValues.silentHandover
                                                )
                                            } else {
                                                updateValue(
                                                    'silentHandover',
                                                    !INITIAL_FORM_VALUES.silentHandover
                                                )
                                            }
                                        }}
                                        name={toggleHandoffId}
                                        caption="When enabled, AI Agent will promptly respond and tell customers their request is being handed over for further assistance. When disabled, AI Agent will not respond before handing over."
                                    >
                                        Tell customers when handing over
                                    </ToggleInput>
                                </div>
                                <div className={css.formGroup}>
                                    <Label className={css.subsectionHeader}>
                                        Handover topics
                                    </Label>
                                    <div className={css.formGroupDescription}>
                                        Define topics for AI Agent to always
                                        hand over to agents.
                                    </div>
                                    <ListField
                                        className={css.container}
                                        items={List(
                                            formValues.excludedTopics !== null
                                                ? formValues.excludedTopics
                                                : INITIAL_FORM_VALUES.excludedTopics
                                        )}
                                        onChange={(
                                            excludedTopics: List<string>
                                        ) => {
                                            updateValue(
                                                'excludedTopics',
                                                excludedTopics.toJS()
                                            )
                                        }}
                                        placeholder="e.g. Invoice and billing, Data privacy, or Complaints"
                                        maxLength={EXCLUDED_TOPIC_MAX_LENGTH}
                                        maxItems={MAX_EXCLUDED_TOPICS}
                                        addLabel="Add Topic"
                                        dataCanduId="ai-agent-configuration-handover-topics"
                                    />
                                </div>
                                <div className={css.formGroup}>
                                    <Label className={css.subsectionHeader}>
                                        Prevent AI Agent from triggering on
                                        specific tickets
                                    </Label>
                                    <div
                                        className={
                                            css.preventAIAgentTriggerDescription
                                        }
                                    >
                                        Configure the{' '}
                                        <Link to="/app/settings/rules/library?auto-tag-ai-ignore">
                                            Prevent AI Agent from answering rule{' '}
                                        </Link>
                                        to prevent AI Agent from reviewing
                                        specific tickets altogether. (e.g.
                                        tickets from certain email addresses,
                                        tickets with certain tags).
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2
                                    className={css.sectionHeader}
                                    style={{marginBottom: '4px'}}
                                >
                                    AI ticket tagging
                                    <IconTooltip
                                        className={css.taggingTooltip}
                                        tooltipProps={{
                                            placement: 'top-start',
                                        }}
                                    >
                                        Provide quick instructions in everyday
                                        speech, and let AI Agent handle the
                                        rest, saving you time and ensuring
                                        consistent categorization.
                                    </IconTooltip>
                                </h2>
                                <div className={css.sectionDescription}>
                                    Use AI tagging to let AI Agent automatically
                                    label tickets based on their content.
                                </div>

                                <TagList
                                    tags={formValues.tags ?? []}
                                    onTagsUpdate={(tags: Tag[]) => {
                                        updateValue('tags', tags)
                                    }}
                                />
                            </section>
                        </>
                    )}

                    <section>
                        <Button
                            onClick={onSubmit}
                            isDisabled={isPendingCreateOrUpdate}
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

                <TicketPreview
                    toneOfVoice={formValues.toneOfVoice}
                    signature={formValues.signature}
                    customToneOfVoiceGuidance={
                        formValues.customToneOfVoiceGuidance
                    }
                    customToneOfVoicePreview={latestCustomToneOfVoicePreview}
                    isLoadingCustomToneOfVoicePreview={
                        isCustomToneOfVoicePreviewLoading
                    }
                    onGenerateCustomToneOfVoicePreview={
                        onGenerateCustomToneOfVoicePreview
                    }
                    isError={isError}
                />
            </div>
            <PostCompletionWizardModal />

            <AiAgentConfigurationModal
                isOpen={isAiAgentConfigurationModalOpen}
                onClose={onCloseAiAgentConfigurationModal}
                onShowMe={onShowMeAiAgentConfigurationModal}
            />
        </>
    )
}

export const CreatePublicSourcesSection = ({
    onPublicURLsChanged,
    ...props
}: ComponentProps<typeof PublicSourcesSection>) => {
    const {sourceItems} = usePublicResources({helpCenterId: props.helpCenterId})

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
