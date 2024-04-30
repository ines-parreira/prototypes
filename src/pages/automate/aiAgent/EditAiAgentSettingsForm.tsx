import React, {useMemo, useRef, useState} from 'react'
import {List} from 'immutable'
import cn from 'classnames'

import _isEqual from 'lodash/isEqual'

import {useQueryClient} from '@tanstack/react-query'
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
    if (
        formValues.signature !== null &&
        formValues.signature.length > SIGNATURE_MAX_LENGTH
    ) {
        throw new Error(
            `Signature must be less than ${SIGNATURE_MAX_LENGTH} characters`
        )
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
                            onChange={(toneOfVoiceLabel) => {
                                updateValue(
                                    'toneOfVoice',
                                    toneOfVoiceLabel.toString()
                                )
                            }}
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
                    </div>
                </section>

                <section>
                    <h2
                        className={cn(
                            css.sectionHeader,
                            css.emailSectionHeader
                        )}
                    >
                        Email
                    </h2>
                    <div className={css.formGroup}>
                        <Label isRequired={true}>
                            Email ticket coverage
                            <IconTooltip>
                                AI Agent will attempt to respond to the
                                specified percentage of email tickets.
                            </IconTooltip>
                        </Label>
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
                            Select the ticket percentage you woud like AI Agent
                            to process.
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
                            Select the email address you would like AI Agent to
                            use.
                        </div>
                    </div>

                    <div className={css.formGroup}>
                        <Label isRequired={true}>
                            Enter the signature that should be used by the AI
                            Agent
                            <IconTooltip>
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
                                    : storeConfiguration.signature
                            }
                            onChange={(value: unknown) => {
                                if (typeof value !== 'string') return
                                updateValue('signature', value)
                            }}
                            maxLength={SIGNATURE_MAX_LENGTH}
                        />
                        <div className={css.formInputFooterInfo}>
                            Provide a name for AI agent to use. Do not include
                            greetings (e.g. "Best regards"). Greetings will be
                            generated by AI Agent as part of the response.
                        </div>
                    </div>
                </section>

                <section>
                    <h2 className={css.sectionHeader}> Handover </h2>
                    <div className={css.sectionDescription}>
                        Define when and how AI Agent should hand over tickets to
                        your team.
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
                            caption="Let customers know that their inquiry will be transferred to an agent."
                        >
                            Send message before handover
                        </ToggleInput>
                    </div>
                    <div className={css.formGroup}>
                        <Label>Excluded topics</Label>
                        <div className={css.formGroupDescription}>
                            When customer inquiries contain the following
                            topics, AI Agent will not respond and hand over to
                            an agent.
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
                </section>
                <section>
                    <h2 className={css.sectionHeader}>Auto-tag</h2>
                    <div className={css.sectionDescription}>
                        Define when AI Agent should auto-tag tickets.
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
