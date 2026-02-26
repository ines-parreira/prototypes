import { useCallback, useEffect, useMemo, useState } from 'react'

import type { AxiosError } from 'axios'
import axios from 'axios'

import {
    getPrimaryLanguageFromChatConfig,
    isTextsMultiLanguage,
} from 'config/integrations/gorgias_chat'
import type { GorgiasChatIntegration } from 'models/integration/types'
import { parseToFriendlyErrorMessage } from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatFallbackSettingsForm.utils'
import { multiLanguageInitialTextsEmptyData } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import type {
    Texts,
    TextsMultiLanguage,
    TextsPerLanguage,
} from 'rest_api/gorgias_chat_protected_api/types'
import * as integrationsActions from 'state/integrations/actions'

const parseToTextsMultiLanguage = (data: Texts, defaultLanguage: string) => {
    if (isTextsMultiLanguage(data)) {
        return data as TextsMultiLanguage
    }

    return {
        ...multiLanguageInitialTextsEmptyData,
        [defaultLanguage]: data as TextsPerLanguage,
    }
}

export const useHandoverCustomizationChatLanguageTextsConfiguration = (
    integration: GorgiasChatIntegration,
) => {
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoadingError, setHasLoadingError] = useState(false)
    const [multiLanguageTexts, setMultiLanguageTexts] =
        useState<TextsMultiLanguage>(multiLanguageInitialTextsEmptyData)

    const defaultLanguage = useMemo(
        () => getPrimaryLanguageFromChatConfig(integration.meta),
        [integration],
    )

    const fetchApplicationTexts = useCallback(
        async (integrationId: string) => {
            setIsLoading(true)
            setHasLoadingError(false)

            try {
                const data =
                    await integrationsActions.getApplicationTexts(integrationId)

                setMultiLanguageTexts(
                    parseToTextsMultiLanguage(data, defaultLanguage),
                )
            } catch {
                setHasLoadingError(true)
                setMultiLanguageTexts(multiLanguageInitialTextsEmptyData)
            } finally {
                setIsLoading(false)
            }
        },
        [
            defaultLanguage,
            setIsLoading,
            setHasLoadingError,
            setMultiLanguageTexts,
        ],
    )

    const updateMultiLanguageTexts = async (texts: TextsMultiLanguage) => {
        if (!integration.meta.app_id || !texts) {
            const message = 'Invalid parameters for updateMultiLanguageTexts'

            throw new Error(message)
        }
        try {
            await integrationsActions.updateApplicationTexts(
                integration.meta.app_id,
                texts,
            )

            setMultiLanguageTexts(texts)
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError

                throw new Error(parseToFriendlyErrorMessage(axiosError))
            }

            throw new Error('An unknown error occurred. Please try again')
        }
    }

    useEffect(() => {
        const loadTexts = async () => {
            if (!integration.meta.app_id) {
                return
            }

            await fetchApplicationTexts(integration.meta.app_id)
        }

        loadTexts()
    }, [integration.meta.app_id, fetchApplicationTexts])

    return {
        multiLanguageTexts,
        isLoading,
        hasLoadingError,
        updateMultiLanguageTexts,
    }
}
