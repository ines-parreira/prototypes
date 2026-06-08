import { useCallback, useEffect, useRef } from 'react'

import type { ContextAttachment } from '@gorgias/copilot'
import { useCopilotPanel, useMessageContextAttachments } from '@gorgias/copilot'

import { useCopilotContextAttachmentCandidate } from './CopilotContextAttachmentProvider'

export function useCopilotContextAttachmentSync() {
    const { isOpen: isCopilotOpen } = useCopilotPanel()
    const contextAttachment = useCopilotContextAttachmentCandidate()
    const { canAttach, clearMessageAttachment, setMessageAttachment } =
        useMessageContextAttachments()

    const syncedAttachmentKeyRef = useRef<string>()

    const syncContextAttachment = useCallback(() => {
        if (!canAttach) return

        const nextAttachmentKey = getContextAttachmentKey(contextAttachment)

        if (syncedAttachmentKeyRef.current === nextAttachmentKey) return

        if (contextAttachment) {
            setMessageAttachment(contextAttachment)
        } else {
            clearMessageAttachment()
        }

        syncedAttachmentKeyRef.current = nextAttachmentKey
    }, [
        canAttach,
        clearMessageAttachment,
        contextAttachment,
        setMessageAttachment,
    ])

    useEffect(() => {
        if (canAttach) return

        syncedAttachmentKeyRef.current = undefined
    }, [canAttach])

    useEffect(() => {
        if (!isCopilotOpen) return

        syncContextAttachment()
    }, [isCopilotOpen, syncContextAttachment])
}

function getContextAttachmentKey(attachment: ContextAttachment | undefined) {
    if (!attachment) return undefined

    const helpCenterId =
        'helpCenterId' in attachment ? attachment.helpCenterId : ''

    return `${attachment.kind}:${attachment.id}:${attachment.title}:${helpCenterId}`
}
