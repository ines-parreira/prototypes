import {Label} from '@gorgias/merchant-ui-kit'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'

import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {useGetHelpCenterList} from 'models/helpCenter/queries'
import {AiAgentLayout} from 'pages/automate/aiAgent/components/AiAgentLayout/AiAgentLayout'
import {ExternalFilesSection} from 'pages/automate/aiAgent/components/Knowledge/ExternalFilesSection'
import {getFormValuesFromStoreConfiguration} from 'pages/automate/aiAgent/components/StoreConfigForm/StoreConfigForm.utils'
import {useConfigurationForm} from 'pages/automate/aiAgent/hooks/useConfigurationForm'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import {FormValues} from 'pages/automate/aiAgent/types'
import HelpCenterSelect, {
    EMPTY_HELP_CENTER_ID,
} from 'pages/automate/common/components/HelpCenterSelect'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import {HELP_CENTER_MAX_CREATION} from 'pages/settings/helpCenter/constants'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'

import css from './AiAgentKnowledgeContainer.less'
import {ConfigurationSection} from './components/ConfigurationSection/ConfigurationSection'
import {CreatePublicSourcesSection} from './components/StoreConfigForm/StoreConfigForm'
import {INITIAL_FORM_VALUES} from './constants'
import {useGetOrCreateSnippetHelpCenter} from './hooks/useGetOrCreateSnippetHelpCenter'

export const AiAgentKnowledgeContainer = () => {
    const isAiAgentSnippetsFromExternalFilesEnabled =
        useFlags()[FeatureFlagKey.AiAgentSnippetsFromExternalFiles]

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const dispatch = useAppDispatch()
    const [externalFilesIsLoading, setExternalFilesIsLoading] = useState(false)
    const [hasExternalFiles, setHasExternalFiles] = useState<boolean | null>(
        null
    )

    const {shopName} = useParams<{
        shopName: string
    }>()

    const {
        isLoading: isStoreConfigLoading,
        storeConfiguration,
        updateStoreConfiguration,
    } = useAiAgentStoreConfigurationContext()

    const isCreate = storeConfiguration === undefined

    const {data: helpCenterListData, isLoading: isLoadingHelpCenters} =
        useGetHelpCenterList(
            {type: 'faq', per_page: HELP_CENTER_MAX_CREATION},
            {
                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
            }
        )

    const faqHelpCenters = useMemo(
        () => helpCenterListData?.data.data ?? [],
        [helpCenterListData]
    )

    const defaultFormValues: Partial<FormValues> = useMemo(() => {
        const initialHelpCenter = faqHelpCenters[0]

        return storeConfiguration
            ? getFormValuesFromStoreConfiguration(storeConfiguration)
            : {
                  ...INITIAL_FORM_VALUES,
                  helpCenterId: initialHelpCenter?.id ?? null,
              }
    }, [faqHelpCenters, storeConfiguration])

    const {
        handleOnSave,
        formValues,
        isFormDirty,
        resetForm,
        updateValue,
        isPendingCreateOrUpdate,
    } = useConfigurationForm({initValues: defaultFormValues, shopName})

    const [publicUrls, setPublicUrls] = useState<string[]>([])

    const {helpCenter: snippetHelpCenter} = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

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

    const onSubmit = () => {
        void handleOnSave({shopName, publicUrls})
    }

    const deactivateAiAgent = useCallback(async () => {
        if (isCreate) return

        const deactivatedDatetime = new Date().toISOString()
        updateValue('deactivatedDatetime', deactivatedDatetime)
        updateValue('emailChannelDeactivatedDatetime', deactivatedDatetime)
        updateValue('chatChannelDeactivatedDatetime', deactivatedDatetime)
        updateValue('trialModeActivatedDatetime', null)
        updateValue('previewModeActivatedDatetime', null)
        updateValue('previewModeValidUntilDatetime', null)

        try {
            await updateStoreConfiguration({
                ...storeConfiguration,
                chatChannelDeactivatedDatetime: deactivatedDatetime,
                emailChannelDeactivatedDatetime: deactivatedDatetime,
                deactivatedDatetime,
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                previewModeValidUntilDatetime: null,
            })

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
        isCreate,
        updateValue,
        updateStoreConfiguration,
        storeConfiguration,
        dispatch,
    ])

    const handlePublicURLsChange = useCallback((publicURLs: string[]) => {
        setPublicUrls(publicURLs)
    }, [])

    // Deactivate AI Agent in some situations
    useEffect(() => {
        if (
            hasExternalFiles === false &&
            publicUrls.length === 0 &&
            storeConfiguration?.helpCenterId === null &&
            storeConfiguration?.deactivatedDatetime === null
        ) {
            void deactivateAiAgent()
        }
    }, [
        deactivateAiAgent,
        hasExternalFiles,
        publicUrls.length,
        storeConfiguration?.deactivatedDatetime,
        storeConfiguration?.helpCenterId,
    ])

    if (isStoreConfigLoading || isLoadingHelpCenters) {
        return <Loader data-testid="loader" />
    }

    return (
        <AiAgentLayout shopName={shopName}>
            <UnsavedChangesPrompt
                onSave={onSubmit}
                when={isFormDirty}
                onDiscard={resetForm}
                shouldRedirectAfterSave={true}
            />

            <form onSubmit={onSubmit} className={css.container}>
                <ConfigurationSection
                    title="Knowledge"
                    isRequired
                    subtitle="Select a Help Center or add at least one URL or external document in order to enable AI Agent."
                    data-candu-id="ai-agent-configuration-knowledge-copy"
                >
                    <div className={css.sectionContainer}>
                        <div>
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
                            />
                        ) : null}

                        {isAiAgentSnippetsFromExternalFilesEnabled &&
                            snippetHelpCenter && (
                                <ExternalFilesSection
                                    helpCenterId={snippetHelpCenter.id}
                                    onLoadingStateChange={(isLoading) =>
                                        setExternalFilesIsLoading(isLoading)
                                    }
                                    onEmptyStateChange={(isEmpty) =>
                                        setHasExternalFiles(!isEmpty)
                                    }
                                />
                            )}
                    </div>
                </ConfigurationSection>

                <div className={css.buttons}>
                    <Button
                        intent="primary"
                        isLoading={
                            isPendingCreateOrUpdate || externalFilesIsLoading
                        }
                        onClick={onSubmit}
                    >
                        Save Changes
                    </Button>

                    <Button
                        intent="secondary"
                        onClick={resetForm}
                        isDisabled={
                            !isFormDirty ||
                            isPendingCreateOrUpdate ||
                            externalFilesIsLoading
                        }
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </AiAgentLayout>
    )
}
