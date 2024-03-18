import React, {useMemo, useState} from 'react'
import {List} from 'immutable'

import _isEqual from 'lodash/isEqual'

import {useQueryClient} from '@tanstack/react-query'
import Loader from 'pages/common/components/Loader/Loader'
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
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
    useCreateStoreConfigurationPure,
    useGetStoreConfigurationPure,
    useUpsertStoreConfigurationPure,
} from '../../../models/aiAgent/queries'
import {notify} from '../../../state/notifications/actions'
import {NotificationStatus} from '../../../state/notifications/types'
import useAppDispatch from '../../../hooks/useAppDispatch'
import css from './AiAgentStoreView.less'
import {
    TONE_OF_VOICE_LABEL_TO_VALUE,
    TONE_OF_VOICE_LABELS,
    TONE_OF_VOICE_VALUE_TO_LABEL,
    MAX_EXCLUDED_TOPICS,
    EXCLUDED_TOPIC_MAX_LENGTH,
    SIGNATURE_MAX_LENGTH,
} from './constants'
import {EmailIntegrationListSelection} from './components/EmailIntegrationListSelection'
import {AutoTagList} from './components/AutoTagList'

const DEFAULT_AI_AGENT_DISABLED_RATE = 0
const DEFAULT_AI_AGENT_ENABLED_RATE = 30

const isAiAgentEnabled = (ticketSampleRate: number) => {
    return ticketSampleRate > 0
}

const isHandoffEnabled = (silentHandover: boolean) => !silentHandover

type FormValues = {
    ticketSampleRate: number
    silentHandover: boolean
    monitoredEmailIntegrations: {id: number; email: string}[]
    tags: Tag[]
    excludedTopics: string[]
    signature: string
    toneOfVoice: string
    helpCenter: {id: number; locale: string; subdomain: string} | null
}
const DEFAULT_FORM_VALUES = {
    ticketSampleRate: 0,
    silentHandover: false,
    monitoredEmailIntegrations: [],
    tags: [],
    excludedTopics: [],
    signature: '',
    toneOfVoice: TONE_OF_VOICE_LABEL_TO_VALUE['Friendly'],
    helpCenter: null,
}

const createStoreConfigurationToSubmit = (
    storeName: string,
    formValues: FormValues,
    serverStoreConfig: StoreConfiguration | undefined
) => {
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

    let ticketSampleRateValue = convertPercentageToFloat(ticketSampleRate)

    if (
        serverStoreConfig &&
        ticketSampleRate === DEFAULT_FORM_VALUES.ticketSampleRate
    ) {
        ticketSampleRateValue = serverStoreConfig.ticketSampleRate
    }

    const dirtyFormValues: Record<any, any> = Object.assign(
        {},
        ...Object.entries(restOfFormValues).map(([key, value]) => {
            if (_isEqual(value, DEFAULT_FORM_VALUES[key as keyof FormValues])) {
                return {}
            }

            return {[key]: value}
        })
    )

    const config = {
        storeName,
        ...serverStoreConfig,
        ticketSampleRate: ticketSampleRateValue,
        ...helpCenterDetails,
        ...dirtyFormValues,
    }

    return config
}

// We decide to report via a notification the first error we encounter, one at a time
// in order to simplify the error reporting, avoiding having to manage the error states for each input
const validateFormValues = (formValues: FormValues) => {
    const {excludedTopics, signature, tags, ticketSampleRate} = formValues
    if (ticketSampleRate !== null) {
        if (ticketSampleRate < 0 || ticketSampleRate > 100) {
            return 'Ticket sample rate must be between 0 and 100'
        }
    }

    if (signature !== null) {
        if (signature.length > SIGNATURE_MAX_LENGTH) {
            return `Signature must be less than ${SIGNATURE_MAX_LENGTH} characters`
        }
    }

    if (excludedTopics !== null && excludedTopics.length > 0) {
        const hasEmptyFields = excludedTopics.some((topic) => topic === '')
        if (hasEmptyFields) {
            return 'Excluded topic cannot be empty'
        }
        if (excludedTopics.length > MAX_EXCLUDED_TOPICS) {
            return `Excluded topics must be less than ${MAX_EXCLUDED_TOPICS}`
        }
        for (const topic of excludedTopics) {
            if (topic.length > EXCLUDED_TOPIC_MAX_LENGTH) {
                return `Excluded topics must be less than ${EXCLUDED_TOPIC_MAX_LENGTH} characters`
            }
        }
    }

    if (tags !== null && tags.length > 0) {
        const hasEmptyFields = tags.some(
            (tag) => tag.name === '' || tag.description === ''
        )
        if (hasEmptyFields) {
            return 'Tags must have a name and description'
        }
    }

    return ''
}

