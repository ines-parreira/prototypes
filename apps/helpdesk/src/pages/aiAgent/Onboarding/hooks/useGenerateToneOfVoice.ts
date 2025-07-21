import { useCallback } from 'react'

import { useMutation } from '@tanstack/react-query'

import useAppSelector from 'hooks/useAppSelector'
import { generateToneOfVoice } from 'models/aiAgent/resources/tone-of-voice'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

export const useGenerateToneOfVoice = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)

    const accountDomain = currentAccount.get('domain')

    const { mutateAsync, isLoading } = useMutation(
        ({
            gorgiasDomain,
            storeDomain,
        }: {
            gorgiasDomain: string
            storeDomain: string
        }) => generateToneOfVoice(gorgiasDomain, storeDomain),
    )

    const getToneOfVoice = useCallback(
        async (storeDomain: string | undefined | null) => {
            if (storeDomain) {
                try {
                    const response = await mutateAsync({
                        gorgiasDomain: accountDomain,
                        storeDomain: storeDomain,
                    })
                    return response.data.tone_of_voice
                } catch (error) {
                    console.error('Failed to generate tone of voice', error)
                }
            }

            return undefined
        },
        [accountDomain, mutateAsync],
    )

    return {
        generateToneOfVoice: getToneOfVoice,
        isLoading,
    }
}
