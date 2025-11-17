import { useEffect, useMemo, useRef, useState } from 'react'

import { history } from '@repo/routing'
import { isAxiosError } from 'axios'
import { Redirect } from 'react-router-dom'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import type { AccountConfigurationWithHttpIntegration } from 'models/aiAgent/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { reportError } from 'utils/errors'

import { REFRESH_AI_AGENT_PLAYGROUND_EVENT } from '../constants'
import { useAiAgentNavigation } from '../hooks/useAiAgentNavigation'
import { useGetOrCreateSnippetHelpCenter } from '../hooks/useGetOrCreateSnippetHelpCenter'
import { useGuidanceArticles } from '../hooks/useGuidanceArticles'
import { PlaygroundChat } from './components/PlaygroundChat/PlaygroundChat'
import { CheckPlaygroundPrerequisites } from './components/PlaygroundPrerequisites/PlaygroundPrerequisites'
import { MissingKnowledgeSourceAlert } from './components/PlaygroundPrerequisites/PlaygroundPrerequisitesAlerts'

import css from './AiAgentPlaygroundView.less'

type Props = {
    shopName: string
    arePlaygroundActionsAllowed?: boolean
    onGuidanceClick?: (guidanceArticleId: number) => void
}

export const AiAgentPlaygroundView = ({
    shopName,
    arePlaygroundActionsAllowed,
    onGuidanceClick,
}: Props) => {
    const dispatch = useAppDispatch()
    const { routes } = useAiAgentNavigation({ shopName })

    // Reference to the PlaygroundChat's onNewConversation function
    const resetConversationRef = useRef<() => void>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const currentUser = useAppSelector(getCurrentUser)
    const currentUserFirstName = currentUser?.get('firstname')

    const [
        storeConfigurationNotInitialized,
        setStoreConfigurationNotInitialized,
    ] = useState(false)

    // Listen for the custom refresh event
    useEffect(() => {
        const handleRefreshEvent = () => {
            resetConversationRef.current?.()
        }

        document.addEventListener(
            REFRESH_AI_AGENT_PLAYGROUND_EVENT,
            handleRefreshEvent,
        )

        return () => {
            document.removeEventListener(
                REFRESH_AI_AGENT_PLAYGROUND_EVENT,
                handleRefreshEvent,
            )
        }
    }, [])

    const {
        error: storeFetchError,
        data: storeData,
        isLoading: storeDataLoading,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
        },
        { retry: 1, refetchOnWindowFocus: false },
    )

    const {
        error: accountFetchError,
        data: accountData,
        isLoading: accountDataLoading,
    } = useGetAccountConfiguration(accountDomain, {
        retry: 1,
        refetchOnWindowFocus: false,
    })

    const {
        helpCenter: snippetHelpCenter,
        isLoading: snippetHelpCenterLoading,
    } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    const { guidanceArticles, isGuidanceArticleListLoading } =
        useGuidanceArticles(
            storeData?.data?.storeConfiguration?.guidanceHelpCenterId ?? 0,
            {
                enabled:
                    !!storeData?.data?.storeConfiguration?.guidanceHelpCenterId,
            },
        )

    const guidanceUsed = useMemo(() => {
        return guidanceArticles?.filter(
            (article) => article.visibility === 'PUBLIC',
        )
    }, [guidanceArticles])

    useEffect(() => {
        if (storeFetchError) {
            if (
                isAxiosError(storeFetchError) &&
                storeFetchError.response?.status === 404
            ) {
                setStoreConfigurationNotInitialized(true)
            } else {
                void dispatch(
                    notify({
                        message:
                            'There was an error initializing the AI Agent Test mode',
                        status: NotificationStatus.Error,
                    }),
                )
                reportError(storeFetchError, {
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context:
                            'Error fetching store configuration for AI Agent Playground',
                    },
                })

                return history.push(routes.main)
            }
        }
    }, [storeFetchError, dispatch, shopName, routes])

    if (
        storeDataLoading ||
        accountDataLoading ||
        snippetHelpCenterLoading ||
        isGuidanceArticleListLoading
    ) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner size="big" />
            </div>
        )
    }

    if (
        // Since playground is wrapped in ai agent provider, the account configuration is initialized if it does not exist
        // We only need to check for other types of errors
        (accountFetchError && !isAxiosError(accountFetchError)) ||
        (isAxiosError(accountFetchError) &&
            accountFetchError.response?.status !== 404)
    ) {
        reportError(accountFetchError, {
            tags: { team: SentryTeam.AI_AGENT },
            extra: {
                context:
                    'Error fetching account configuration for AI Agent Playground',
            },
        })
        return <Redirect to={routes.automation} />
    }

    if (accountData && !accountData.data.accountConfiguration.httpIntegration) {
        void dispatch(
            notify({
                message:
                    'There was an error initializing the AI Agent Test mode',
                status: NotificationStatus.Error,
            }),
        )

        const error = `Missing http integration for account ${accountData.data.accountConfiguration.gorgiasDomain}`

        reportError(new Error(error), {
            tags: { team: SentryTeam.AI_AGENT },
            extra: {
                context: error,
            },
        })
        return <Redirect to={routes.automation} />
    }

    if (!accountData) {
        return <MissingKnowledgeSourceAlert shopName={shopName} />
    }

    return (
        <CheckPlaygroundPrerequisites
            shopName={shopName}
            storeConfiguration={storeData?.data?.storeConfiguration}
            snippetHelpCenterId={snippetHelpCenter?.id}
            guidanceArticlesLength={guidanceUsed?.length}
        >
            {!storeConfigurationNotInitialized && storeData ? (
                <PlaygroundChat
                    storeData={storeData.data.storeConfiguration}
                    accountData={
                        accountData.data
                            .accountConfiguration as AccountConfigurationWithHttpIntegration
                    }
                    currentUserFirstName={currentUserFirstName}
                    arePlaygroundActionsAllowed={arePlaygroundActionsAllowed}
                    onNewConversationRef={(fn) => {
                        resetConversationRef.current = fn
                    }}
                    onGuidanceClick={onGuidanceClick}
                />
            ) : null}
        </CheckPlaygroundPrerequisites>
    )
}
