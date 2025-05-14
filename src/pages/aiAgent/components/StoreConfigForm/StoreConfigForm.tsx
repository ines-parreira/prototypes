// External Libraries
import {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import { useId } from '@floating-ui/react'
import classNames from 'classnames'
import { List } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'
import { Link, useParams } from 'react-router-dom'

import { Button, Label, ToggleField } from '@gorgias/merchant-ui-kit'

// Absolute Imports
import { SentryTeam } from 'common/const/sentryTeamNames'
import { FeatureFlagKey } from 'config/featureFlags'
import { EMAIL_INTEGRATION_TYPES } from 'constants/integration'
import { OBJECT_TYPES } from 'custom-fields/constants'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import { CustomField } from 'custom-fields/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import { useSearchParam } from 'hooks/useSearchParam'
import { Tag } from 'models/aiAgent/types'
import { HelpCenter } from 'models/helpCenter/types'
import { AiAgentConfigurationModal } from 'pages/aiAgent/AiAgentConfigurationView/AiAgentConfigurationModal'
import PostCompletionWizardModal from 'pages/aiAgent/AiAgentOnboardingWizard/PostCompletionWizardModal'
import { TicketPreview } from 'pages/aiAgent/AiAgentOnboardingWizard/TicketPreview'
import { PublicSourcesSection } from 'pages/aiAgent/components//PublicSourcesSection/PublicSourcesSection'
import TagList from 'pages/aiAgent/components//TicketTag/TagList'
import { AIAgentIntroduction } from 'pages/aiAgent/components/AIAgentIntroduction/AIAgentIntroduction'
import { AiAgentPreviewModeSection } from 'pages/aiAgent/components/AIAgentPreviewModeSection/AiAgentPreviewModeSection'
import { HandoverTopicsModal } from 'pages/aiAgent/components/HandoverTopicsModel/HandoverTopicsModal'
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
import { FormValues } from 'pages/aiAgent/types'
import { isHandoffEnabled } from 'pages/aiAgent/util'
import {
    SettingsCard,
    SettingsCardContent,
    SettingsCardHeader,
    SettingsCardTitle,
} from 'pages/common/components/SettingsCard'
import { SettingsFeatureRow } from 'pages/common/components/SettingsCard/SettingsFeatureRow'
import UnsavedChangesModal from 'pages/common/components/UnsavedChangesModal'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import ListField from 'pages/common/forms/ListField'
import history from 'pages/history'
import { getIntegrationsByTypes } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { reportError } from 'utils/errors'

import css from './StoreConfigForm.less'

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
    const isStandaloneMenuEnabled = flags[FeatureFlagKey.ConvAiStandaloneMenu]
    const isAiAutofillSectionEnabled =
        flags[FeatureFlagKey.AiAgentUsesStoreConfigurationCustomFields]
    const isSettingsRevampEnabled = flags[FeatureFlagKey.AiAgentSettingsRevamp]

    // Because this component is heavy and difficult to rework
    // Standalone team decided to add the capability to show/hide some sections based on the current route (tab param)
    const { tab = 'general' } = useParams<{ tab?: 'channels' }>()
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
    const shouldDisplayTOVPreview =
        tab === 'general' || !isSettingsRevampEnabled

    const dispatch = useAppDispatch()

    const [sectionQueryParam, setSectionQueryParam] = useSearchParam('section')

    const [isHandoverTopicsModalOpen, setIsHandoverTopicsModalOpen] =
        useState(false)

    const [wizardQueryParam] = useSearchParam(WIZARD_POST_COMPLETION_QUERY_KEY)

    const { aiAgentTicketViewId, aiAgentPreviewTicketViewId } =
        useAccountStoreConfiguration({
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

    const toggleHandoffId = `toggle-handoff-${useId()}`

    const aiAgentMode = useMemo(() => {
        const isTrialMode =
            !!storeConfiguration &&
            isPreviewModeActivated({
                isPreviewModeActive: storeConfiguration.isPreviewModeActive,
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
            updateValue('emailChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('chatChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('trialModeActivatedDatetime', null)
            updateValue('previewModeActivatedDatetime', null)
            updateValue('previewModeValidUntilDatetime', null)

            try {
                await updateStoreConfiguration({
                    ...storeConfiguration,
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
        formValues.emailChannelDeactivatedDatetime,
        formValues.trialModeActivatedDatetime,
        shopName,
        storeConfiguration?.chatChannelDeactivatedDatetime,
        storeConfiguration?.emailChannelDeactivatedDatetime,
        storeConfiguration?.trialModeActivatedDatetime,
        ticketModalViewed,
        trialModeAvailable,
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
            isAiAgentOnboardingWizardEnabled &&
            (isAiAgentWasEnabledForChat || isAiAgentWasEnabledForEmail)

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
        isAiAgentOnboardingWizardEnabled,
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
                <TagList
                    tags={activeDrawerValues.tags ?? []}
                    onTagsUpdate={(tags: Tag[]) => {
                        setActiveDrawerValues({ ...activeDrawerValues, tags })
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
                    Define topics for AI Agent to always hand over to agents.
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
                        placeholder="e.g. Invoice and billing, Data privacy, or Complaints"
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
                            {!isSettingsRevampEnabled && (
                                <AIAgentIntroduction />
                            )}
                            <section
                                className={classNames({
                                    [css.section]: isSettingsRevampEnabled,
                                })}
                            >
                                {!isSettingsRevampEnabled && (
                                    <>
                                        <div
                                            className={
                                                css.generalSettingsWrapper
                                            }
                                        >
                                            <h2
                                                className={
                                                    css.generalSettingsTitle
                                                }
                                            >
                                                General
                                            </h2>
                                            <span>
                                                How should AI Agent send
                                                responses?
                                            </span>
                                        </div>
                                        {(trialModeAvailable ||
                                            isFollowUpAiAgentPreviewModeEnabled) && (
                                            <AiAgentPreviewModeSection
                                                storeConfiguration={
                                                    storeConfiguration
                                                }
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
                                    </>
                                )}
                                <ToneOfVoiceFormComponent
                                    toneOfVoice={formValues.toneOfVoice}
                                    customToneOfVoiceGuidance={
                                        formValues.customToneOfVoiceGuidance
                                    }
                                    updateValue={updateValue}
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
                        />
                    )}

                    {shouldDisplayGeneralSections && (
                        <>
                            {isAiAutofillSectionEnabled &&
                                !isSettingsRevampEnabled && (
                                    <section>
                                        <h2
                                            className={classNames(
                                                'mb-2',
                                                css.sectionHeader,
                                            )}
                                        >
                                            AI Autofill: Tags & Ticket Fields
                                        </h2>
                                        <div className={css.sectionDescription}>
                                            Tags and Ticket Fields selected will
                                            be filled out automatically by AI
                                            Agent, helping categorize and
                                            prioritize tickets with less manual
                                            work.
                                        </div>
                                        <div className={css.formGroup}>
                                            <Label
                                                className={css.subsectionHeader}
                                            >
                                                Tags
                                            </Label>
                                            <div
                                                className={
                                                    css.formGroupDescription
                                                }
                                            >
                                                Choose which tags AI Agent
                                                should apply to tickets.{' '}
                                                <Link
                                                    to={
                                                        '/app/settings/manage-tags'
                                                    }
                                                >
                                                    Manage tags
                                                </Link>
                                                .
                                            </div>
                                            <TagList
                                                tags={formValues.tags ?? []}
                                                onTagsUpdate={(tags: Tag[]) => {
                                                    updateValue('tags', tags)
                                                }}
                                            />
                                        </div>
                                        <CustomFieldsFormComponent
                                            data-testid="ai-agent-store-configuration-custom-fields-form-component"
                                            updateValue={updateValue}
                                            customFieldIds={
                                                formValues.customFieldIds
                                            }
                                            isStoreCreated={!isCreate}
                                        />
                                    </section>
                                )}
                            {!isSettingsRevampEnabled && (
                                <section>
                                    <h2
                                        className={classNames(
                                            'mb-2',
                                            css.sectionHeader,
                                        )}
                                    >
                                        Handover and exclusion
                                    </h2>
                                    <div
                                        className={classNames(
                                            'mb-4',
                                            css.sectionDescription,
                                        )}
                                    >
                                        When AI Agent is not confident in an
                                        answer, it automatically hands tickets
                                        over to your team. Choose how AI Agent
                                        behaves when handing over tickets, and
                                        add specific handover topics that should
                                        never be resolved by AI Agent.
                                    </div>
                                    <div className={css.formGroup}>
                                        <ToggleField
                                            className={css.featureToggle}
                                            value={isHandoffToggled}
                                            onChange={() => {
                                                if (
                                                    formValues.silentHandover !==
                                                    null
                                                ) {
                                                    updateValue(
                                                        'silentHandover',
                                                        !formValues.silentHandover,
                                                    )
                                                } else {
                                                    updateValue(
                                                        'silentHandover',
                                                        !INITIAL_FORM_VALUES.silentHandover,
                                                    )
                                                }
                                            }}
                                            name={toggleHandoffId}
                                            caption="When enabled, AI Agent will promptly respond and tell customers their request is being handed over for further assistance. When disabled, AI Agent will not respond before handing over."
                                            label="Tell customers when handing over"
                                        />
                                    </div>
                                    <div className={css.formGroup}>
                                        <Label className={css.subsectionHeader}>
                                            Handover topics
                                        </Label>
                                        <div
                                            className={css.formGroupDescription}
                                        >
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setIsHandoverTopicsModalOpen(
                                                        true,
                                                    )
                                                }}
                                                className={
                                                    css.handoverTopicsLink
                                                }
                                                role="button"
                                                aria-haspopup="dialog"
                                                aria-label="Define handover topics"
                                            >
                                                Define
                                            </a>{' '}
                                            topics that should always be handed
                                            over to your team.
                                        </div>
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
                                                Prevent AI Agent from answering
                                                rule{' '}
                                            </Link>
                                            to prevent AI Agent from reviewing
                                            specific tickets altogether. (e.g.
                                            tickets from certain email
                                            addresses, tickets with certain
                                            tags).
                                        </div>
                                    </div>
                                </section>
                            )}

                            {isSettingsRevampEnabled && (
                                <>
                                    <section
                                        className={classNames({
                                            [css.section]:
                                                isSettingsRevampEnabled,
                                        })}
                                    >
                                        <SettingsCard>
                                            <SettingsCardHeader>
                                                <SettingsCardTitle>
                                                    AI ticket tagging
                                                </SettingsCardTitle>
                                                <p>
                                                    Tags and Ticket Fields
                                                    selected will be filled out
                                                    automatically by AI Agent,
                                                    helping categorize and
                                                    prioritize tickets with less
                                                    manual work.
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
                                                        formValues.tags
                                                            ?.length ?? 0
                                                    }
                                                    badgeText={
                                                        formValues.tags
                                                            ?.length === 0
                                                            ? 'No tags'
                                                            : `${formValues.tags?.length} tags`
                                                    }
                                                    onClick={() => {
                                                        setIsDrawerOpen(true)
                                                        setActiveDrawerContent(
                                                            'tags',
                                                        )
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
                                                            setIsDrawerOpen(
                                                                true,
                                                            )
                                                            setActiveDrawerContent(
                                                                'customFieldIds',
                                                            )
                                                        }}
                                                    />
                                                )}
                                            </SettingsCardContent>
                                        </SettingsCard>
                                    </section>
                                    <section
                                        className={classNames({
                                            [css.section]:
                                                isSettingsRevampEnabled,
                                        })}
                                    >
                                        <SettingsCard>
                                            <SettingsCardHeader>
                                                <SettingsCardTitle>
                                                    Handover and exclusion
                                                </SettingsCardTitle>
                                                <p>
                                                    When AI Agent is not
                                                    confident in an answer, it
                                                    automatically hands tickets
                                                    over to your team. Choose
                                                    how AI Agent behaves when
                                                    handing over tickets, and
                                                    add specific{' '}
                                                    <a
                                                        href="#"
                                                        onClick={() => {
                                                            setIsDrawerOpen(
                                                                true,
                                                            )
                                                            setActiveDrawerContent(
                                                                'excludedTopics',
                                                            )
                                                        }}
                                                    >
                                                        handover topics
                                                    </a>{' '}
                                                    that should never be
                                                    resolved by AI Agent.
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
                                                />
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
                        </>
                    )}

                    {!isAiAutofillSectionEnabled &&
                        !isSettingsRevampEnabled &&
                        shouldDisplayGeneralSections && (
                            <section>
                                <h2
                                    className={classNames(
                                        css.sectionHeader,
                                        'mb-2',
                                    )}
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

                <div
                    className={classNames({
                        [css.ticketPreviewContainer]: isSettingsRevampEnabled,
                    })}
                >
                    {shouldDisplayTOVPreview && (
                        <TicketPreview
                            toneOfVoice={formValues.toneOfVoice}
                            signature={formValues.signature}
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
                    )}
                </div>
            </div>
            {isSettingsRevampEnabled && (
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
            )}
            <PostCompletionWizardModal />
            <HandoverTopicsModal
                isOpen={isHandoverTopicsModalOpen}
                onClose={() => setIsHandoverTopicsModalOpen(false)}
                accountDomain={accountDomain}
                shopName={shopName}
            />
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
