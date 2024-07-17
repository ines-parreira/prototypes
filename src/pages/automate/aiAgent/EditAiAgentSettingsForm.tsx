import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {List} from 'immutable'
import {isAxiosError} from 'axios'
import _get from 'lodash/get'
import {Label} from '@gorgias/ui-kit'

import {useQueryClient} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {reportError} from 'utils/errors'
import {Value} from 'pages/common/forms/SelectField/types'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import {FeatureFlagKey} from 'config/featureFlags'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import ToggleInput from '../../common/forms/ToggleInput'
import useId from '../../../hooks/useId'
import useAppSelector from '../../../hooks/useAppSelector'
import {StoreConfiguration, Tag} from '../../../models/aiAgent/types'
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
    useUpsertStoreConfigurationPure,
} from '../../../models/aiAgent/queries'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'
import useAppDispatch from '../../../hooks/useAppDispatch'
import css from './AiAgentStoreView.less'
import {
    MAX_EXCLUDED_TOPICS,
    EXCLUDED_TOPIC_MAX_LENGTH,
    SIGNATURE_MAX_LENGTH,
    ToneOfVoice,
    CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
} from './constants'
import {EmailIntegrationListSelection} from './components/EmailIntegrationListSelection/EmailIntegrationListSelection'
import {FormValues} from './types'
import {filterNonNull, isAiAgentEnabled, isHandoffEnabled} from './util'
import {
    LevelOfCoverage,
    getEffectiveTicketSampleRate,
} from './components/LevelOfCoverage/LevelOfCoverage'
import {AIAgentIntroduction} from './components/AIAgentIntroduction/AIAgentIntroduction'
import {PublicSourcesSection} from './components/PublicSourcesSection/PublicSourcesSection'
import {ConfigurationSection} from './components/ConfigurationSection/ConfigurationSection'
import {
    useConfigurationForm,
    validateConfigurationFormValues,
} from './hooks/useConfigurationForm'
import {usePublicResources} from './hooks/usePublicResources'
import TagList from './components/TicketTag/TagList'

const createStoreConfigurationFromFormValues = (
    storeConfig: StoreConfiguration,
    formValues: FormValues
): StoreConfiguration => {
    const {helpCenterId, ticketSampleRate, ...restOfFormValues} = formValues

    let ticketSampleRateValue: number

    // If the ticketSampleRate is not null, it means it has been touched by the user.
    if (ticketSampleRate !== null) {
        ticketSampleRateValue = getEffectiveTicketSampleRate(ticketSampleRate)
    } else {
        // if not, we fallback to the previous value, but re-compute the rate to
        // ensure we're using either the beginner or advanced rate
        // ex. previous value was 0.50, when saving the form, the value becomes ADVANCED = 1.00
        ticketSampleRateValue = getEffectiveTicketSampleRate(
            storeConfig.ticketSampleRate
        )
    }

    const dirtyFormValues = filterNonNull(restOfFormValues)

    const deactivatedDatetime =
        formValues.deactivatedDatetime === undefined
            ? storeConfig.deactivatedDatetime
            : formValues.deactivatedDatetime

    return {
        ...storeConfig,
        ...dirtyFormValues,
        ticketSampleRate: ticketSampleRateValue,
        helpCenterId,
        deactivatedDatetime,
    }
}

type EditAiAgentSettingsFormProps = {
    shopName: string
    accountDomain: string
    storeConfiguration: StoreConfiguration
}

