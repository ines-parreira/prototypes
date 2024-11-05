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
import {Link} from 'react-router-dom'

// Absolute Imports
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useLocalStorage from 'hooks/useLocalStorage'
import {useSearchParam} from 'hooks/useSearchParam'
import {Tag} from 'models/aiAgent/types'
import {HelpCenter} from 'models/helpCenter/types'
import {useConfigurationForm} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import HelpCenterSelect, {
    EMPTY_HELP_CENTER_ID,
} from 'pages/automate/common/components/HelpCenterSelect'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
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
import {
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    INITIAL_FORM_VALUES,
    WIZARD_POST_COMPLETION_QUERY_KEY,
    WIZARD_POST_COMPLETION_STATE,
} from '../../constants'
import {useAccountStoreConfiguration} from '../../hooks/useAccountStoreConfiguration'
import {useAiAgentEnabled} from '../../hooks/useAiAgentEnabled'
import {useGetOrCreateSnippetHelpCenter} from '../../hooks/useGetOrCreateSnippetHelpCenter'
import {usePublicResources} from '../../hooks/usePublicResources'
import {useAiAgentStoreConfigurationContext} from '../../providers/AiAgentStoreConfigurationContext'
import {FormValues} from '../../types'
import {isAiAgentEnabled, isHandoffEnabled} from '../../util'
import {AIAgentIntroduction} from '../AIAgentIntroduction/AIAgentIntroduction'
import {AIAgentPreviewModeSection} from '../AIAgentPreviewModeSection/AiAgentPreviewModeSection'
import {ConfigurationSection} from '../ConfigurationSection/ConfigurationSection'
import {PublicSourcesSection} from '../PublicSourcesSection/PublicSourcesSection'
import TagList from '../TicketTag/TagList'

