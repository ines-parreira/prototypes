import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'
import { isAxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

import { SentryTeam } from 'common/const/sentryTeamNames'
import {
    useGetAccountConfiguration,
    useGetStoreConfigurationPure,
} from 'models/aiAgent/queries'
import type {
    AccountConfiguration,
    StoreConfiguration,
} from 'models/aiAgent/types'

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
                toast.error(
                    'There was an error initializing the AI Agent Test mode',
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
    }, [storeFetchError])

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
