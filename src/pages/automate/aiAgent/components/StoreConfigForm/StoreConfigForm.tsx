import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {useId} from '@floating-ui/react'
import {isAxiosError} from 'axios'
import {Link} from 'react-router-dom'
import _get from 'lodash/get'
import {List} from 'immutable'
import {Label} from '@gorgias/ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {reportError} from 'utils/errors'
import {StoreConfiguration, Tag} from 'models/aiAgent/types'
import {Value} from 'pages/common/forms/SelectField/types'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import {getHelpCenterFAQList} from 'state/entities/helpCenter/helpCenters'
import {getIntegrationsByTypes} from 'state/integrations/selectors'

import HelpCenterSelect, {
    EMPTY_HELP_CENTER_ID,
} from 'pages/automate/common/components/HelpCenterSelect'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import ListField from 'pages/common/forms/ListField'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import TextArea from 'pages/common/forms/TextArea'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {SegmentEvent, logEvent} from 'common/segment'
import RadioFieldSet from 'pages/common/forms/RadioFieldSet'
import {
    useConfigurationForm,
    validateConfigurationFormValues,
} from '../../hooks/useConfigurationForm'
import {
    ToneOfVoice,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    SIGNATURE_MAX_LENGTH,
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
} from '../../constants'
import {useAiAgentHelpCenter} from '../../hooks/useAiAgentHelpCenter'
import {usePublicResources} from '../../hooks/usePublicResources'
import {FormValues, ValidFormValues} from '../../types'
import {isAiAgentEnabled, isHandoffEnabled} from '../../util'
import {AIAgentIntroduction} from '../AIAgentIntroduction/AIAgentIntroduction'
import {ConfigurationSection} from '../ConfigurationSection/ConfigurationSection'
import {EmailIntegrationListSelection} from '../EmailIntegrationListSelection/EmailIntegrationListSelection'
import {PublicSourcesSection} from '../PublicSourcesSection/PublicSourcesSection'
import TagList from '../TicketTag/TagList'

import {useStoreConfigurationMutation} from '../../hooks/useStoreConfigurationMutation'
import css from './StoreConfigForm.less'
import {
    getFormValuesFromStoreConfiguration,
    getStoreConfigurationFromFormValues,
} from './StoreConfigForm.utils'

const INITIAL_FORM_VALUES = {
    trialModeActivatedDatetime: null,
    deactivatedDatetime: new Date().toISOString(),
    silentHandover: false,
    monitoredEmailIntegrations: [],
    tags: [],
    excludedTopics: [],
    signature: 'This response was created by AI',
    toneOfVoice: ToneOfVoice.Friendly,
    customToneOfVoiceGuidance:
        "Be concise. Use an empathetic, proactive, and reassuring tone. Acknowledge the customer's feelings with apologies and empathetic expressions. You can include emojis for a personal touch (e.g., 👍) and exclamation points.",
    helpCenter: null,
}

type Props = {
    shopName: string
    accountDomain: string
    storeConfiguration?: StoreConfiguration
}

