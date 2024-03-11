import React, {useEffect, useMemo, useState} from 'react'
import {List} from 'immutable'
import {isEqual} from 'lodash'

import {useUpsertStoreConfiguration} from '../../../hooks/aiAgent/useUpsertStoreConfiguration'
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
import {useGetStoreConfigurationPure} from '../../../models/aiAgent/queries'
import css from './AiAgentStoreView.less'
import {
    TONE_OF_VOICE_LABEL_TO_VALUE,
    TONE_OF_VOICE_LABELS,
    TONE_OF_VOICE_VALUE_TO_LABEL,
    MAX_EXCLUDED_TOPICS,
    EXCLUDED_TOPIC_MAX_LENGTH,
    SIGNATURE_MAX_LENGTH,
    DEFAULT_STORE_CONFIGURATION,
} from './constants'
import {EmailIntegrationListSelection} from './components/EmailIntegrationListSelection'
import {AutoTagList} from './components/AutoTagList'

const createDefaultFormValues = (shopName: string): StoreConfiguration => {
    return {
        ...DEFAULT_STORE_CONFIGURATION,
        storeName: shopName,
    }
}

type AiAgentStoreViewProps = {
    shopName: string
    accountDomain: string
}

export const AiAgentStoreView = ({
    shopName,
    accountDomain,
}: AiAgentStoreViewProps) => {
    /**
     * Resource management
     */
    const {mutateAsync: mutateStoreConfiguration} =
        useUpsertStoreConfiguration(shopName)

    const {
        isLoading: storeConfigurationIsLoading,
        data: storeConfigurationResponse,
    } = useGetStoreConfigurationPure({
        accountDomain,
        storeName: shopName,
    })

    /**
     * Global state retrieval
     */
    const helpCenters = useAppSelector(getHelpCenterList)
    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    ) as EmailIntegration[]

    /**
     * Local states
     */
    const [storeConfiguration, setStoreConfiguration] =
        useState<StoreConfiguration>(createDefaultFormValues(shopName))
    const [isDirty, setIsDirty] = useState<boolean>(false)

    /**
     * Ai Agent toggle and sample rate
     */
    const [isAiAgentEnabled, setIsAiAgentEnabled] = useState<boolean>(false)
    const [sampleRateInPerc, setSampleRateInPerc] = useState<number>(50)

    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`

    const toggleAiAgent = (value: boolean) => {
        setIsAiAgentEnabled(value)
        setSampleRateInPerc(value ? 30 : 0)
        setIsDirty(true)
    }

    const handleTicketSampleRateChange = (value?: number) => {
        if (!value) return
        setSampleRateInPerc(value)
        setIsAiAgentEnabled(value > 0 ? true : false)
        setIsDirty(true)
    }

    /**
     * Faq Help Center selection
     */

    const helpCenter = useMemo(() => {
        return helpCenters.find(
            (helpCenter) => helpCenter.id === storeConfiguration.helpCenterId
        )
    }, [helpCenters, storeConfiguration])

    const faqHelpCenters = useMemo(() => {
        return helpCenters.filter((helpCenter) => helpCenter.type === 'faq')
    }, [helpCenters])

    const setHelpCenter = (id: number) => {
        const dirtyHelpCenter = helpCenters.find(
            (helpCenter) => helpCenter.id === id
        )

        if (dirtyHelpCenter) {
            setStoreConfiguration((prevState) => ({
                ...prevState,
                helpCenterId: dirtyHelpCenter.id,
                helpCenterLocale: dirtyHelpCenter.default_locale,
                helpCenterSubdomain: dirtyHelpCenter.subdomain,
            }))
            setIsDirty(true)
        }
    }

    /**
     * Email selection state management
     */

    const emailItems = useMemo(() => {
        return emailIntegrations.map((integration) => ({
            email: integration.meta.address,
            id: integration.id,
        }))
    }, [emailIntegrations])

    const handleEmailSelectionChange = (nextSelectedIds: number[]) => {
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

        setStoreConfiguration((prevState) => ({
            ...prevState,
            monitoredEmailIntegrations,
        }))
        setIsDirty(true)
    }

    /**
     * Auto Tag state management
     */
    const [updatedTags, setUpdatedTags] = useState<{
        tags: Tag[]
        tagsValid: boolean
        hasUpdated: boolean
    }>({tags: [], tagsValid: true, hasUpdated: false})

    const handleTagUpdate = (tags: Tag[]) => {
        const hasInputError = tags.some((tag) => {
            return !tag.name.trim().length || !tag.description.trim().length
        })

        if (!isEqual(tags, storeConfiguration.tags)) {
            setIsDirty(true)
            setUpdatedTags({tags, tagsValid: !hasInputError, hasUpdated: true})
        } else {
            setUpdatedTags({tags, tagsValid: !hasInputError, hasUpdated: false})
        }
    }

    /**
     * Other input states
     */
    // The typing of onChange for TextInput is wrong. It's typed as event, but it actually passes the input value
    const setSignature = (value: unknown) => {
        setStoreConfiguration((prevState) => ({
            ...prevState,
            signature: value as string,
        }))
        setIsDirty(true)
    }

    const setToneOfVoice = (toneOfVoiceLabel: string) => {
        const defaultToneOfVoice = TONE_OF_VOICE_LABEL_TO_VALUE['Friendly']

        setStoreConfiguration((prevState) => ({
            ...prevState,
            toneOfVoice:
                TONE_OF_VOICE_LABEL_TO_VALUE[toneOfVoiceLabel] ??
                defaultToneOfVoice,
        }))
        setIsDirty(true)
    }

    const setExcludedTopics = (excludedTopics: List<string>) => {
        setStoreConfiguration((prevState) => ({
            ...prevState,
            excludedTopics: excludedTopics.toJS(),
        }))
        setIsDirty(true)
    }

    const toggleSilentHandover = () => {
        setStoreConfiguration((prevState) => ({
            ...prevState,
            silentHandover: !prevState.silentHandover,
        }))
        setIsDirty(true)
    }

    /**
     * Effects
     */

    useEffect(() => {
        if (storeConfigurationResponse?.data) {
            setStoreConfiguration((prevConfig) => ({
                ...prevConfig,
                ...storeConfigurationResponse.data.storeConfiguration,
            }))
            setIsDirty(false)
        }
    }, [storeConfigurationResponse])

    useEffect(() => {
        setUpdatedTags({
            tags: storeConfiguration.tags,
            tagsValid: true,
            hasUpdated: false,
        })
    }, [storeConfiguration.tags])

    // FIXME: we need to refactor the way the initial value of the form is set, but for now, I'll just continue to follow the existing pattern
    // until we refactor this and set form values as soon as a refetch is performed
    useEffect(() => {
        setIsAiAgentEnabled(
            storeConfiguration.ticketSampleRate > 0 ? true : false
        )
        if (
            storeConfiguration.ticketSampleRate === 1 ||
            storeConfiguration.ticketSampleRate === 0
        ) {
            setSampleRateInPerc(storeConfiguration.ticketSampleRate * 100)
            return
        }
        const rateStr = storeConfiguration.ticketSampleRate.toString()
        // ex. "0.1" / "0.2" / "0.3"
        if (rateStr.split('.')[1]?.length === 1) {
            setSampleRateInPerc(parseInt(rateStr.split('.')[1] + '0'))
            return
        }

        // ex. "0.01" / "0.12"
        if (rateStr.split('.')[1]?.length === 2) {
            setSampleRateInPerc(parseInt(rateStr.split('.')[1]))
            return
        }
    }, [storeConfiguration.ticketSampleRate])

    /**
     * Form submission handler
     */

    const handleOnSave = async () => {
        await mutateStoreConfiguration([
            {
                accountDomain,
                storeName: shopName,
                storeConfiguration: {
                    ...storeConfiguration,
                    tags: updatedTags.tags,
                    ticketSampleRate: +(sampleRateInPerc / 100).toFixed(2),
                },
            },
        ])
        setIsDirty(false)
    }

    return (
        <AutomateView title={AI_AGENT} isLoading={storeConfigurationIsLoading}>
            <UnsavedChangesPrompt onSave={handleOnSave} when={isDirty} />
            <div className={css.automateView}>
                <div className={css.aiAgentToggle}>
                    <ToggleInput
                        isToggled={isAiAgentEnabled}
                        onClick={toggleAiAgent}
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
                        onChange={handleTicketSampleRateChange}
                        value={sampleRateInPerc}
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
                    <Label className={css.label}>
                        Select which Help Center should be used by the AI Agent
                    </Label>
                    <HelpCenterSelect
                        helpCenter={helpCenter}
                        setHelpCenterId={setHelpCenter}
                        helpCenters={faqHelpCenters}
                    />
                </div>
                <div className={css.customizeSection}>
                    <HeaderTitle className={css.header} title="Customize" />

                    <EmailIntegrationListSelection
                        selectedIds={storeConfiguration.monitoredEmailIntegrations.map(
                            (integration) => integration.id
                        )}
                        onSelectionChange={handleEmailSelectionChange}
                        emailItems={emailItems}
                    />

                    <Label className={css.label}>
                        Enter the signature that should be used by the AI Agent
                    </Label>
                    <TextArea
                        id="signature-text-area"
                        value={storeConfiguration.signature}
                        onChange={setSignature}
                        maxLength={SIGNATURE_MAX_LENGTH}
                    />
                    <Label className={css.label}>
                        Select the tone of voice that should be used by the AI
                        Agent
                    </Label>
                    <SelectField
                        fullWidth
                        value={
                            TONE_OF_VOICE_VALUE_TO_LABEL[
                                storeConfiguration.toneOfVoice
                            ]
                        }
                        onChange={(value) => setToneOfVoice(value as string)}
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
                        isToggled={!storeConfiguration.silentHandover}
                        onClick={toggleSilentHandover}
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
                        items={List(storeConfiguration.excludedTopics)}
                        onChange={setExcludedTopics}
                        maxLength={EXCLUDED_TOPIC_MAX_LENGTH}
                        maxItems={MAX_EXCLUDED_TOPICS}
                        addLabel="Add a topic"
                        placeholder=" "
                    />
                </div>
                <div className={css.autoTagSection}>
                    <HeaderTitle className={css.header} title="Auto Tag" />
                    <AutoTagList
                        tags={updatedTags.tags}
                        onTagUpdate={handleTagUpdate}
                    />
                </div>
                <Button
                    onClick={handleOnSave}
                    isDisabled={
                        !isDirty ||
                        (updatedTags.hasUpdated && !updatedTags.tagsValid)
                    }
                    className="mb-3"
                >
                    Save Changes
                </Button>
            </div>
        </AutomateView>
    )
}
