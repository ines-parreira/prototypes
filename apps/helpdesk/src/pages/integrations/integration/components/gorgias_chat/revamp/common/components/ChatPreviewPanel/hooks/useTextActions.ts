import type { RefObject } from 'react'
import { useCallback } from 'react'

import type { ChatPreviewPanelHandle } from '../ChatPreviewPanel'

export const useTextActions = (panelRef: RefObject<ChatPreviewPanelHandle>) => {
    const updateIntroductionText = useCallback(
        (introductionText: string) => {
            panelRef.current?.updatePreviewTexts({ introductionText })
        },
        [panelRef],
    )

    const updateOfflineIntroductionText = useCallback(
        (offlineIntroductionText: string) => {
            panelRef.current?.updatePreviewTexts({ offlineIntroductionText })
        },
        [panelRef],
    )

    const updateChatTitle = useCallback(
        (chatTitle: string) => {
            panelRef.current?.updatePreviewTexts({ chatTitle })
        },
        [panelRef],
    )

    const updateLegalDisclaimer = useCallback(
        (privacyPolicyDisclaimer: string) => {
            panelRef.current?.updateTexts({ privacyPolicyDisclaimer })
        },
        [panelRef],
    )

    const updateTexts = useCallback(
        (texts: Record<string, string>) => {
            panelRef.current?.updateTexts(texts)
        },
        [panelRef],
    )

    const updatePreviewTexts = useCallback(
        (texts: Record<string, string>) => {
            panelRef.current?.updatePreviewTexts(texts)
        },
        [panelRef],
    )

    const updateSSPTexts = useCallback(
        (texts: Record<string, string>) => {
            panelRef.current?.updateSSPTexts(texts)
        },
        [panelRef],
    )

    return {
        updateIntroductionText,
        updateOfflineIntroductionText,
        updateChatTitle,
        updateLegalDisclaimer,
        updateTexts,
        updatePreviewTexts,
        updateSSPTexts,
    }
}