export const StoreConfigForm = ({
    shopName,
    accountDomain,
    storeConfiguration,
}: Props) => {
    const trialModeAvailable = useFlags()[FeatureFlagKey.AiAgentTrialMode]
    const faqHelpCenters = useAppSelector(getHelpCenterFAQList)
    const dispatch = useAppDispatch()
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

    const {formValues, isFormDirty, resetForm, updateValue} =
        useConfigurationForm(defaultFormValues)
    const [publicUrls, setPublicUrls] = useState<string[]>([])
    const {isLoading, createStoreConfiguration, upsertStoreConfiguration} =
        useStoreConfigurationMutation({shopName, accountDomain})
    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`

    const deactivateAiAgent = useCallback(
        async (silentUpdate?: boolean) => {
            if (isCreate) return

            const deactivatedDatetime = new Date().toISOString()
            updateValue('deactivatedDatetime', deactivatedDatetime)
            updateValue('trialModeActivatedDatetime', null)

            try {
                await upsertStoreConfiguration({
                    ...storeConfiguration,
                    deactivatedDatetime,
                    trialModeActivatedDatetime: null,
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
            upsertStoreConfiguration,
            storeConfiguration,
            dispatch,
        ]
    )

    const handleOnSave = async () => {
        let validFormValues: ValidFormValues
        try {
            validFormValues = validateConfigurationFormValues(
                formValues,
                publicUrls
            )
        } catch (error) {
            if (error instanceof Error) {
                void dispatch(
                    notify({
                        message: error.message,
                        status: NotificationStatus.Error,
                    })
                )
            } else {
                throw error
            }

            return
        }

        const configurationToSubmit = getStoreConfigurationFromFormValues(
            shopName,
            validFormValues
        )

        try {
            if (isCreate) {
                await createStoreConfiguration(configurationToSubmit)
            } else {
                await upsertStoreConfiguration({
                    ...storeConfiguration,
                    ...configurationToSubmit,
                })
            }
            void dispatch(
                notify({
                    message: 'AI Agent configuration saved!',
                    status: NotificationStatus.Success,
                })
            )
        } catch (error) {
            if (
                isAxiosError(error) &&
                _get(error, 'response.data.message') ===
                    'Email address already used by AI Agent on a different store.'
            ) {
                void dispatch(
                    notify({
                        message:
                            'Email address already used by AI Agent on a different store.',
                        status: NotificationStatus.Error,
                    })
                )
            } else {
                void dispatch(
                    notify({
                        message: 'Failed to save AI Agent configuration',
                        status: NotificationStatus.Error,
                    })
                )
            }
        }
    }

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

    const handleSelectEmailIntegration = (nextSelectedIds: number[]) => {
        // preserving the order of the selection
        const monitoredEmailIntegrations: StoreConfiguration['monitoredEmailIntegrations'] =
            []
        for (const id of nextSelectedIds) {
            const emailIntegration = emailIntegrations.find(
                (integration) => integration.id === id
            )
            if (emailIntegration) {
                monitoredEmailIntegrations.push({
                    id: emailIntegration.id,
                    email: emailIntegration.meta.address,
                })
            }
        }
        updateValue('monitoredEmailIntegrations', monitoredEmailIntegrations)
    }

    const handleToneOfVoiceChange = (toneOfVoiceLabel: Value) => {
        if (
            toneOfVoiceLabel === ToneOfVoice.Custom &&
            (!formValues.customToneOfVoiceGuidance ||
                formValues.customToneOfVoiceGuidance?.length === 0)
        ) {
            updateValue(
                'customToneOfVoiceGuidance',
                INITIAL_FORM_VALUES.customToneOfVoiceGuidance
            )
        }
        updateValue('toneOfVoice', toneOfVoiceLabel.toString())
    }

    const isAIAgentToggled = isAiAgentEnabled(
        formValues.deactivatedDatetime !== undefined
            ? formValues.deactivatedDatetime
            : INITIAL_FORM_VALUES.deactivatedDatetime
    )

    const aiAgentMode = useMemo(() => {
        if (isAIAgentToggled) {
            if (formValues.trialModeActivatedDatetime === null) {
                return 'enabled'
            }

            return 'trial'
        }

        return 'disabled'
    }, [isAIAgentToggled, formValues.trialModeActivatedDatetime])

    const isHandoffToggled = isHandoffEnabled(
        formValues.silentHandover !== null
            ? formValues.silentHandover
            : INITIAL_FORM_VALUES.silentHandover
    )

    const isCustomToneOfVoiceSelected =
        formValues.toneOfVoice === ToneOfVoice.Custom

    const snippetHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'snippet',
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

    const onSubmit = () => {
        void handleOnSave()
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
    ])

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleOnSave}
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
                    <div className={css.formGroup}>
                        {trialModeAvailable ? (
                            <RadioFieldSet
                                name="ai-agent-trial-mode"
                                options={[
                                    {
                                        caption:
                                            'Answer customer questions immediately, even outside business hours.',
                                        label: 'Directly respond to customers',
                                        value: 'enabled',
                                    },
                                    {
                                        caption:
                                            'Draft messages for your agents to review and edit before sending. This mode is only available for a limited period of time.',
                                        label: 'Draft responses for agents to review before sending',
                                        value: 'trial',
                                    },
                                    {
                                        caption:
                                            'AI Agent won’t generate any responses.',
                                        label: 'Disabled',
                                        value: 'disabled',
                                    },
                                ]}
                                selectedValue={aiAgentMode}
                                onChange={(value) => {
                                    switch (value) {
                                        case 'enabled':
                                            updateValue(
                                                'deactivatedDatetime',
                                                null
                                            )
                                            updateValue(
                                                'trialModeActivatedDatetime',
                                                null
                                            )
                                            break

                                        case 'trial':
                                            updateValue(
                                                'deactivatedDatetime',
                                                null
                                            )
                                            updateValue(
                                                'trialModeActivatedDatetime',
                                                new Date().toISOString()
                                            )
                                            break

                                        case 'disabled':
                                            updateValue(
                                                'deactivatedDatetime',
                                                new Date().toISOString()
                                            )
                                            updateValue(
                                                'trialModeActivatedDatetime',
                                                null
                                            )
                                            break
                                    }
                                }}
                            />
                        ) : (
                            <ToggleInput
                                isToggled={isAIAgentToggled}
                                darkenCaption
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
                                Enable AI Agent for email
                            </ToggleInput>
                        )}
                    </div>

                    <div className={css.formGroup}>
                        <Label
                            className={css.label}
                            style={{marginTop: '32px'}}
                        >
                            Tone of voice
                            <IconTooltip className={css.icon}>
                                Examples of tone of voice:
                                <br />
                                <ul>
                                    <li>
                                        <b>Friendly</b>: "Hi, could you please
                                        send a picture of the damaged items?
                                        Thank you!"
                                    </li>
                                    <li>
                                        <b>Professional</b>: "Hello, could you
                                        provide a photo of the damaged items?
                                        Regards."
                                    </li>
                                    <li>
                                        <b>Sophisticated</b>: "Hello, kindly
                                        provide an image of the damaged articles
                                        at your earliest convenience. Many
                                        thanks."
                                    </li>
                                    <li>
                                        <b>Custom</b>: "Add you own
                                        instructions."
                                    </li>
                                </ul>
                            </IconTooltip>
                        </Label>
                        <div data-candu-id="ai-agent-configuration-tone-of-voice">
                            <SelectField
                                fullWidth
                                showSelectedOption
                                value={
                                    formValues.toneOfVoice !== null
                                        ? formValues.toneOfVoice
                                        : INITIAL_FORM_VALUES.toneOfVoice
                                }
                                onChange={handleToneOfVoiceChange}
                                options={Object.values(ToneOfVoice).map(
                                    (toneOfVoice) => ({
                                        label: toneOfVoice,
                                        value: toneOfVoice,
                                    })
                                )}
                                dropdownMenuClassName={css.longDropdown}
                            />
                        </div>
                        <div className={css.formInputFooterInfo}>
                            Select a tone of voice for AI Agent to use with
                            customers.
                        </div>
                        {isCustomToneOfVoiceSelected && (
                            <div className={css.customToneOfVoiceGuidance}>
                                <TextArea
                                    autoRowHeight={true}
                                    placeholder="Custom tone of voice"
                                    maxLength={CUSTOM_TONE_OF_VOICE_MAX_LENGTH}
                                    value={
                                        formValues.customToneOfVoiceGuidance ??
                                        undefined
                                    }
                                    onChange={(value: unknown) => {
                                        if (typeof value !== 'string') return
                                        updateValue(
                                            'customToneOfVoiceGuidance',
                                            value
                                        )
                                    }}
                                />
                                <div className={css.formInputFooterInfo}>
                                    Give your AI Agent specific instructions to
                                    always follow. For example things to always
                                    say, things to never mention.
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <ConfigurationSection
                    title="Knowledge"
                    isRequired
                    subtitle="Select a Help Center or add at least one URL in order to enable AI Agent."
                >
                    <div className={css.formGroup}>
                        <Label className={css.label}>Help Center</Label>
                        <HelpCenterSelect
                            helpCenter={selectedHelpCenter}
                            setHelpCenterId={setHelpCenterId}
                            helpCenters={faqHelpCenters}
                            withEmptyItemSelection
                        />
                        <div className={css.formInputFooterInfo}>
                            Select a Help Center to connect to AI Agent.
                        </div>
                    </div>

                    {snippetHelpCenter ? (
                        <CreatePublicSourcesSection
                            helpCenterId={snippetHelpCenter.id}
                            onPublicURLsChanged={handlePublicURLsChange}
                            shopName={shopName}
                        />
                    ) : null}
                </ConfigurationSection>

                <section>
                    <h2
                        className={css.sectionHeader}
                        data-candu-id="ai-agent-configuration-email-settings"
                    >
                        Email settings
                    </h2>
                    <div className={css.formGroup}>
                        <Label isRequired={true} className={css.label}>
                            AI Agent responds to tickets sent to the following
                            email addresses
                        </Label>
                        <EmailIntegrationListSelection
                            selectedIds={
                                formValues.monitoredEmailIntegrations !== null
                                    ? formValues.monitoredEmailIntegrations.map(
                                          (integration) => integration.id
                                      )
                                    : INITIAL_FORM_VALUES.monitoredEmailIntegrations
                            }
                            onSelectionChange={handleSelectEmailIntegration}
                            emailItems={emailItems}
                        />
                        <div className={css.formInputFooterInfo}>
                            Select one or more email addresses for AI Agent to
                            use.
                        </div>
                    </div>

                    <div className={css.formGroup}>
                        <Label
                            isRequired={true}
                            className={css.subsectionHeader}
                        >
                            Email signature
                            <IconTooltip className={css.icon}>
                                This will override the current email signature
                                in your email settings.
                            </IconTooltip>
                        </Label>
                        <TextArea
                            id="signature-text-area"
                            placeholder="AI Agent email signature"
                            value={
                                formValues.signature !== null
                                    ? formValues.signature
                                    : INITIAL_FORM_VALUES.signature
                            }
                            onChange={(value: unknown) => {
                                if (typeof value !== 'string') return
                                updateValue('signature', value)
                            }}
                            maxLength={SIGNATURE_MAX_LENGTH}
                        />
                        <div className={css.formInputFooterInfo}>
                            At the end of emails you can disclose that the
                            message was created by AI, or provide a custom name
                            for AI Agent. Do not include greetings (e.g. "Best
                            regards"). Greetings will already be included in the
                            message above the signature.
                        </div>
                    </div>
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
                            darkenCaption
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
                            placeholder="Topic"
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
                    </h2>
                    <div
                        className={css.sectionDescription}
                        style={{marginBottom: '16px'}}
                    >
                        Define when AI Agent should tag incoming tickets.
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
                        onClick={handleOnSave}
                        isDisabled={isLoading || (!isFormDirty && !isCreate)}
                        className="mb-3"
                    >
                        Save Changes
                    </Button>
                </section>
            </form>
        </>
    )
}

const CreatePublicSourcesSection = ({
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
