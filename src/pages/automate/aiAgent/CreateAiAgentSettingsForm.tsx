import React, {
    ComponentProps,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from 'react'
import {List} from 'immutable'
import {isAxiosError} from 'axios'
import {Label} from '@gorgias/ui-kit'

import _get from 'lodash/get'

import {useQueryClient} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import {Value} from 'pages/common/forms/SelectField/types'
import {FeatureFlagKey} from 'config/featureFlags'
import ToggleInput from '../../common/forms/ToggleInput'
import useId from '../../../hooks/useId'
import useAppSelector from '../../../hooks/useAppSelector'
import {
    CreateStoreConfigurationPayload,
    StoreConfiguration,
    Tag,
} from '../../../models/aiAgent/types'
import Button from '../../common/components/button/Button'
import {getHelpCenterFAQList} from '../../../state/entities/helpCenter/helpCenters'
import {getIntegrationsByTypes} from '../../../state/integrations/selectors'
import {EMAIL_INTEGRATION_TYPES} from '../../../constants/integration'
import {EmailIntegration} from '../../../models/integration/types'
import SelectField from '../../common/forms/SelectField/SelectField'
import ListField from '../../common/forms/ListField'
import UnsavedChangesPrompt from '../../common/components/UnsavedChangesPrompt'
import HelpCenterSelect, {
    EMPTY_HELP_CENTER_ID,
} from '../common/components/HelpCenterSelect'
import TextArea from '../../common/forms/TextArea'
import {
    storeConfigurationKeys,
    useCreateStoreConfigurationPure,
} from '../../../models/aiAgent/queries'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'
import useAppDispatch from '../../../hooks/useAppDispatch'
import css from './AiAgentStoreView.less'
import {
    MAX_EXCLUDED_TOPICS,
    EXCLUDED_TOPIC_MAX_LENGTH,
    SIGNATURE_MAX_LENGTH,
    DEFAULT_AI_AGENT_ENABLED_RATE,
    ToneOfVoice,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
} from './constants'
import {EmailIntegrationListSelection} from './components/EmailIntegrationListSelection'
import {AutoTagList} from './components/AutoTagList'
import {FormValues, ValidFormValues} from './types'
import {filterNonNull, isAiAgentEnabled, isHandoffEnabled} from './util'
import {
    BEGINNER_COVERAGE_RATE,
    LevelOfCoverage,
} from './components/LevelOfCoverage/LevelOfCoverage'
import {AIAgentIntroduction} from './components/AIAgentIntroduction/AIAgentIntroduction'
import {ConfigurationSection} from './components/ConfigurationSection/ConfigurationSection'
import {PublicSourcesSection} from './components/PublicSourcesSection/PublicSourcesSection'
import {useAiAgentHelpCenter} from './hooks/useAiAgentHelpCenter'
import {
    useConfigurationForm,
    validateConfigurationFormValues,
} from './hooks/useConfigurationForm'
import {usePublicResources} from './hooks/usePublicResources'
import TagList from './components/TicketTag/TagList'

const INITIAL_FORM_VALUES = {
    deactivatedDatetime: new Date().toISOString(),
    ticketSampleRate: BEGINNER_COVERAGE_RATE,
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
const createStoreConfigurationFromFormValues = (
    storeName: string,
    formValues: ValidFormValues
): CreateStoreConfigurationPayload => {
    const {
        helpCenterId,
        ticketSampleRate,
        deactivatedDatetime,
        monitoredEmailIntegrations,
        ...restOfFormValues
    } = formValues

    const monitoredEmailIntegrationDetails = {
        monitoredEmailIntegrations,
    }

    const ticketSampleRateDetails = {
        ticketSampleRate: ticketSampleRate!,
    }

    const dirtyFormValues = filterNonNull(restOfFormValues)

    const signature =
        formValues.signature === null
            ? INITIAL_FORM_VALUES.signature
            : formValues.signature

    return {
        storeName,
        ...ticketSampleRateDetails,
        ...monitoredEmailIntegrationDetails,
        ...dirtyFormValues,
        deactivatedDatetime: deactivatedDatetime as string | null,
        customToneOfVoiceGuidance:
            formValues.toneOfVoice === ToneOfVoice.Custom
                ? formValues.customToneOfVoiceGuidance
                : null,
        signature,
        helpCenterId,
    }
}
type CreateAiAgentSettingsFormProps = {
    shopName: string
    accountDomain: string
}

export const CreateAiAgentSettingsForm = ({
    shopName,
    accountDomain,
}: CreateAiAgentSettingsFormProps) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const isWebsiteKnowledgeEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentWebsiteKnowledge]

    const isNewTicketTaggingEnabled: boolean =
        useFlags()[FeatureFlagKey.AiAgentSettingsTicketTaggingRevamp] ?? false

    /**
     * Global state retrieval
     */
    const faqHelpCenters = useAppSelector(getHelpCenterFAQList)

    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    ) as EmailIntegration[]
    const emailItems = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))
    }, [emailIntegrations])

    const {mutateAsync: createStoreConfiguration, isLoading: isCreateLoading} =
        useCreateStoreConfigurationPure()
    /**
     * Form states and handlers
     */

    const defaultFormValues: Partial<FormValues> = useMemo(
        () => ({
            ticketSampleRate: INITIAL_FORM_VALUES.ticketSampleRate,
        }),
        []
    )

    const {formValues, isFormDirty, resetForm, updateValue} =
        useConfigurationForm(defaultFormValues)
    const latestSampleRateRef = useRef(DEFAULT_AI_AGENT_ENABLED_RATE)
    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`

    const handleOnSave = async () => {
        let validFormValues: ValidFormValues
        try {
            validFormValues = validateConfigurationFormValues(
                formValues,
                isWebsiteKnowledgeEnabled ?? false
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

        const configurationToSubmit = createStoreConfigurationFromFormValues(
            shopName,
            validFormValues
        )

        await createStoreConfiguration([accountDomain, configurationToSubmit], {
            onSuccess: () => {
                void queryClient.invalidateQueries({
                    queryKey: storeConfigurationKeys.detail(shopName),
                })

                void dispatch(
                    notify({
                        message: 'AI Agent configuration saved!',
                        status: NotificationStatus.Success,
                    })
                )
            },
            onError: (error) => {
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
            },
        })
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

    const isHandoffToggled = isHandoffEnabled(
        formValues.silentHandover !== null
            ? formValues.silentHandover
            : INITIAL_FORM_VALUES.silentHandover
    )

    const isSkipSampleRateEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentSkipSampleRate]

    const isCustomToneOfVoiceSelected =
        formValues.toneOfVoice === ToneOfVoice.Custom

    const snippetHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'snippet',
    })

    const handlePublicURLsChange = useCallback(
        (publicURLs: string[]) => {
            updateValue('publicURLs', publicURLs)
        },
        [updateValue]
    )

    return (
        <>
            <UnsavedChangesPrompt
                onSave={handleOnSave}
                when={isFormDirty}
                onDiscard={resetForm}
                shouldRedirectAfterSave={true}
            />

            <div className={css.automateView}>
                <AIAgentIntroduction />
                <section>
                    <h2 className={css.sectionHeader}>General settings</h2>
                    <div className={css.formGroup}>
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
                            }}
                            caption="When enabled, you can find tickets handled by AI Agent in your ticket views."
                            name={toggleAiAgentId}
                        >
                            Enable AI Agent for email
                        </ToggleInput>
                    </div>

                    {isSkipSampleRateEnabled ? null : (
                        <LevelOfCoverage
                            coverageRate={
                                formValues.ticketSampleRate !== null
                                    ? formValues.ticketSampleRate
                                    : BEGINNER_COVERAGE_RATE
                            }
                            onCoverageRateChange={(value: number) => {
                                latestSampleRateRef.current = value
                                updateValue('ticketSampleRate', value)
                            }}
                        />
                    )}

                    {!isWebsiteKnowledgeEnabled || !snippetHelpCenter ? (
                        <div className={css.formGroup}>
                            <Label isRequired={true} className={css.label}>
                                Help Center
                            </Label>
                            <HelpCenterSelect
                                helpCenter={selectedHelpCenter}
                                setHelpCenterId={setHelpCenterId}
                                helpCenters={faqHelpCenters}
                            />
                            <div className={css.formInputFooterInfo}>
                                Select a Help Center to connect to AI Agent.
                            </div>
                        </div>
                    ) : null}

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

                {isWebsiteKnowledgeEnabled && (
                    <ConfigurationSection
                        title="Knowledge"
                        subtitle="Select a Help Center or add at least one URL in order to enable AI Agent."
                    >
                        <div className={css.formGroup}>
                            <Label isRequired={true} className={css.label}>
                                Help Center
                            </Label>
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
                )}

                <section>
                    <h2 className={css.sectionHeader}>Email settings</h2>
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

                    {isNewTicketTaggingEnabled ? (
                        <TagList
                            tags={formValues.tags ?? []}
                            onTagsUpdate={(tags: Tag[]) => {
                                updateValue('tags', tags)
                            }}
                        />
                    ) : (
                        <AutoTagList
                            tags={formValues.tags ?? []}
                            onTagUpdate={(tags: Tag[]) => {
                                updateValue('tags', tags)
                            }}
                        />
                    )}
                </section>

                <section>
                    <Button
                        onClick={handleOnSave}
                        isDisabled={isCreateLoading || !isFormDirty}
                        className="mb-3"
                    >
                        Save Changes
                    </Button>
                </section>
            </div>
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
