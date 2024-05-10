import React, {useMemo, useRef, useState} from 'react'
import classnames from 'classnames'
import {List} from 'immutable'

import _isEqual from 'lodash/isEqual'

import {useQueryClient} from '@tanstack/react-query'
import {Link} from 'react-router-dom'
import {Value} from 'pages/common/forms/SelectField/types'
import IconTooltip from 'pages/common/forms/Label/IconTooltip'
import ToggleInput from '../../common/forms/ToggleInput'
import useId from '../../../hooks/useId'
import useAppSelector from '../../../hooks/useAppSelector'
import {StoreConfiguration, Tag} from '../../../models/aiAgent/types'
import Button from '../../common/components/button/Button'
import {getHelpCenterFAQList} from '../../../state/entities/helpCenter/helpCenters'
import Label from '../../common/forms/Label/Label'
import {getIntegrationsByTypes} from '../../../state/integrations/selectors'
import {EMAIL_INTEGRATION_TYPES} from '../../../constants/integration'
import {EmailIntegration} from '../../../models/integration/types'
import SelectField from '../../common/forms/SelectField/SelectField'
import ListField from '../../common/forms/ListField'
import UnsavedChangesPrompt from '../../common/components/UnsavedChangesPrompt'
import HelpCenterSelect from '../common/components/HelpCenterSelect'
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
    DEFAULT_FORM_VALUES,
    ToneOfVoice,
    CUSTOM_TONE_OF_VOICE_GUIDANCE_DEFAULT_VALUE,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
} from './constants'
import {EmailIntegrationListSelection} from './components/EmailIntegrationListSelection'
import {AutoTagList} from './components/AutoTagList'
import {FormValues} from './types'
import {
    convertPercentageToRate,
    convertRateToPercentage,
    filterNonNull,
    isAiAgentEnabled,
    isHandoffEnabled,
} from './util'

const createStoreConfigurationFromFormValues = (
    storeConfig: StoreConfiguration,
    formValues: FormValues
): StoreConfiguration => {
    const {helpCenter, ticketSampleRate, ...restOfFormValues} = formValues

    const helpCenterDetails:
        | Pick<
              StoreConfiguration,
              'helpCenterId' | 'helpCenterLocale' | 'helpCenterSubdomain'
          >
        | Record<string, never> = helpCenter
        ? {
              helpCenterId: helpCenter.id,
              helpCenterLocale: helpCenter.locale,
              helpCenterSubdomain: helpCenter.subdomain,
          }
        : {}

    let ticketSampleRateValue = storeConfig.ticketSampleRate
    if (ticketSampleRate !== null) {
        ticketSampleRateValue = convertPercentageToRate(ticketSampleRate)
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
        ...helpCenterDetails,
        deactivatedDatetime,
    }
}