import {SettingsBannerType} from './constants'
import {ChannelToggleInput} from './FormComponents/ChannelToggleInput'
import {ChatSettingsFormComponent} from './FormComponents/ChatSettingsFormComponent'
import {EmailFormComponent} from './FormComponents/EmailFormComponent'
import {SettingsBanner} from './FormComponents/SettingsBanner'
import {SignatureFormComponent} from './FormComponents/SignatureFormComponent'
import {ToneOfVoiceFormComponent} from './FormComponents/ToneOfVoiceFormComponent'
import css from './StoreConfigForm.less'
import {getFormValuesFromStoreConfiguration} from './StoreConfigForm.utils'

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
    const trialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]
    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]
    const isAiAgentMultichannelEnablementEnabled =
        useFlags()[FeatureFlagKey.AiAgentMultiChannelEnablement]
    const isFollowUpAiAgentPreviewModeEnabled =
        useFlags()[FeatureFlagKey.FollowUpAiAgentPreviewMode]

    const dispatch = useAppDispatch()

    const [isUrlSyncSuccess, setIsUrlSyncSuccess] = useState(false)
    const [isUrlSyncFail, setIsUrlSyncFail] = useState(false)

    const [sectionQueryParam, setSectionQueryParam] = useSearchParam('section')
    const [wizardQueryParam, setWizardQueryParam] = useSearchParam(
        WIZARD_POST_COMPLETION_QUERY_KEY
    )

    const {aiAgentTicketViewId} = useAccountStoreConfiguration({
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
    } = useConfigurationForm({initValues: defaultFormValues, shopName})
    const [publicUrls, setPublicUrls] = useState<string[]>([])

    const {updateSettingsAfterAiAgentEnabled} = useAiAgentEnabled({
        monitoredEmailIntegrations: formValues.monitoredEmailIntegrations ?? [],
        monitoredChatIntegrations: formValues.monitoredChatIntegrations ?? [],
        isChatChanelEnabled: isAiAgentMultichannelEnablementEnabled
            ? formValues.chatChannelDeactivatedDatetime === null
            : formValues.deactivatedDatetime === null,
        isEmailChannelEnabled: isAiAgentMultichannelEnablementEnabled
            ? formValues.emailChannelDeactivatedDatetime === null
            : formValues.deactivatedDatetime === null,
    })

    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`

    const isAIAgentToggled = isAiAgentEnabled(
        formValues.deactivatedDatetime !== undefined
            ? formValues.deactivatedDatetime
            : INITIAL_FORM_VALUES.deactivatedDatetime
    )

    const isEmailChannelEnabled = isAiAgentEnabled(
        formValues.emailChannelDeactivatedDatetime !== undefined
            ? formValues.emailChannelDeactivatedDatetime
            : INITIAL_FORM_VALUES.emailChannelDeactivatedDatetime
    )

    const isChatChannelEnabled = isAiAgentEnabled(
        formValues.chatChannelDeactivatedDatetime !== undefined
            ? formValues.chatChannelDeactivatedDatetime
            : INITIAL_FORM_VALUES.chatChannelDeactivatedDatetime
    )

    const isAiAgentSnippetsFromExternalFilesEnabled =
        useFlags()[FeatureFlagKey.AiAgentSnippetsFromExternalFiles]

    const aiAgentMode = useMemo(() => {
        if (isAIAgentToggled) {
            if (formValues.trialModeActivatedDatetime === null) {
                return 'enabled'
            }

            return 'trial'
        }

        return 'disabled'
    }, [isAIAgentToggled, formValues.trialModeActivatedDatetime])

    const deactivateAiAgent = useCallback(
        async (silentUpdate?: boolean) => {
            if (isCreate) return

            const deactivatedDatetime = new Date().toISOString()
            updateValue('deactivatedDatetime', deactivatedDatetime)
            updateValue('emailChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('chatChannelDeactivatedDatetime', deactivatedDatetime)
            updateValue('trialModeActivatedDatetime', null)
            updateValue('previewModeActivatedDatetime', null)

            try {
                await updateStoreConfiguration({
                    ...storeConfiguration,
                    deactivatedDatetime,
                    chatChannelDeactivatedDatetime: deactivatedDatetime,
                    emailChannelDeactivatedDatetime: deactivatedDatetime,
                    trialModeActivatedDatetime: null,
                    previewModeActivatedDatetime: null,
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

    const handlePublicURLsChange = useCallback(
        (publicURLs: string[]) => {
            setPublicUrls(publicURLs)

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
            publicUrls,
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
        if (aiAgentMode === 'trial' && !trialModeAvailable) {
            void deactivateAiAgent(true)
        }
    }, [
        aiAgentMode,
        deactivateAiAgent,
        trialModeAvailable,
        formValues.trialModeActivatedDatetime,
        formValues.previewModeActivatedDatetime,
    ])

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

    return (
        <>
            <UnsavedChangesPrompt
                onSave={onSubmit}
                when={isFormDirty}
                onDiscard={resetForm}
                shouldRedirectAfterSave={true}
            />

            <form onSubmit={onSubmit} className={css.automateView}>
                <AIAgentIntroduction />
                <section>
                    <div className={css.generalSettingsWrapper}>
                        <h2 className={css.generalSettingsTitle}>
                            General settings
                        </h2>
                        <span>How should AI Agent send responses?</span>
                    </div>
                    {(trialModeAvailable ||
                        isFollowUpAiAgentPreviewModeEnabled) && (
                        <AIAgentPreviewModeSection
                            storeConfiguration={storeConfiguration}
                            updateValue={updateValue}
                            aiAgentMode={aiAgentMode}
                            aiAgentTicketViewId={aiAgentTicketViewId}
                            isFollowUpAiAgentPreviewModeEnabled={
                                isFollowUpAiAgentPreviewModeEnabled
                            }
                        />
                    )}
                    {!isAiAgentMultichannelEnablementEnabled &&
                        !trialModeAvailable && (
                            <div className={css.formGroup}>
                                <ToggleInput
                                    isToggled={isAIAgentToggled}
                                    onClick={() => {
                                        updateValue(
                                            'deactivatedDatetime',
                                            isAIAgentToggled
                                                ? new Date().toISOString()
                                                : null
                                        )

                                        if (isAIAgentToggled) {
                                            logEvent(
                                                SegmentEvent.AiAgentConfigurationDisabled
                                            )
                                        }
                                    }}
                                    caption="When enabled, you can find tickets handled by AI Agent in your ticket views."
                                    name={toggleAiAgentId}
                                    dataCanduId="ai-agent-configuration-toggle"
                                >
                                    Enable AI Agent
                                </ToggleInput>
                            </div>
                        )}

                    <ToneOfVoiceFormComponent
                        toneOfVoice={formValues.toneOfVoice}
                        customToneOfVoiceGuidance={
                            formValues.customToneOfVoiceGuidance
                        }
                        updateValue={updateValue}
                    />
                </section>

                {!isAiAgentSnippetsFromExternalFilesEnabled && (
                    <ConfigurationSection
                        title="Knowledge"
                        isRequired
                        subtitle="Select a Help Center or add at least one URL in order to enable AI Agent."
                        sectionRef={knowledgeSectionRef}
                        data-candu-id="ai-agent-configuration-knowledge-copy"
                    >
                        <div className={css.formGroup}>
                            <Label className={css.label}>Help Center</Label>
                            <HelpCenterSelect
                                helpCenter={selectedHelpCenter}
                                setHelpCenterId={setHelpCenterId}
                                helpCenters={faqHelpCenters}
                                withEmptyItemSelection
                                className={css.helpCenterSelect}
                            />
                            <div className={css.formInputFooterInfo}>
                                Select a Help Center to connect to AI Agent.
                            </div>
                        </div>

                        {snippetHelpCenter ? (
                            <CreatePublicSourcesSection
                                helpCenterId={snippetHelpCenter.id}
                                selectedHelpCenterId={selectedHelpCenter?.id}
                                onPublicURLsChanged={handlePublicURLsChange}
                                shopName={shopName}
                                setIsFailedResources={setIsUrlSyncFail}
                                setIsSuccessResources={setIsUrlSyncSuccess}
                            />
                        ) : null}
                    </ConfigurationSection>
                )}

                {isAiAgentChatEnabled && (
                    <ConfigurationSection
                        title="Chat settings"
                        data-candu-id="ai-agent-configuration-chat-settings"
                    >
                        <SettingsBanner
                            type={SettingsBannerType.Chat}
                            deactivatedDatetime={
                                isAiAgentMultichannelEnablementEnabled
                                    ? formValues.chatChannelDeactivatedDatetime
                                    : formValues.deactivatedDatetime
                            }
                        />
                        {isAiAgentMultichannelEnablementEnabled ? (
                            <div className={css.sectionBlock}>
                                <ChannelToggleInput
                                    isToggled={isChatChannelEnabled}
                                    onUpdate={(isToggled) => {
                                        updateValue(
                                            'chatChannelDeactivatedDatetime',
                                            isToggled
                                                ? null
                                                : new Date().toISOString()
                                        )
                                    }}
                                    channel="chat"
                                />
                            </div>
                        ) : null}

                        <ChatSettingsFormComponent
                            monitoredChatIntegrations={
                                formValues.monitoredChatIntegrations
                            }
                            isRequired={
                                formValues.chatChannelDeactivatedDatetime ===
                                null
                            }
                            updateValue={updateValue}
                            chatChannels={chatChannels}
                        />
                    </ConfigurationSection>
                )}

                <section ref={emailSectionRef}>
                    <h2
                        className={css.sectionHeader}
                        data-candu-id="ai-agent-configuration-email-settings"
                    >
                        Email settings
                    </h2>
                    <SettingsBanner
                        type={SettingsBannerType.Email}
                        deactivatedDatetime={
                            isAiAgentMultichannelEnablementEnabled
                                ? formValues.emailChannelDeactivatedDatetime
                                : formValues.deactivatedDatetime
                        }
                    />
                    {isAiAgentMultichannelEnablementEnabled ? (
                        <div className={css.sectionBlock}>
                            <ChannelToggleInput
                                isToggled={isEmailChannelEnabled}
                                onUpdate={(isToggled) => {
                                    updateValue(
                                        'emailChannelDeactivatedDatetime',
                                        isToggled
                                            ? null
                                            : new Date().toISOString()
                                    )
                                }}
                                channel="email"
                            />
                        </div>
                    ) : null}

                    <EmailFormComponent
                        updateValue={updateValue}
                        monitoredEmailIntegrations={
                            formValues.monitoredEmailIntegrations
                        }
                        isRequired={
                            formValues.emailChannelDeactivatedDatetime === null
                        }
                    />
                    <SignatureFormComponent
                        isRequired={
                            formValues.emailChannelDeactivatedDatetime === null
                        }
                        updateValue={updateValue}
                        signature={formValues.signature}
                    />
                </section>

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
                        When AI Agent is not confident in an answer, it
                        automatically hands tickets over to your team. Choose
                        how AI Agent behaves when handing over tickets, and add
                        specific handover topics that should never be resolved
                        by AI Agent.
                    </div>
                    <div className={css.formGroup}>
                        <ToggleInput
                            className={css.featureToggle}
                            isToggled={isHandoffToggled}
                            onClick={() => {
                                if (formValues.silentHandover !== null) {
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
                            Define topics for AI Agent to always hand over to
                            agents.
                        </div>
                        <ListField
                            className={css.container}
                            items={List(
                                formValues.excludedTopics !== null
                                    ? formValues.excludedTopics
                                    : INITIAL_FORM_VALUES.excludedTopics
                            )}
                            onChange={(excludedTopics: List<string>) => {
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
                            Prevent AI Agent from triggering on specific tickets
                        </Label>
                        <div className={css.preventAIAgentTriggerDescription}>
                            Configure the{' '}
                            <Link to="/app/settings/rules/library?auto-tag-ai-ignore">
                                Prevent AI Agent from answering rule{' '}
                            </Link>
                            to prevent AI Agent from reviewing specific tickets
                            altogether. (e.g. tickets from certain email
                            addresses, tickets with certain tags).
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
                            Provide quick instructions in everyday speech, and
                            let AI Agent handle the rest, saving you time and
                            ensuring consistent categorization.
                        </IconTooltip>
                    </h2>
                    <div
                        className={css.sectionDescription}
                        style={{marginBottom: '16px'}}
                    >
                        Use AI tagging to let AI Agent automatically label
                        tickets based on their content.
                    </div>

                    <TagList
                        tags={formValues.tags ?? []}
                        onTagsUpdate={(tags: Tag[]) => {
                            updateValue('tags', tags)
                        }}
                    />
                </section>

                <section>
                    <Button
                        onClick={onSubmit}
                        isDisabled={
                            isPendingCreateOrUpdate ||
                            (!isFormDirty && !isCreate)
                        }
                        className="mb-3"
                    >
                        Save Changes
                    </Button>
                    <p className={css.legalDisclaimer}>
                        By using AI Agent, you agree to comply with all
                        applicable laws, including, but not limited to, laws
                        prohibiting misleading consumers about the artificial
                        identity of an automated online account, such as the
                        California Bolstering Online Transparency Act.
                    </p>
                </section>
            </form>
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
