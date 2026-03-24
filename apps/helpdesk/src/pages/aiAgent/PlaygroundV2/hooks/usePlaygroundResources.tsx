import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'
import { isAxiosError } from 'axios'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import type {
    AccountConfiguration,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useGetOrCreateSnippetHelpCenter } from '../../hooks/useGetOrCreateSnippetHelpCenter'

type UsePlaygroundResourcesProps = {
    shopName: string
    accountDomain: string
}

type UsePlaygroundResourcesReturn = {
    // Data
    storeConfiguration?: StoreConfiguration
    accountConfiguration?: Omit<AccountConfiguration, 'helpdeskOAuth'>
    snippetHelpCenterId?: number

    isLoading: boolean

    error: unknown
    storeConfigurationNotInitialized: boolean
}

export const usePlaygroundResources = ({
    shopName,
    accountDomain,
}: UsePlaygroundResourcesProps): UsePlaygroundResourcesReturn => {
    const dispatch = useAppDispatch()
    const [
        storeConfigurationNotInitialized,
        setStoreConfigurationNotInitialized,
    ] = useState(false)

    // Fetch store configuration
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

    // Fetch account configuration
    const {
        error: accountFetchError,
        data: accountData,
        isLoading: accountDataLoading,
    } = useGetAccountConfiguration(accountDomain, {
        retry: 1,
        refetchOnWindowFocus: false,
    })

    // Get or create snippet help center
    const {
        helpCenter: snippetHelpCenter,
        isLoading: snippetHelpCenterLoading,
    } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    // Handle store fetch error
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
            }
        }
    }, [storeFetchError, dispatch])

    const isLoading =
        storeDataLoading || accountDataLoading || snippetHelpCenterLoading

    const error = storeFetchError || accountFetchError

    return {
        storeConfiguration: storeData?.data?.storeConfiguration,
        accountConfiguration: accountData?.data?.accountConfiguration,
        snippetHelpCenterId: snippetHelpCenter?.id,
        isLoading,
        error,
        storeConfigurationNotInitialized,
    }
}