const useFormValues = () => {
    // could have used a useReducer instead, but keeping it simple for now
    const [formValues, setFormValues] =
        useState<FormValues>(DEFAULT_FORM_VALUES)

    const resetForm = () => {
        setFormValues(DEFAULT_FORM_VALUES)
    }

    const isFormDirty = !_isEqual(formValues, DEFAULT_FORM_VALUES)

    function updateValue<Key extends keyof FormValues>(
        key: Key,
        value: FormValues[Key]
    ) {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    return {
        formValues,
        resetForm,
        isFormDirty,
        updateValue,
    }
}

const validateFormValues = (formValues: FormValues): FormValues => {
    if (formValues.signature !== null) {
        if (formValues.signature.length > SIGNATURE_MAX_LENGTH) {
            throw new Error(
                `Signature must be less than ${SIGNATURE_MAX_LENGTH} characters`
            )
        }

        if (formValues.signature.length === 0) {
            throw new Error('Signature can not be empty')
        }
    }

    if (
        formValues.excludedTopics !== null &&
        formValues.excludedTopics.length > 0
    ) {
        const hasEmptyFields = formValues.excludedTopics.some(
            (topic) => topic === ''
        )
        if (hasEmptyFields) {
            throw new Error('Excluded topic cannot be empty')
        }
        if (formValues.excludedTopics.length > MAX_EXCLUDED_TOPICS) {
            throw new Error(
                `Excluded topics must be less than ${MAX_EXCLUDED_TOPICS}`
            )
        }
        for (const topic of formValues.excludedTopics) {
            if (topic.length > EXCLUDED_TOPIC_MAX_LENGTH) {
                throw new Error(
                    `Excluded topics must be less than ${EXCLUDED_TOPIC_MAX_LENGTH} characters`
                )
            }
        }
    }

    if (formValues.tags !== null && formValues.tags.length > 0) {
        const hasEmptyFields = formValues.tags.some(
            (tag) => tag.name === '' || tag.description === ''
        )
        if (hasEmptyFields) {
            throw new Error('Tags must have a name and description')
        }
    }

    if (
        (!formValues.toneOfVoice ||
            formValues.toneOfVoice === ToneOfVoice.Custom) &&
        formValues.customToneOfVoiceGuidance?.length === 0
    ) {
        throw new Error('Custom tone of voice cannot be empty')
    }
    if (
        (!formValues.toneOfVoice ||
            formValues.toneOfVoice === ToneOfVoice.Custom) &&
        formValues.customToneOfVoiceGuidance &&
        formValues.customToneOfVoiceGuidance.length > 500
    ) {
        throw new Error(
            'Custom tone of voice should be less than 500 characters'
        )
    }

    return formValues
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

    const {mutateAsync: upsertStoreConfiguration, isLoading: isUpsertLoading} =
        useUpsertStoreConfigurationPure()
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

    const {formValues, isFormDirty, resetForm, updateValue} = useFormValues()
    const initialSampleRatePercent = storeConfiguration.ticketSampleRate * 100
    const latestSampleRateRef = useRef(initialSampleRatePercent)
    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`

    const handleOnSave = async () => {
        let validFormValues: FormValues
        try {
            validFormValues = validateFormValues(formValues)
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
                void queryClient.invalidateQueries({
                    queryKey: storeConfigurationKeys.detail(shopName),
                })

                void dispatch(
                    notify({
                        message: 'AI Agent configuration saved!',
                        status: NotificationStatus.Success,
                    })
                )

                resetForm()
            },
            onError: () => {
                void dispatch(
                    notify({
                        message: 'Failed to save AI Agent configuration',
                        status: NotificationStatus.Error,
                    })
                )
            },
        })
    }

    const selectedHelpCenter = faqHelpCenters.find((helpCenter) => {
        const selectedHelpCenterId =
            formValues.helpCenter !== null
                ? formValues.helpCenter.id
                : storeConfiguration.helpCenterId
        return helpCenter.id === selectedHelpCenterId
    })

    const setHelpCenterId = (id: number) => {
        const newSelectedHelpCenter = faqHelpCenters.find(
            (helpCenter) => helpCenter.id === id
        )

        if (!newSelectedHelpCenter) return
        updateValue('helpCenter', {
            id: newSelectedHelpCenter.id,
            locale: newSelectedHelpCenter.default_locale,
            subdomain: newSelectedHelpCenter.subdomain,
        })
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
                <section>
                    <h2 className={css.sectionHeader}>General</h2>
                    <div className={css.sectionDescription}>
                        AI Agent uses Help Center articles, Macros, Guidance and
                        Shopify data to automate responses, enabling your team
                        to reduce wait time and increase customer satisfaction.
                    </div>
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
                            name={toggleAiAgentId}
                            caption="When enabled AI will reply to tickets on your team’s behalf."
                        >
                            Enable AI Agent
                        </ToggleInput>
                    </div>

                    <div className={css.formGroup}>
                        <Label isRequired={true}>Help Center</Label>
                        <HelpCenterSelect
                            helpCenter={selectedHelpCenter}
                            setHelpCenterId={setHelpCenterId}
                            helpCenters={faqHelpCenters}
                        />
                        <div className={css.formInputFooterInfo}>
                            Select a Help Center to connect to AI Agent.
                        </div>
                    </div>

                    <div className={css.formGroup}>
                        <Label>
                            Tone of voice
                            <IconTooltip>
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

                <section>
                    <h2
                        className={classnames(
                            css.sectionHeader,
                            css.emailSectionHeader
                        )}
                    >
                        Email
                    </h2>
                    <div className={css.formGroup}>
                        <Label>Email ticket coverage</Label>
                        <SelectField
                            fullWidth
                            showSelectedOption
                            value={
                                formValues.ticketSampleRate !== null
                                    ? formValues.ticketSampleRate
                                    : convertRateToPercentage(
                                          storeConfiguration.ticketSampleRate
                                      )
                            }
                            onChange={(value) => {
                                if (typeof value === 'number') {
                                    latestSampleRateRef.current = value
                                    updateValue('ticketSampleRate', value)
                                }
                            }}
                            options={[
                                {label: '10%', value: 10},
                                {label: '50%', value: 50},
                                {label: '100%', value: 100},
                            ]}
                            dropdownMenuClassName={css.longDropdown}
                        />
                        <div className={css.formInputFooterInfo}>
                            Select the percentage of email tickets AI Agent
                            should attempt to resolve.
                        </div>
                    </div>

                    <div className={css.formGroup}>
                        <Label isRequired={true}>
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
                        <Label isRequired={true}>
                            Email signature
                            <IconTooltip>
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
                    <h2 className={css.sectionHeader}>
                        Exclusion and handover
                    </h2>
                    <div className={css.sectionDescription}>
                        Exclude specific tickets from AI Agent handling and
                        configure automatic handovers for uncertain responses or
                        specific topics.
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
                            caption="AI Agent will promptly tell customers their request is being handed over for further assistance."
                        >
                            Tell customers when handing over
                        </ToggleInput>
                    </div>
                    <div className={css.formGroup}>
                        <Label>Handover topics</Label>
                        <div className={css.formGroupDescription}>
                            AI Agent will always hand over tickets when it
                            detects a handover topic.
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
                            maxLength={EXCLUDED_TOPIC_MAX_LENGTH}
                            maxItems={MAX_EXCLUDED_TOPICS}
                            addLabel="Add topic"
                        />
                    </div>
                    <div className={css.formGroup}>
                        <Label>
                            Prevent AI Agent from triggering on specific tickets
                            <i
                                id="unassign-info"
                                className={classnames(
                                    'material-icons',
                                    css.warningIcon
                                )}
                            >
                                warning_outline
                            </i>
                        </Label>
                        <div className={css.preventAIAgentTriggerDescription}>
                            Install the "
                            <Link to="/app/settings/rules/library?auto-tag-ai-ignore">
                                Prevent AI Agent from answering{' '}
                            </Link>
                            " Rule Template. This Rule lets you add conditions
                            to prevent the AI Agent from responding (e.g.
                            tickets from certain email addresses, tickets with
                            certain tags, etc.).
                        </div>
                    </div>
                </section>
                <section>
                    <h2 className={css.sectionHeader}>AI ticket tagging</h2>
                    <div className={css.sectionDescription}>
                        Define when AI Agent should tag incoming tickets.
                    </div>

                    <AutoTagList
                        tags={
                            formValues.tags !== null
                                ? formValues.tags
                                : storeConfiguration.tags
                        }
                        onTagUpdate={(tags: Tag[]) => {
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
