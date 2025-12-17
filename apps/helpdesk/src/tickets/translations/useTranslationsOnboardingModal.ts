import { useCallback, useEffect } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useLocalStorage, useToggle } from '@repo/hooks'

import { useCurrentUserLanguagePreferences } from 'tickets/core/hooks/translations/useCurrentUserLanguagePreferences'

const TRANSLATIONS_ONBOARDING_MODAL_KEY =
    'ai-translations-onboarding-modal-shown' as const

export const useTranslationsOnboardingModal = () => {
    const { primary, isFetching } = useCurrentUserLanguagePreferences()
    const hasMessagesTranslations = useFlag(FeatureFlagKey.MessagesTranslations)
    const [hasSeenModal, setHasSeenModal] = useLocalStorage(
        TRANSLATIONS_ONBOARDING_MODAL_KEY,
        false,
    )
    const { isOpen, close, open } = useToggle(false)

    useEffect(() => {
        if (
            !hasSeenModal &&
            !isOpen &&
            !isFetching &&
            !primary &&
            hasMessagesTranslations
        ) {
            open()
        }
    }, [
        hasSeenModal,
        open,
        isFetching,
        primary,
        isOpen,
        hasMessagesTranslations,
    ])

    const handleClose = useCallback(() => {
        setHasSeenModal(true)
        close()
    }, [close, setHasSeenModal])

    return {
        isOpen,
        close: handleClose,
    }
}
