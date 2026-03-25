import { useCallback, useEffect, useRef, useState } from 'react'

import { sanitizeHtmlDefault } from '@repo/utils'
import { produce } from 'immer'
import { set } from 'lodash'

import { getPrimaryLanguageFromChatConfig } from 'config/integrations/gorgias_chat'
import type { LanguageChat } from 'constants/languages'
import type { GorgiasChatIntegrationMeta } from 'models/integration/types'
import { multiLanguageInitialTextsEmptyData } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/GorgiasTranslateText/GorgiasTranslateText'
import type { TextsMultiLanguage } from 'rest_api/gorgias_chat_protected_api/types'
import {
    getApplicationTexts,
    updateApplicationTexts,
} from 'state/integrations/actions'

type UsePrivacyPolicyTextParams = {
    chatApplicationId: string | undefined
    integrationMeta: GorgiasChatIntegrationMeta | undefined
}

export const usePrivacyPolicyText = ({
    chatApplicationId,
    integrationMeta,
}: UsePrivacyPolicyTextParams) => {
    const defaultLanguage = getPrimaryLanguageFromChatConfig(integrationMeta)
    const textsRef = useRef<TextsMultiLanguage>(
        multiLanguageInitialTextsEmptyData,
    )
    const [privacyPolicyText, setPrivacyPolicyText] = useState<
        string | undefined
    >(undefined)

    // Tracks the last saved/loaded value to detect unsaved user edits
    const savedPrivacyPolicyTextRef = useRef<string | undefined>(undefined)

    useEffect(() => {
        if (!chatApplicationId) {
            return
        }
        void getApplicationTexts(chatApplicationId).then((data) => {
            const multiLanguage = data as TextsMultiLanguage

            textsRef.current = multiLanguage

            const textsPerLanguage =
                multiLanguage[defaultLanguage as LanguageChat]
            const text = textsPerLanguage?.texts?.privacyPolicyDisclaimer ?? ''

            // Update ref before state so isPrivacyPolicyTextDirty is false
            // on the render triggered by setPrivacyPolicyText.
            // Normalize with sanitizeHtmlDefault so the baseline matches what
            // TicketRichField produces on initial mount (e.g. adds rel="noreferrer noopener").
            savedPrivacyPolicyTextRef.current = sanitizeHtmlDefault(text)
            setPrivacyPolicyText(text)
        })
    }, [chatApplicationId, defaultLanguage])

    const savePrivacyPolicyText = useCallback(
        (text: string | undefined) => {
            if (!chatApplicationId || text === undefined) {
                return
            }
            const updatedTexts = produce(textsRef.current, (draft) => {
                set(
                    draft,
                    `${defaultLanguage}.texts.privacyPolicyDisclaimer`,
                    text,
                )
            })
            savedPrivacyPolicyTextRef.current = text
            void updateApplicationTexts(chatApplicationId, updatedTexts)
        },
        [chatApplicationId, defaultLanguage],
    )

    const isPrivacyPolicyTextDirty =
        privacyPolicyText !== undefined &&
        privacyPolicyText !== savedPrivacyPolicyTextRef.current

    return {
        privacyPolicyText,
        setPrivacyPolicyText,
        savePrivacyPolicyText,
        isPrivacyPolicyTextDirty,
    }
}
