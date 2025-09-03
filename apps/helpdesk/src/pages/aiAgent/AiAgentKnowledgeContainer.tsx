import { useCallback, useEffect, useMemo, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { useParams } from 'react-router-dom'

import { Card } from '@gorgias/analytics-ui-kit'
import { Button, IconButton, Label } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { PAGE_NAME } from 'pages/aiAgent/AiAgentScrapedDomainContent/constant'
import { AiAgentLayout } from 'pages/aiAgent/components/AiAgentLayout/AiAgentLayout'
import { ExternalFilesSection } from 'pages/aiAgent/components/Knowledge/ExternalFilesSection'
import { useConfigurationForm } from 'pages/aiAgent/hooks/useConfigurationForm'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { FormValues } from 'pages/aiAgent/types'
import HelpCenterSelect, {
    EMPTY_HELP_CENTER_ID,
} from 'pages/automate/common/components/HelpCenterSelect'
import Loader from 'pages/common/components/Loader/Loader'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { reportError } from 'utils/errors'

import SyncIngestionDomainBanner from './AiAgentScrapedDomainContent/SyncIngestionDomainBanner'
import { hasSuccessfullySyncedOnce } from './AiAgentScrapedDomainContent/utils'
import { ConfigurationSection } from './components/ConfigurationSection/ConfigurationSection'
import { GuidanceSection } from './components/Knowledge/GuidanceSection'
import { ScrapeStoreDomainSection } from './components/Knowledge/ScrapeStoreDomainSection'
import { CreatePublicSourcesSection } from './components/StoreConfigForm/StoreConfigForm'
import { INITIAL_FORM_VALUES, KNOWLEDGE } from './constants'
import { useAiAgentHelpCenter } from './hooks/useAiAgentHelpCenter'
import { useGetOrCreateSnippetHelpCenter } from './hooks/useGetOrCreateSnippetHelpCenter'
import { useKnowledgeTracking } from './hooks/useKnowledgeTracking'
import { useStoresDomainIngestionLogs } from './hooks/useStoresDomainIngestionLogs'
import { getFormValuesFromStoreConfiguration } from './hooks/utils/configurationForm.utils'

import css from './AiAgentKnowledgeContainer.less'

export const AiAgentKnowledgeContainer = () => {
    const isAiAgentScrapeStoreDomainEnabled = useFlag(
        FeatureFlagKey.AiAgentScrapeStoreDomain,
    )
    const isAiAgentFilesAndUrlsKnowledgeVisible = useFlag(
        FeatureFlagKey.AiAgentFilesAndUrlsKnowledgeVisibilityButton,
    )

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const dispatch = useAppDispatch()
    const [externalFilesIsLoading, setExternalFilesIsLoading] = useState(false)
    const [hasExternalFiles, setHasExternalFiles] = useState<
        boolean | undefined
    >()

    const [syncStoreDomainStatus, setSyncStoreDomainStatus] = useState<
        string | null
    >(null)

    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()

    const { onKnowledgeSourcesViewed } = useKnowledgeTracking({ shopName })

    useEffectOnce(() => {
        onKnowledgeSourcesViewed()
    })

    const {
        isLoading: isStoreConfigLoading,
        storeConfiguration,
        updateStoreConfiguration,
    } = useAiAgentStoreConfigurationContext()

    const isCreate = storeConfiguration === undefined

    const { data: helpCenterListData, isLoading: isLoadingHelpCenters } =
        useGetHelpCenterList(
            { type: 'faq', per_page: HELP_CENTER_MAX_CREATION },
            {
                staleTime: 1000 * 60 * 5,
                refetchOnWindowFocus: false,
            },
        )

    const faqHelpCenters = useMemo(
        () => helpCenterListData?.data.data ?? [],
        [helpCenterListData],
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
    } = useConfigurationForm({
        initValues: defaultFormValues,
        shopName,
        shopType,
    })

    const [publicUrls, setPublicUrls] = useState<string[]>([])

    const { helpCenter: snippetHelpCenter } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    const guidanceHelpCenter = useAiAgentHelpCenter({
        shopName,
        helpCenterType: 'guidance',
    })

    const { data: storesDomainIngestionLogs } = useStoresDomainIngestionLogs({
        storeNames: [shopName],
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
        void handleOnSave({ shopName, publicUrls, hasExternalFiles })
    }

    const deactivateAiAgent = useCallback(async () => {
        if (isCreate) return

        const deactivatedDatetime = new Date().toISOString()
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
                trialModeActivatedDatetime: null,
                previewModeActivatedDatetime: null,
                previewModeValidUntilDatetime: null,
            })

            void dispatch(
                notify({
                    message:
                        'AI Agent has been disabled, because no Knowledge source is connected.',
                    status: NotificationStatus.Warning,
                }),
            )
        } catch (error) {
            // nothing to notify here for the user as we do silent disable AI Agent
            reportError(error, {
                tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
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
            (storeConfiguration?.emailChannelDeactivatedDatetime === null ||
                storeConfiguration?.chatChannelDeactivatedDatetime === null) &&
            !hasSuccessfullySyncedOnce(storesDomainIngestionLogs?.[shopName])
        ) {
            void deactivateAiAgent()
        }
    }, [
        deactivateAiAgent,
        hasExternalFiles,
        publicUrls.length,
        storeConfiguration?.emailChannelDeactivatedDatetime,
        storeConfiguration?.chatChannelDeactivatedDatetime,
        storeConfiguration?.helpCenterId,
        storesDomainIngestionLogs,
        shopName,
    ])

    const handleOpenHelpCenter = () => {
        if (!selectedHelpCenter) return

        const domain = getHelpCenterDomain(selectedHelpCenter)
        const helpCenterUrl = getAbsoluteUrl({
            domain,
            locale: selectedHelpCenter.default_locale,
        })

        window.open(helpCenterUrl, '_blank', 'noopener noreferrer')
    }

    if (isStoreConfigLoading || isLoadingHelpCenters) {
        return <Loader data-testid="loader" />
    }

    return (
        <AiAgentLayout shopName={shopName} title={KNOWLEDGE}>
            <UnsavedChangesPrompt
                onSave={onSubmit}
                when={isFormDirty}
                onDiscard={resetForm}
                shouldRedirectAfterSave={true}
            />

            <div>
                <form onSubmit={onSubmit} className={css.container}>
                    {isAiAgentScrapeStoreDomainEnabled ? (
                        <>
                            <SyncIngestionDomainBanner
                                syncStoreDomainStatus={syncStoreDomainStatus}
                                shopName={shopName}
                                syncEntityType={PAGE_NAME.SOURCE}
                                className={css.banner}
                            />
                            <ConfigurationSection
                                subtitle="AI Agent uses your knowledge to answer customer questions and resolve requests."
                                data-candu-id="ai-agent-configuration-knowledge-copy"
                            >
                                <div className={css.cardsContainer}>
                                    {isAiAgentFilesAndUrlsKnowledgeVisible &&
                                        guidanceHelpCenter && (
                                            <Card className={css.cardSection}>
                                                <GuidanceSection
                                                    helpCenterId={
                                                        guidanceHelpCenter.id
                                                    }
                                                    shopName={shopName}
                                                />
                                            </Card>
                                        )}

                                    {snippetHelpCenter && (
                                        <Card className={css.cardSection}>
                                            <ScrapeStoreDomainSection
                                                shopName={shopName}
                                                helpCenterId={
                                                    snippetHelpCenter.id
                                                }
                                                syncStoreDomainStatus={
                                                    syncStoreDomainStatus
                                                }
                                                onStatusChange={
                                                    setSyncStoreDomainStatus
                                                }
                                            />
                                        </Card>
                                    )}

                                    <Card className={css.cardSection}>
                                        <div className={css.labelSection}>
                                            <Label>Help Center</Label>
                                            <span className={css.description}>
                                                Let AI Agent access and use
                                                articles from your Help Center
                                                to answer customer questions.
                                            </span>
                                        </div>
                                        <div className={css.helpCenterSelect}>
                                            <HelpCenterSelect
                                                helpCenter={selectedHelpCenter}
                                                setHelpCenterId={
                                                    setHelpCenterId
                                                }
                                                helpCenters={faqHelpCenters}
                                                withEmptyItemSelection
                                            />
                                            <IconButton
                                                size="small"
                                                fillStyle="ghost"
                                                intent="secondary"
                                                isDisabled={!selectedHelpCenter}
                                                aria-label="Open help center"
                                                onClick={handleOpenHelpCenter}
                                                icon="open_in_new"
                                                className={
                                                    css.openHelpCenterButton
                                                }
                                            />
                                        </div>
                                    </Card>

                                    {snippetHelpCenter ? (
                                        <>
                                            <Card className={css.cardSection}>
                                                <CreatePublicSourcesSection
                                                    helpCenterId={
                                                        snippetHelpCenter.id
                                                    }
                                                    selectedHelpCenterId={
                                                        selectedHelpCenter?.id
                                                    }
                                                    onPublicURLsChanged={
                                                        handlePublicURLsChange
                                                    }
                                                    shopName={shopName}
                                                />
                                            </Card>
                                            <Card className={css.cardSection}>
                                                <ExternalFilesSection
                                                    helpCenterId={
                                                        snippetHelpCenter.id
                                                    }
                                                    onLoadingStateChange={(
                                                        isLoading,
                                                    ) =>
                                                        setExternalFilesIsLoading(
                                                            isLoading,
                                                        )
                                                    }
                                                    onEmptyStateChange={(
                                                        isEmpty,
                                                    ) =>
                                                        setHasExternalFiles(
                                                            !isEmpty,
                                                        )
                                                    }
                                                />
                                            </Card>
                                        </>
                                    ) : null}
                                </div>
                            </ConfigurationSection>
                        </>
                    ) : (
                        <ConfigurationSection
                            title="Knowledge"
                            isRequired
                            subtitle="Connect at least one of the knowledge sources below to enable AI Agent."
                            data-candu-id="ai-agent-configuration-knowledge-copy"
                            className={css.configurationSection}
                        >
                            <div className={css.sectionContainer}>
                                <div>
                                    <Label className={css.label}>
                                        Help Center
                                    </Label>
                                    <HelpCenterSelect
                                        helpCenter={selectedHelpCenter}
                                        setHelpCenterId={setHelpCenterId}
                                        helpCenters={faqHelpCenters}
                                        withEmptyItemSelection
                                        className={css.helpCenterSelect}
                                    />
                                    <div className={css.formInputFooterInfo}>
                                        Select a Help Center to connect to AI
                                        Agent.
                                    </div>
                                </div>

                                {snippetHelpCenter ? (
                                    <>
                                        <CreatePublicSourcesSection
                                            helpCenterId={snippetHelpCenter.id}
                                            selectedHelpCenterId={
                                                selectedHelpCenter?.id
                                            }
                                            onPublicURLsChanged={
                                                handlePublicURLsChange
                                            }
                                            shopName={shopName}
                                        />
                                        <ExternalFilesSection
                                            helpCenterId={snippetHelpCenter.id}
                                            onLoadingStateChange={(isLoading) =>
                                                setExternalFilesIsLoading(
                                                    isLoading,
                                                )
                                            }
                                            onEmptyStateChange={(isEmpty) =>
                                                setHasExternalFiles(!isEmpty)
                                            }
                                        />
                                    </>
                                ) : null}
                            </div>
                        </ConfigurationSection>
                    )}

                    <div className={css.buttons}>
                        <Button
                            intent="primary"
                            isLoading={isPendingCreateOrUpdate}
                            isDisabled={externalFilesIsLoading}
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
            </div>
        </AiAgentLayout>
    )
}
