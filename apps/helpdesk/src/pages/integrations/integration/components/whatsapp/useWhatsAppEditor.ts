import { useContext } from 'react'

import type { WhatsAppEditorContextState } from './WhatsAppEditorContext'
import { Context } from './WhatsAppEditorContext'

export function useWhatsAppEditor(): WhatsAppEditorContextState {
    return useContext(Context)
}
