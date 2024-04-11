import React, {useMemo, useRef, useState} from 'react'
import {List} from 'immutable'

import _isEqual from 'lodash/isEqual'

import {useQueryClient} from '@tanstack/react-query'
import ToggleInput from '../../common/forms/ToggleInput'
import useId from '../../../hooks/useId'
import HeaderTitle from '../../common/components/HeaderTitle'
import useAppSelector from '../../../hooks/useAppSelector'
import {StoreConfiguration, Tag} from '../../../models/aiAgent/types'
import Button from '../../common/components/button/Button'
import {getHelpCenterList} from '../../../state/entities/helpCenter/helpCenters'
import Label from '../../common/forms/Label/Label'
import {getIntegrationsByTypes} from '../../../state/integrations/selectors'
import {EMAIL_INTEGRATION_TYPES} from '../../../constants/integration'
import {EmailIntegration} from '../../../models/integration/types'
import SelectField from '../../common/forms/SelectField/SelectField'
import ListField from '../../common/forms/ListField'
import UnsavedChangesPrompt from '../../common/components/UnsavedChangesPrompt'
import HelpCenterSelect from '../common/components/HelpCenterSelect'
import TextArea from '../../common/forms/TextArea'
import NumberInput from '../../common/forms/input/NumberInput'
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
    DEFAULT_AI_AGENT_DISABLED_RATE,
    ToneOfVoice,
    DEFAULT_AI_AGENT_ENABLED_RATE,
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

    return {
        ...storeConfig,
        ...dirtyFormValues,
        ticketSampleRate: ticketSampleRateValue,
        ...helpCenterDetails,
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
    const helpCenters = useAppSelector(getHelpCenterList)
    const faqHelpCenters = useMemo(() => {
        return helpCenters.filter((helpCenter) => helpCenter.type === 'faq')
    }, [helpCenters])

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
    const latestSampleRateRef = useRef(
        storeConfiguration.ticketSampleRate === 0
            ? DEFAULT_AI_AGENT_ENABLED_RATE
            : initialSampleRatePercent
    )
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

    const selectedHelpCenter = helpCenters.find((helpCenter) => {
        const selectedHelpCenterId =
            formValues.helpCenter !== null
                ? formValues.helpCenter.id
                : storeConfiguration.helpCenterId
        return helpCenter.id === selectedHelpCenterId
    })

    const isAIAgentToggled = isAiAgentEnabled(
        formValues.ticketSampleRate !== null
            ? formValues.ticketSampleRate
            : storeConfiguration.ticketSampleRate
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
                <div className={css.aiAgentToggle}>
                    <ToggleInput
                        isToggled={isAIAgentToggled}
                        onClick={() => {
                            updateValue(
                                'ticketSampleRate',
                                isAIAgentToggled
                                    ? DEFAULT_AI_AGENT_DISABLED_RATE
                                    : latestSampleRateRef.current
                            )
                        }}
                        name={toggleAiAgentId}
                    >
                        Enable AI Agent
                    </ToggleInput>
                </div>

                <div>
                    <Label className={css.label}>
                        Select the desired percentage of emails managed by the
                        AI Agent
                    </Label>
                    <NumberInput
                        className={css.numberInput}
                        onChange={(value?: number) => {
                            if (value === undefined) return
                            latestSampleRateRef.current = value
                            updateValue('ticketSampleRate', value)
                        }}
                        value={
                            formValues.ticketSampleRate !== null
                                ? formValues.ticketSampleRate
                                : convertRateToPercentage(
                                      storeConfiguration.ticketSampleRate
                                  )
                        }
                        min={0}
                        max={100}
                        placeholder="30"
                        suffix={
                            <div style={{color: '#99A5B6', lineHeight: '20px'}}>
                                /100%
                            </div>
                        }
                    />
                </div>

                <div className={css.knowledgeSection}>
                    <HeaderTitle className={css.header} title="Knowledge" />
                    <Label className={css.label} isRequired>
                        Select which Help Center should be used by the AI Agent
                    </Label>
                    <HelpCenterSelect
                        helpCenter={selectedHelpCenter}
                        setHelpCenterId={(id: number) => {
                            const newSelectedHelpCenter = helpCenters.find(
                                (helpCenter) => helpCenter.id === id
                            )

                            if (!newSelectedHelpCenter) return
                            updateValue('helpCenter', {
                                id: newSelectedHelpCenter.id,
                                locale: newSelectedHelpCenter.default_locale,
                                subdomain: newSelectedHelpCenter.subdomain,
                            })
                        }}
                        helpCenters={faqHelpCenters}
                    />
                </div>
                <div className={css.customizeSection}>
                    <HeaderTitle className={css.header} title="Customize" />

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
                        onSelectionChange={(nextSelectedIds: number[]) => {
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
                            updateValue(
                                'monitoredEmailIntegrations',
                                monitoredEmailIntegrations
                            )
                        }}
                        emailItems={emailItems}
                    />

                    <Label className={css.label}>
                        Enter the signature that should be used by the AI Agent
                    </Label>
                    <TextArea
                        id="signature-text-area"
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
                    <Label className={css.label}>
                        Select the tone of voice that should be used by the AI
                        Agent
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
                </div>
                <div className={css.handoffSection}>
                    <HeaderTitle className={css.header} title="Handoff" />
                    <Label className={css.label}>
                        Select whether the AI Agent should send a message to the
                        customer before handing over the ticket to your team
                    </Label>
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
                    >
                        Send message before handover
                    </ToggleInput>
                    <Label className={css.label}>
                        List the topics which should not be handled by the AI
                        Agent
                    </Label>
                    <ListField
                        className={css.container}
                        items={List(
                            formValues.excludedTopics !== null
                                ? formValues.excludedTopics
                                : storeConfiguration.excludedTopics
                        )}
                        onChange={(excludedTopics: List<string>) => {
                            updateValue('excludedTopics', excludedTopics.toJS())
                        }}
                        maxLength={EXCLUDED_TOPIC_MAX_LENGTH}
                        maxItems={MAX_EXCLUDED_TOPICS}
                        addLabel="Add a topic"
                        placeholder=" "
                    />
                </div>
                <div className={css.autoTagSection}>
                    <HeaderTitle className={css.header} title="Auto Tag" />
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
                </div>
                <Button
                    onClick={handleOnSave}
                    isDisabled={isUpsertLoading || !isFormDirty}
                    className="mb-3"
                >
                    Save Changes
                </Button>
            </div>
        </>
    )
}