const validateRequiredFields = (
    storeConfiguration: Partial<StoreConfiguration>
) => {
    const {helpCenterId, monitoredEmailIntegrations} = storeConfiguration
    if (!helpCenterId) {
        return 'A Help Center selection is required'
    }

    if (
        !monitoredEmailIntegrations?.length ||
        monitoredEmailIntegrations[0].id === 0 // because the backend could, for some reason, setting up an email integration with id 0
    ) {
        return 'Select at least one monitored email integration'
    }

    return ''
}

const useFormValues = () => {
    // could have used a useReducer instead, but keeping it simple for now
    const [formValues, setFormValues] =
        useState<FormValues>(DEFAULT_FORM_VALUES)

    const resetForm = () => {
        setFormValues(DEFAULT_FORM_VALUES)
    }

    const isFormDirty = !_isEqual(formValues, DEFAULT_FORM_VALUES)
    const isFieldDirty = (key: keyof FormValues) => {
        return !_isEqual(formValues[key], DEFAULT_FORM_VALUES[key])
    }

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
        isFieldDirty,
        updateValue,
    }
}

const convertFloatRateToInt = (rate: number) => {
    if (rate > 1) return 100
    if (rate < 0) return 0
    return Math.round(rate * 100)
}

function convertPercentageToFloat(ticketSampleRateInPercentage: number) {
    if (!Number.isInteger(ticketSampleRateInPercentage)) {
        throw new Error('Ticket sample rate must be an integer')
    }
    return ticketSampleRateInPercentage / 100
}

type AiAgentStoreViewProps = {
    shopName: string
    accountDomain: string
}