export const EditAiAgentSettingsForm = ({
    shopName,
    accountDomain,
    storeConfiguration,
}: EditAiAgentSettingsFormProps) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()

    const isSkipSampleRateEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentSkipSampleRate]

    const {mutateAsync: upsertStoreConfiguration, isLoading: isUpsertLoading} =
        useUpsertStoreConfigurationPure({
            onSuccess: () => {
                void queryClient.invalidateQueries({
                    queryKey: storeConfigurationKeys.detail(shopName),
                })
            },
        })
    const {sourceItems} = usePublicResources({
        helpCenterId: storeConfiguration.snippetHelpCenterId,
    })

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

    /**
     * Form states and handlers
     */
    const publicURLs = useMemo(
        () =>
            sourceItems
                ?.filter((source) => source.status !== 'error')
                .map((source) => source.url)
                .filter((url): url is string => !!url),
        [sourceItems]
    )

    // TODO: Refactor to use all fields from storeConfiguration as default values
    const defaultFormValues = useMemo(
        () => ({
            helpCenterId: storeConfiguration.helpCenterId,
            monitoredEmailIntegrations:
                storeConfiguration.monitoredEmailIntegrations,
            deactivatedDatetime: storeConfiguration.deactivatedDatetime,
            silentHandover: storeConfiguration.silentHandover,
            tags: storeConfiguration.tags,
            publicURLs,
        }),
        [storeConfiguration, publicURLs]
    )
    const {formValues, isFormDirty, resetForm, updateValue} =
        useConfigurationForm(defaultFormValues)
    const initialSampleRatePercent = storeConfiguration.ticketSampleRate * 100
    const latestSampleRateRef = useRef(initialSampleRatePercent)
    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`
    const [publicUrls, setPublicUrls] = useState<string[]>([])

    // Public URLS are not part of the form values, but we need to update the form values when the public URLs change
    useEffect(() => {
        if (publicURLs) {
            setPublicUrls(publicURLs)
        }
    }, [publicURLs, updateValue])

    const deactivateAiAgent = useCallback(async () => {
        const deactivatedDatetime = new Date().toISOString()
        updateValue('deactivatedDatetime', deactivatedDatetime)
        try {
            await upsertStoreConfiguration([
                accountDomain,
                {...storeConfiguration, deactivatedDatetime},
            ])
            void dispatch(
                notify({
                    message:
                        'AI Agent has been disabled, because no Knowledge source is connected.',
                    status: NotificationStatus.Warning,
                })
            )
        } catch (error) {
            // nothing to notify here for the user as we do silent disable AI Agent
            reportError(error, {
                tags: {team: AI_AGENT_SENTRY_TEAM},
                extra: {
                    context: 'Error during disabling AI Agent',
                },
            })
        }
    }, [
        accountDomain,
        storeConfiguration,
        updateValue,
        upsertStoreConfiguration,
        dispatch,
    ])

    const handleOnSave = async () => {
        let validFormValues: FormValues
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

        const configurationToSubmit = createStoreConfigurationFromFormValues(
            storeConfiguration,
            validFormValues
        )

        await upsertStoreConfiguration([accountDomain, configurationToSubmit], {
            onSuccess: () => {
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
        const selectedHelpCenterId = formValues.helpCenterId
        return helpCenter.id === selectedHelpCenterId
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
                storeConfiguration.customToneOfVoiceGuidance ??
                    CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE
            )
        } else {
            updateValue(
                'customToneOfVoiceGuidance',
                storeConfiguration.customToneOfVoiceGuidance
            )
        }
        updateValue('toneOfVoice', toneOfVoiceLabel.toString())
    }

    const handlePublicURLsChange = useCallback(
        (publicURLs: string[]) => {
            setPublicUrls(publicURLs)

            // Because it's possible to delete public URLs without saving the form, we should deactivate AI Agent when no knowledge base
            if (
                publicURLs.length === 0 &&
                storeConfiguration.helpCenterId === null
            ) {
                void deactivateAiAgent()
            }
        },
        [storeConfiguration.helpCenterId, deactivateAiAgent]
    )
    const isAIAgentToggled = isAiAgentEnabled(
        formValues.deactivatedDatetime !== undefined
            ? formValues.deactivatedDatetime
            : storeConfiguration.deactivatedDatetime
    )

    const isHandoffToggled = isHandoffEnabled(
        formValues.silentHandover !== null
            ? formValues.silentHandover
            : storeConfiguration.silentHandover
    )

    const isCustomToneOfVoiceSelected =
        formValues.toneOfVoice === ToneOfVoice.Custom ||
        (formValues.toneOfVoice === null &&
            storeConfiguration.toneOfVoice === ToneOfVoice.Custom)

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
                            onClick={() => {
                                updateValue(
                                    'deactivatedDatetime',
                                    isAIAgentToggled
                                        ? new Date().toISOString()
                                        : null
                                )
                            }}
                            caption="When enabled, you can find tickets handled by AI Agent in your ticket views."
                            dataCanduId="ai-agent-configuration-toggle"
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
                                    : storeConfiguration.ticketSampleRate
                            }
                            onCoverageRateChange={(value: number) => {
                                latestSampleRateRef.current = value
                                updateValue('ticketSampleRate', value)
                            }}
                        />
                    )}

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
                                        : storeConfiguration.toneOfVoice
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
                                        formValues.customToneOfVoiceGuidance !==
                                        null
                                            ? formValues.customToneOfVoiceGuidance
                                            : storeConfiguration.customToneOfVoiceGuidance ??
                                              CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE
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
                    subtitle="Select a Help Center or add at least one URL in order to enable AI Agent."
                    isRequired={true}
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

                    <PublicSourcesSection
                        helpCenterId={storeConfiguration.snippetHelpCenterId}
                        shopName={shopName}
                        onPublicURLsChanged={handlePublicURLsChange}
                        sourceItems={sourceItems}
                    />
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
                                    : storeConfiguration.monitoredEmailIntegrations.map(
                                          (integration) => integration.id
                                      )
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
                            placeholder="This response was created by AI"
                            value={
                                formValues.signature !== null
                                    ? formValues.signature
                                    : storeConfiguration.signature
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
                                        !storeConfiguration.silentHandover
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
                                    : storeConfiguration.excludedTopics
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
                        tags={
                            formValues.tags !== null
                                ? formValues.tags
                                : storeConfiguration.tags
                        }
                        onTagsUpdate={(tags: Tag[]) => {
                            updateValue('tags', tags)
                        }}
                    />
                </section>

                <section>
                    <Button
                        onClick={handleOnSave}
                        isDisabled={isUpsertLoading || !isFormDirty}
                        className="mb-3"
                    >
                        Save Changes
                    </Button>
                </section>
            </div>
        </>
    )
}
