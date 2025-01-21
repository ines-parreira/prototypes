import {useState} from 'react'

import useEffectOnce from 'hooks/useEffectOnce'
import useLocalStorageWithExpiry from 'hooks/useLocalStorageWithExpiry'

const LOCAL_STORAGE_KEY = 'aiagent_onboarding_integration_redirection'
const REDIRECT_TTL = 1000 * 60 * 60 * 1 // 1 hour

export const useOnboardingIntegrationRedirection = () => {
    const {
        state: storageRedirectUrl,
        setState: setStorageRedirectUrl,
        remove,
    } = useLocalStorageWithExpiry<string | null>(
        LOCAL_STORAGE_KEY,
        REDIRECT_TTL,
        null
    )

    const [redirectUrl] = useState(storageRedirectUrl)

    useEffectOnce(() => {
        remove()
    })

    const redirectToOnboardingIfOnboarding = (
        integrationType: string,
        integrationId: string
    ) => {
        if (redirectUrl !== null) {
            const url = new URL(redirectUrl)
            url.searchParams.set('integrationType', integrationType)
            url.searchParams.set('integrationId', integrationId)
            window.open(url.toString(), '_self')
        }
    }

    const redirectToIntegration = (integrationUrl: string) => {
        setStorageRedirectUrl(window.location.href)
        window.open(integrationUrl, '_self')
    }

    return {redirectToOnboardingIfOnboarding, redirectToIntegration}
}
