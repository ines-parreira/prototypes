import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import {isAxiosError} from 'axios'
import React, {useEffect, useState} from 'react'
import {Redirect} from 'react-router-dom'

import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import {AccountConfigurationWithHttpIntegration} from 'models/aiAgent/types'
import history from 'pages/history'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'

import css from './AiAgentMainViewContainer.less'
import {PlaygroundChat} from './components/PlaygroundChat/PlaygroundChat'
import {CheckPlaygroundPrerequisites} from './components/PlaygroundPrerequisites/PlaygroundPrerequisites'
import {MissingKnowledgeSourceAlert} from './components/PlaygroundPrerequisites/PlaygroundPrerequisitesAlerts'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {useGetOrCreateSnippetHelpCenter} from './hooks/useGetOrCreateSnippetHelpCenter'

type Props = {
    shopName: string
}

export const AiAgentPlaygroundView = ({shopName}: Props) => {
    const dispatch = useAppDispatch()
    const {routes} = useAiAgentNavigation({shopName})

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const currentUser = useAppSelector(getCurrentUser)
    const currentUserFirstName = currentUser?.get('firstname')

    const [
        storeConfigurationNotInitialized,
        setStoreConfigurationNotInitialized,
    ] = useState(false)

    const {
        error: storeFetchError,
        data: storeData,
        isLoading: storeDataLoading,
    } = useGetStoreConfigurationPure(
        {
            accountDomain,
            storeName: shopName,
        },
        {retry: 1, refetchOnWindowFocus: false}
    )

    const {
        error: accountFetchError,
        data: accountData,
        isLoading: accountDataLoading,
    } = useGetAccountConfiguration(accountDomain, {
        retry: 1,
        refetchOnWindowFocus: false,
    })

    const {helpCenter: snippetHelpCenter, isLoading: snippetHelpCenterLoading} =
        useGetOrCreateSnippetHelpCenter({
            accountDomain,
            shopName,
        })

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
                    })
                )
                reportError(storeFetchError, {
                    tags: {team: AI_AGENT_SENTRY_TEAM},
                    extra: {
                        context:
                            'Error fetching store configuration for AI Agent Playground',
                    },
                })

                return history.push(routes.main)
            }
        }
    }, [storeFetchError, dispatch, shopName, routes])

    if (storeDataLoading || accountDataLoading || snippetHelpCenterLoading) {
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
            tags: {team: AI_AGENT_SENTRY_TEAM},
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
            })
        )

        const error = `Missing http integration for account ${accountData.data.accountConfiguration.gorgiasDomain}`

        reportError(new Error(error), {
            tags: {team: AI_AGENT_SENTRY_TEAM},
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
        >
            {!storeConfigurationNotInitialized && storeData ? (
                <PlaygroundChat
                    storeData={storeData.data.storeConfiguration}
                    accountData={
                        accountData.data
                            .accountConfiguration as AccountConfigurationWithHttpIntegration
                    }
                    currentUserFirstName={currentUserFirstName}
                />
            ) : null}
        </CheckPlaygroundPrerequisites>
    )
}
