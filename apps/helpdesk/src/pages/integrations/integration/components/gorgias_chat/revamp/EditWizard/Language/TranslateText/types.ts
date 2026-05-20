import type { LanguageChat } from 'constants/languages'

export type ModalState = {
    exitOpen: boolean
    languageChangeOpen: boolean
    pendingLanguage: LanguageChat | null
}

export const closedModalState: ModalState = {
    exitOpen: false,
    languageChangeOpen: false,
    pendingLanguage: null,
}
