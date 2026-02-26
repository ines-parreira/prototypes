import { useEffect, useState } from 'react'

import { isTextsMultiLanguage } from 'config/integrations/gorgias_chat'
import type { LanguageChat } from 'constants/languages'
import { multiLanguageInitialTextsEmptyData } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import type {
    TextsMultiLanguage,
    TextsPerLanguage,
    Translations,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as IntegrationsActions from 'state/integrations/actions'

interface UseApplicationTextsProps {
    appId: string
    primaryLanguage: string
    shouldFetch: boolean
}

export const useTexts = ({
    appId,
    primaryLanguage,
    shouldFetch,
}: UseApplicationTextsProps) => {
    const [texts, setTexts] = useState<TextsMultiLanguage>(
        multiLanguageInitialTextsEmptyData,
    )
    const [translations, setTranslations] = useState<Translations>({
        texts: {},
        sspTexts: {},
        meta: {},
    })

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!shouldFetch || !appId) return

        setIsLoading(true)
        setError(null)

        void IntegrationsActions.getApplicationTexts(appId)
            .then((data) => {
                let textsMultiLanguage: TextsMultiLanguage | undefined =
                    undefined

                // Migrate to multi-language if needed.
                if (!isTextsMultiLanguage(data)) {
                    textsMultiLanguage = {
                        ...multiLanguageInitialTextsEmptyData,
                        [primaryLanguage as LanguageChat]:
                            data as TextsPerLanguage,
                    }
                } else {
                    textsMultiLanguage = data as TextsMultiLanguage
                }

                setTexts(textsMultiLanguage)
            })
            .catch((err) => {
                setError(err)
            })
            .finally(() => {
                setIsLoading(false)
            })

        void IntegrationsActions.getTranslations(primaryLanguage).then(
            (data: Translations) => {
                setTranslations(data)
            },
        )
    }, [appId, primaryLanguage, shouldFetch])

    return {
        texts,
        translations,
        isLoading,
        error,
    }
}
