import React, { ReactNode, useCallback, useMemo } from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {
    CreateStoreConfigurationPayload,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useStoreConfiguration } from '../hooks/useStoreConfiguration'
import { useStoreConfigurationMutation } from '../hooks/useStoreConfigurationMutation'
import AiAgentStoreConfigurationContext from './AiAgentStoreConfigurationContext'

type Props = {
    children: ReactNode
}

const AiAgentStoreConfigurationProvider = ({ children }: Props) => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const isAiAgentOnboardingWizardEnabled =
        useFlags()[FeatureFlagKey.AiAgentOnboardingWizard]

    const { storeConfiguration: fetchedStoreConfiguration, isLoading } =
        useStoreConfiguration({
            shopName,
            accountDomain,
            withWizard: !!isAiAgentOnboardingWizardEnabled,
            withFloatingInput: true,
        })

    const {
        isLoading: isPendingCreateOrUpdate,
        createStoreConfiguration: createStoreConfigurationMutation,
        upsertStoreConfiguration: upsertStoreConfigurationMutation,
    } = useStoreConfigurationMutation({ shopName, accountDomain })

    const createStoreConfiguration = useCallback(
        async (configurationToSubmit: CreateStoreConfigurationPayload) => {
            await createStoreConfigurationMutation(configurationToSubmit)
        },
        [createStoreConfigurationMutation],
    )

    const updateStoreConfiguration = useCallback(
        async (configurationToSubmit: StoreConfiguration) => {
            await upsertStoreConfigurationMutation(configurationToSubmit)
        },
        [upsertStoreConfigurationMutation],
    )

    const value = useMemo(
        () => ({
            storeConfiguration: isLoading
                ? undefined
                : fetchedStoreConfiguration,
            createStoreConfiguration,
            updateStoreConfiguration,
            isLoading,
            isPendingCreateOrUpdate,
        }),
        [
            isLoading,
            fetchedStoreConfiguration,
            createStoreConfiguration,
            updateStoreConfiguration,
            isPendingCreateOrUpdate,
        ],
    )

    return (
        <AiAgentStoreConfigurationContext.Provider value={value}>
            {children}
        </AiAgentStoreConfigurationContext.Provider>
    )
}

export default AiAgentStoreConfigurationProvider
