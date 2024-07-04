import React, {useEffect, useState} from 'react'
import {Link, Redirect, useParams} from 'react-router-dom'
import {isAxiosError} from 'axios'
import {AI_AGENT_SENTRY_TEAM} from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import {AccountConfigurationWithHttpIntegration} from 'models/aiAgent/types'
import Loader from 'pages/common/components/Loader/Loader'
import history from 'pages/history'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {reportError} from 'utils/errors'
import {getCurrentUser} from 'state/currentUser/selectors'
import Button from 'pages/common/components/button/Button'
import css from './AiAgentPlaygroundView.less'
import {useAiAgentNavigation} from './hooks/useAiAgentNavigation'
import {PlaygroundChat} from './components/PlaygroundChat/PlaygroundChat'

type UrlParams = {
    shopName: string
}

export const AiAgentPlaygroundView = () => {
    const {shopName} = useParams<UrlParams>()

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

                return history.push(routes.configuration)
            }
        }
    }, [storeFetchError, dispatch, shopName, routes.configuration])

    if (storeDataLoading || accountDataLoading) {
        return <Loader />
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

    return storeConfigurationNotInitialized || !accountData || !storeData ? (
        <div className={css.container}>
            <div>
                <h1 className="heading-section-semibold">
                    Test your AI Agent as a customer
                </h1>
                <p className="mb-0">
                    Once AI Agent is set up, you can test how it will respond to
                    your customers here.
                </p>
                <Link to={routes.configuration}>
                    <Button>Configure AI Agent</Button>
                </Link>
            </div>
        </div>
    ) : (
        <PlaygroundChat
            storeData={storeData.data.storeConfiguration}
            accountData={
                accountData.data
                    .accountConfiguration as AccountConfigurationWithHttpIntegration
            }
            currentUserFirstName={currentUserFirstName}
        />
    )
}
