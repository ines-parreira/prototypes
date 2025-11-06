import { createContext } from 'react'

import { useSafeContext } from '@repo/hooks'

import { VoiceGender, VoiceLanguage } from '@gorgias/helpdesk-types'

export type TextToSpeechContext = {
    integrationId: number
    lastSelectedLanguage: VoiceLanguage
    setLastSelectedLanguage: (language: VoiceLanguage) => void
    lastSelectedGender: VoiceGender
    setLastSelectedGender: (gender: VoiceGender) => void
}

const TextToSpeechContext = createContext<TextToSpeechContext | undefined>(
    undefined,
)
TextToSpeechContext.displayName = 'TextToSpeechContext'

export const useTextToSpeechContext = () => useSafeContext(TextToSpeechContext)

export default TextToSpeechContext
