import {useCallback} from 'react'
import useSessionStorage from 'hooks/useSessionStorage'

export const BACK_TO_CONVERT_ONBOARDING_KEY = 'convert:onboarding:backToConvert'
export const BACK_TO_CONVERT_HOME = 'home'
const EMPTY_VALUE = ''

export function useBackToConvert() {
    const [backIntegrationId, setState] = useSessionStorage<string>(
        BACK_TO_CONVERT_ONBOARDING_KEY,
        EMPTY_VALUE,
        true
    )

    const setBackIntegrationId = useCallback(
        (id: number) => {
            const idString = !!id ? String(id) : BACK_TO_CONVERT_HOME

            try {
                // Force store the id in sessionStorage to not lose it on page refresh/redirection
                sessionStorage.setItem(BACK_TO_CONVERT_ONBOARDING_KEY, idString)
            } catch {
                // If user is in private mode or has storage restriction sessionStorage can throw.
            }

            setState(idString)
        },
        [setState]
    )

    const removeBackIntegrationId = useCallback(() => {
        try {
            sessionStorage.removeItem(BACK_TO_CONVERT_ONBOARDING_KEY)
        } catch {
            // If user is in private mode or has storage restriction sessionStorage can throw.
        }

        setState(EMPTY_VALUE)
    }, [setState])

    return {backIntegrationId, setBackIntegrationId, removeBackIntegrationId}
}
