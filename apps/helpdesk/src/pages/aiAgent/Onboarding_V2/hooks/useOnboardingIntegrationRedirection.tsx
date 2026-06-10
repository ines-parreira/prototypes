import { useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import {
    useEffectOnce,
    useLocalStorage,
    useLocalStorageWithExpiry,
} from '@gorgias/toolkit-react'

import type { IntegrationType } from 'models/integration/types'

export const LOCAL_STORAGE_KEY = 'aiagent_onboarding_integration_redirection'
export const LOCAL_STORAGE_ID_KEY = 'aiagent_onboarding_integration_id'
export const LOCAL_STORAGE_TYPE_KEY = 'aiagent_onboarding_integration_type'
export const useOnboardingIntegrationRedirection = (
    isOnboardPage: boolean = true,
) => {
    const {
        state: onboardingStorageKey,
        setState: setOnboardingStorageKey,
        remove: removeOnboardingStorageKey,
    } = useLocalStorageWithExpiry<string | null>(
        LOCAL_STORAGE_KEY,
        Duration.hours(1),
        null,
    )

    const [storageIntegrationId, setStorageIntegrationId, removeIntegrationId] =
        useLocalStorage<string>(LOCAL_STORAGE_ID_KEY, '')

    const [
        storageIntegrationType,
        setStorageIntegrationType,
        removeIntegrationType,
    ] = useLocalStorage<string>(LOCAL_STORAGE_TYPE_KEY, '')

    const [redirectUrl] = useState(onboardingStorageKey)
    const [integrationId] = useState(storageIntegrationId)
    const [integrationType] = useState(storageIntegrationType)

    useEffectOnce(() => {
        if (isOnboardPage) {
            removeOnboardingStorageKey()
            removeIntegrationId()
            removeIntegrationType()
        }
    })

    const redirectToOnboardingIfOnboarding = (
        integrationType: string,
        integrationId: string,
    ) => {
        if (
            redirectUrl !== null &&
            storageIntegrationType === integrationType
        ) {
            const url = new URL(redirectUrl)
            setStorageIntegrationId(integrationId)
            window.open(url.toString(), '_self')
        }
    }

    const redirectToIntegration = (
        integrationUrl: string,
        integrationType: IntegrationType,
    ) => {
        setOnboardingStorageKey(window.location.href)
        setStorageIntegrationType(integrationType)
        window.open(integrationUrl, '_self')
    }

    return {
        redirectToOnboardingIfOnboarding,
        redirectToIntegration,
        integrationId,
        integrationType,
    }
}
