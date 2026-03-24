import { useLocalStorage } from '@repo/hooks'
import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import useAppSelector from 'hooks/useAppSelector'
import { useGenerateCustomToneOfVoicePreview } from 'models/aiAgent/queries'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { createCustomToneOfVoicePreviewBody } from '../utils/custom-tone-of-voice-preview.utils'

const AI_SETTINGS_CUSTOM_TONE_OF_VOICE = 'ai-settings-custom-tone-of-voice'

type CustomToneOfVoiceRecord = {
    [shopName: string]: string
}

const useCustomToneOfVoicePreview = ({
    customToneOfVoice,
    shopName,
}: {
    customToneOfVoice: string
    shopName: string
}) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const accountId = currentAccount.get('id')

    const {
        mutateAsync: generateCustomToneOfVoicePreview,
        isLoading,
        isError,
    } = useGenerateCustomToneOfVoicePreview()

    const [customToneOfVoicePreviews, setCustomToneOfVoicePreviews] =
        useLocalStorage<CustomToneOfVoiceRecord>(
            AI_SETTINGS_CUSTOM_TONE_OF_VOICE,
            {},
        )

    const onGenerateCustomToneOfVoicePreview = async () => {
        const body = createCustomToneOfVoicePreviewBody({
            gorgiasDomain: accountDomain,
            accountId,
            storeName: shopName,
            customToneOfVoice,
        })

        try {
            const result = await generateCustomToneOfVoicePreview([body])
            setCustomToneOfVoicePreviews((prevPreviews) => ({
                ...prevPreviews,
                [shopName]: result.data.ai_answer,
            }))
        } catch (error) {
            reportError(error, {
                tags: { team: SentryTeam.AI_AGENT },
                extra: {
                    context:
                        'Error during generation of custom tone of voice preview',
                    accountId,
                    customToneOfVoice,
                },
            })
        }
    }

    return {
        latestCustomToneOfVoicePreview: customToneOfVoicePreviews?.[shopName],
        onGenerateCustomToneOfVoicePreview,
        isLoading,
        isError,
    }
}

export default useCustomToneOfVoicePreview