export const AiAgentStoreView = ({
    shopName,
    accountDomain,
}: AiAgentStoreViewProps) => {
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    /**
     * Resource management
     */
    const {
        isLoading: getStoreConfigurationIsLoading,
        data: getStoreConfigurationResponse,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1}
    )

    const {mutateAsync: createStoreConfiguration, isLoading: isCreateLoading} =
        useCreateStoreConfigurationPure()

    const {mutateAsync: upsertStoreConfiguration, isLoading: isUpsertLoading} =
        useUpsertStoreConfigurationPure()

    const isMutationLoading = isCreateLoading || isUpsertLoading

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

    const {formValues, isFormDirty, isFieldDirty, resetForm, updateValue} =
        useFormValues()
    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`

    const handleOnSave = async () => {
        const errorMessage = validateFormValues(formValues)
        if (errorMessage) {
            void dispatch(
                notify({
                    message: errorMessage,
                    status: NotificationStatus.Error,
                })
            )
            return
        }

        const configurationToSubmit = createStoreConfigurationToSubmit(
            shopName,
            formValues,
            serverStoreConfig
        )

        const missingRequiredFields = validateRequiredFields(
            configurationToSubmit
        )

        if (missingRequiredFields) {
            void dispatch(
                notify({
                    message: missingRequiredFields,
                    status: NotificationStatus.Error,
                })
            )
            return
        }

        const mutateStoreConfiguration = serverStoreConfig
            ? upsertStoreConfiguration
            : createStoreConfiguration

        // @ts-ignore
        await mutateStoreConfiguration([accountDomain, configurationToSubmit], {
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

    // Render logic
    if (getStoreConfigurationIsLoading) {
        return <Loader />
    }

    const serverStoreConfig =
        getStoreConfigurationResponse?.data.storeConfiguration

    const selectedHelpCenter = helpCenters.find((helpCenter) => {
        const selectedHelpCenterId =
            !serverStoreConfig || isFieldDirty('helpCenter')
                ? formValues.helpCenter?.id
                : serverStoreConfig.helpCenterId
        return helpCenter.id === selectedHelpCenterId
    })

    const isAIAgentToggled = isAiAgentEnabled(
        !serverStoreConfig || isFieldDirty('ticketSampleRate')
            ? formValues.ticketSampleRate
            : serverStoreConfig.ticketSampleRate
    )

    const isHandoffToggled = isHandoffEnabled(
        !serverStoreConfig || isFieldDirty('silentHandover')
            ? formValues.silentHandover
            : serverStoreConfig.silentHandover
    )

    return (
        <AutomateView
            title={AI_AGENT}
            isLoading={getStoreConfigurationIsLoading}
        >
            {isFormDirty && (
                <UnsavedChangesPrompt
                    onSave={handleOnSave}
                    when={isFormDirty}
                    onDiscard={resetForm}
                    shouldRedirectAfterSave={true}
                />
            )}
            <div className={css.automateView}>
                <div className={css.aiAgentToggle}>
                    <ToggleInput
                        isToggled={isAIAgentToggled}
                        onClick={() => {
                            updateValue(
                                'ticketSampleRate',
                                isAIAgentToggled
                                    ? DEFAULT_AI_AGENT_DISABLED_RATE
                                    : DEFAULT_AI_AGENT_ENABLED_RATE
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
                            if (!value) return
                            updateValue('ticketSampleRate', value)
                        }}
                        value={
                            !serverStoreConfig ||
                            isFieldDirty('ticketSampleRate')
                                ? formValues.ticketSampleRate
                                : convertFloatRateToInt(
                                      serverStoreConfig.ticketSampleRate
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
                            !serverStoreConfig ||
                            isFieldDirty('monitoredEmailIntegrations')
                                ? formValues.monitoredEmailIntegrations.map(
                                      (integration) => integration.id
                                  )
                                : serverStoreConfig.monitoredEmailIntegrations.map(
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
                            !serverStoreConfig || isFieldDirty('signature')
                                ? formValues.signature
                                : serverStoreConfig.signature
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
                        value={
                            !serverStoreConfig || isFieldDirty('toneOfVoice')
                                ? TONE_OF_VOICE_VALUE_TO_LABEL[
                                      formValues.toneOfVoice
                                  ]
                                : TONE_OF_VOICE_VALUE_TO_LABEL[
                                      serverStoreConfig.toneOfVoice
                                  ]
                        }
                        onChange={(toneOfVoiceLabel) => {
                            updateValue(
                                'toneOfVoice',
                                TONE_OF_VOICE_LABEL_TO_VALUE[
                                    toneOfVoiceLabel
                                ] ?? TONE_OF_VOICE_LABEL_TO_VALUE['Friendly']
                            )
                        }}
                        options={TONE_OF_VOICE_LABELS.map((label) => ({
                            label,
                            value: label,
                        }))}
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
                            if (
                                !serverStoreConfig ||
                                isFieldDirty('silentHandover')
                            ) {
                                updateValue(
                                    'silentHandover',
                                    !formValues.silentHandover
                                )
                            } else {
                                updateValue(
                                    'silentHandover',
                                    !serverStoreConfig.silentHandover
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
                            !serverStoreConfig || isFieldDirty('excludedTopics')
                                ? formValues.excludedTopics
                                : serverStoreConfig.excludedTopics
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
                            !serverStoreConfig || isFieldDirty('tags')
                                ? formValues.tags
                                : serverStoreConfig.tags
                        }
                        onTagUpdate={(tags: Tag[]) => {
                            updateValue('tags', tags)
                        }}
                    />
                </div>
                <Button
                    onClick={handleOnSave}
                    isDisabled={isMutationLoading || !isFormDirty}
                    className="mb-3"
                >
                    Save Changes
                </Button>
            </div>
        </AutomateView>
    )
}
