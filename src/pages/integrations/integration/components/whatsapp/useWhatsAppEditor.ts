import {useContext} from 'react'

import {Context, WhatsAppEditorContextState} from './WhatsAppEditorContext'

export default function useWhatsAppEditor(): WhatsAppEditorContextState {
    return useContext(Context)
}
