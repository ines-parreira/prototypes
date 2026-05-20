import { useState } from 'react'

import type { LanguageChat } from 'constants/languages'

import { closedModalState } from '../types'
import type { ModalState } from '../types'

export const useTranslateTextModals = () => {
    const [modalState, setModalState] = useState<ModalState>(closedModalState)

    const openLanguageChangeModal = (pendingLanguage: LanguageChat) => {
        setModalState({
            exitOpen: false,
            languageChangeOpen: true,
            pendingLanguage,
        })
    }

    const openExitModal = () => {
        setModalState({
            exitOpen: true,
            languageChangeOpen: false,
            pendingLanguage: null,
        })
    }

    const onCloseModals = () => setModalState(closedModalState)

    return {
        modalState,
        openLanguageChangeModal,
        openExitModal,
        onCloseModals,
        isExitModalOpen: modalState.exitOpen,
        isLanguageChangeModalOpen: modalState.languageChangeOpen,
    }
}
