import React, {useEffect, useMemo, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {List} from 'immutable'
import axios from 'axios'
import {useUpsertStoreConfiguration} from '../../../hooks/aiAgent/useUpsertStoreConfiguration'
import {AI_AGENT} from '../common/components/constants'
import AutomateView from '../common/components/AutomateView'
import ToggleInput from '../../common/forms/ToggleInput'
import useId from '../../../hooks/useId'
import HeaderTitle from '../../common/components/HeaderTitle'
import {
    useGetAccountConfiguration,
    useUpsertAccountConfiguration,
} from '../../../models/aiAgent/queries'
import useAppSelector from '../../../hooks/useAppSelector'
import {
    getCurrentAccountState,
    getCurrentDomain,
} from '../../../state/currentAccount/selectors'
import {StoreConfiguration} from '../../../models/aiAgent/types'
import Button from '../../common/components/button/Button'
import {getHelpCenterList} from '../../../state/entities/helpCenter/helpCenters'
import Label from '../../common/forms/Label/Label'
import {getIntegrationsByTypes} from '../../../state/integrations/selectors'
import {EMAIL_INTEGRATION_TYPES} from '../../../constants/integration'
import {EmailIntegration} from '../../../models/integration/types'
import SelectField from '../../common/forms/SelectField/SelectField'
import ListField from '../../common/forms/ListField'
import UnsavedChangesPrompt from '../../common/components/UnsavedChangesPrompt'
import {useGetStoreConfiguration} from '../../../hooks/aiAgent/useGetStoreConfiguration'
import HelpCenterSelect from '../common/components/HelpCenterSelect'
import TextArea from '../../common/forms/TextArea'
import css from './AiAgentView.less'
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

export const AiAgentView = () => {
    const {shopName} = useParams<{shopName: string}>()
    const history = useHistory()

    const toggleAiAgentId = `toggle-ai-agent-${useId()}`
    const toggleHandoffId = `toggle-handoff-${useId()}`

    const accountDomain = useAppSelector(getCurrentDomain)
    const accountId = useAppSelector(getCurrentAccountState).get('id')
    const helpCenters = useAppSelector(getHelpCenterList)
    const emailIntegrations = useAppSelector(
        getIntegrationsByTypes(EMAIL_INTEGRATION_TYPES)
    ) as EmailIntegration[]

    useGetAccountConfiguration({
        accountDomain,
    })
    const {
        mutateAsync: mutateAccountConfiguration,
        isError: accountConfigurationMutationFailed,
    } = useUpsertAccountConfiguration()
    const {
        isFetching: storeConfigurationIsLoading,
        isError: storeConfigurationRequestFailed,
        error: storeConfigurationRequestError,
        data: storeConfigurationResponse,
    } = useGetStoreConfiguration({
        accountDomain,
        storeName: shopName,
    })
    const {
        mutateAsync: mutateStoreConfiguration,
        isError: storeConfigurationMutationFailed,
    } = useUpsertStoreConfiguration(shopName)

    const defaultStoreConfiguration = useMemo(() => {
        return {...DEFAULT_STORE_CONFIGURATION, storeName: shopName}
    }, [shopName])
    const [storeConfiguration, setStoreConfiguration] =
        useState<StoreConfiguration>(defaultStoreConfiguration)
    const [isDirty, setIsDirty] = useState<boolean>(false)

    const toggleAiAgent = (value: boolean) => {
        setStoreConfiguration((prevState) => ({
            ...prevState,
            ticketSampleRate: value ? 0.3 : 0,
        }))
        setIsDirty(true)
    }

    const helpCenter = useMemo(() => {
        return helpCenters.find(
            (helpCenter) => helpCenter.id === storeConfiguration.helpCenterId
        )
    }, [helpCenters, storeConfiguration])

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

    const saveStoreConfiguration = async () => {
        await mutateStoreConfiguration([
            {accountDomain, storeName: shopName, storeConfiguration},
        ])
        setIsDirty(false)
    }

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
        const upsertConfigurations = async () => {
            const accountConfiguration = {
                accountId: accountId,
                gorgiasDomain: accountDomain,
                helpdeskOAuth: null,
            }

            await mutateAccountConfiguration([
                {accountDomain, accountConfiguration},
            ])

            await mutateStoreConfiguration([
                {
                    accountDomain,
                    storeName: shopName,
                    storeConfiguration: defaultStoreConfiguration,
                },
            ])

            if (
                storeConfigurationMutationFailed ||
                accountConfigurationMutationFailed
            ) {
                history.push('/app/automation')
            }
        }

        // configuration not found, initialize it
        if (
            storeConfigurationRequestFailed &&
            axios.isAxiosError(storeConfigurationRequestError) &&
            storeConfigurationRequestError.response?.status === 404
        ) {
            void upsertConfigurations()
        } else if (storeConfigurationRequestFailed) {
            history.push('/app/automation')
        }
    }, [
        accountDomain,
        accountId,
        defaultStoreConfiguration,
        history,
        mutateAccountConfiguration,
        mutateStoreConfiguration,
        shopName,
        storeConfigurationRequestFailed,
        storeConfigurationRequestError,
        storeConfigurationMutationFailed,
        accountConfigurationMutationFailed,
    ])

    return (
        <AutomateView title={AI_AGENT} isLoading={storeConfigurationIsLoading}>
            <UnsavedChangesPrompt
                onSave={saveStoreConfiguration}
                when={isDirty}
            />
            <div className={css.automateView}>
                <div className={css.aiAgentToggle}>
                    <ToggleInput
                        isToggled={!!storeConfiguration.ticketSampleRate}
                        onClick={toggleAiAgent}
                        name={toggleAiAgentId}
                    >
                        Enable AI Agent
                    </ToggleInput>
                </div>

                <div className={css.knowledgeSection}>
                    <HeaderTitle className={css.header} title="Knowledge" />
                    <Label className={css.label}>
                        Select which Help Center should be used by the AI Agent
                    </Label>
                    <HelpCenterSelect
                        helpCenter={helpCenter}
                        setHelpCenterId={setHelpCenter}
                        helpCenters={helpCenters}
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
                <Button
                    onClick={saveStoreConfiguration}
                    isDisabled={!isDirty}
                    className="mb-3"
                >
                    Save Changes
                </Button>
            </div>
        </AutomateView>
    )
}
