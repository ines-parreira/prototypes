import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { AppContextProvider } from 'pages/AppContext'
import CurrentHelpCenterContext from 'pages/settings/helpCenter/contexts/CurrentHelpCenterContext'
import { EditionManagerContextProvider } from 'pages/settings/helpCenter/providers/EditionManagerContext'
import { SupportedLocalesProvider } from 'pages/settings/helpCenter/providers/SupportedLocales'
import { useFeedbackActions } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackActions'
import { useFeedbackTracking } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import KnowledgeSourceSideBar from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceSideBar'
import { UnsavedChangesModalProvider } from 'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider'
import { useGetAllRelatedResourceData } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

import { getHelpCenterIdByResourceType } from './utils'

const KnowledgeSourceSidebarWrapper = () => {
    const ticket = useAppSelector(getTicketState)
    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)
    const { selectedResource } = useKnowledgeSourceSideBar()

    const ticketId = ticket.get('id')
    const accountId = account.get('id')
    const userId = currentUser.get('id')
    const accountDomain = account.get('domain')

    const { data: feedback } = useGetFeedback(
        {
            objectId: ticketId.toString(),
            objectType: 'TICKET',
        },
        {
            enabled: !!ticketId,
        },
    )

    const shopName =
        feedback?.executions?.[0]?.storeConfiguration?.shopName ?? ''

    const { storeConfiguration } = useStoreConfiguration({
        shopName,
        accountDomain,
        enabled: !!shopName && !!accountDomain,
    })

    const shopType = storeConfiguration?.shopType ?? ''

    const {
        actions,
        articles,
        guidanceArticles,
        sourceItems,
        ingestedFiles,
        storeWebsiteQuestions,
        helpCenters,
    } = useGetAllRelatedResourceData({
        data: feedback,
        storeConfiguration,
        queriesEnabled: true,
    })

    const { onKnowledgeResourceEditClick, onKnowledgeResourceSaved } =
        useFeedbackTracking({
            ticketId,
            accountId,
            userId,
        })

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectId: ticketId.toString(),
        objectType: 'TICKET',
    })

    const { onSubmitNewMissingKnowledge } = useFeedbackActions({
        upsertFeedback,
        feedback,
        ticketId,
        storeConfiguration,
        actions,
        guidanceArticles,
        articles,
        sourceItems,
        ingestedFiles,
        storeWebsiteQuestions,
        enrichedData: {},
        setLoadingMutations: () => {},
    })

    const helpCenter = useMemo(() => {
        if (!helpCenters || !selectedResource) return null

        if (!selectedResource?.helpCenterId) {
            const storeConfigurationHelpCenterId =
                getHelpCenterIdByResourceType(
                    storeConfiguration,
                    selectedResource.knowledgeResourceType,
                )
            return helpCenters.find(
                (helpCenter) =>
                    !!helpCenter &&
                    helpCenter.id === storeConfigurationHelpCenterId,
            )
        }

        return helpCenters.find(
            (helpCenter) =>
                !!helpCenter &&
                helpCenter.id === Number(selectedResource.helpCenterId),
        )
    }, [helpCenters, selectedResource, storeConfiguration])

    if (!shopName || !helpCenter) {
        return null
    }

    return (
        <AppContextProvider>
            <SupportedLocalesProvider>
                <CurrentHelpCenterContext.Provider value={helpCenter}>
                    <UnsavedChangesModalProvider>
                        <EditionManagerContextProvider>
                            <KnowledgeSourceSideBar
                                articles={articles}
                                shopName={shopName}
                                shopType={shopType}
                                onSubmitNewMissingKnowledge={
                                    onSubmitNewMissingKnowledge
                                }
                                onKnowledgeResourceEditClick={
                                    onKnowledgeResourceEditClick
                                }
                                onKnowledgeResourceSaved={
                                    onKnowledgeResourceSaved
                                }
                            />
                        </EditionManagerContextProvider>
                    </UnsavedChangesModalProvider>
                </CurrentHelpCenterContext.Provider>
            </SupportedLocalesProvider>
        </AppContextProvider>
    )
}

export default KnowledgeSourceSidebarWrapper
