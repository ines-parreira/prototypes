import { createContext } from 'react'

import { useSafeContext } from '@repo/hooks'

export type TextToSpeechContext = {
    integrationId: number
}

const TextToSpeechContext = createContext<TextToSpeechContext>({
    integrationId: 0,
})
TextToSpeechContext.displayName = 'TextToSpeechContext'

export const useTextToSpeechContext = () => useSafeContext(TextToSpeechContext)

export default TextToSpeechContext
