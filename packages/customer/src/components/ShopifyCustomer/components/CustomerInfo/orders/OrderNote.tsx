import type { KeyboardEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { isSubmitShortcut } from '@repo/utils'

import { Text, TextAreaField } from '@gorgias/axiom'

import { useUpdateShopifyOrderNote } from '../../../hooks/useUpdateShopifyOrderNote'

type OrderNoteProps = {
    note: string | undefined
    integrationId: number
    orderId: number | string
    ticketId?: string
    readOnly?: boolean
}

export function OrderNote({
    note,
    integrationId,
    orderId,
    ticketId,
    readOnly = false,
}: OrderNoteProps) {
    const [localNote, setLocalNote] = useState(note ?? '')
    const submittedNoteRef = useRef(note ?? '')

    const { mutate: updateNote } = useUpdateShopifyOrderNote()

    useEffect(() => {
        setLocalNote(note ?? '')
        submittedNoteRef.current = note ?? ''
    }, [note])

    const saveNote = useCallback(
        (value: string) => {
            const trimmed = value.trim()
            setLocalNote(trimmed)

            if (trimmed === submittedNoteRef.current) return

            submittedNoteRef.current = trimmed
            updateNote({
                integrationId,
                orderId,
                note: trimmed,
                ticketId,
            })
        },
        [integrationId, orderId, ticketId, updateNote],
    )

    const handleBlur = useCallback(() => {
        saveNote(localNote)
    }, [localNote, saveNote])

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLTextAreaElement>) => {
            if (isSubmitShortcut(event)) {
                event.preventDefault()
                event.currentTarget.blur()
            }
        },
        [],
    )

    if (readOnly) {
        return <Text size="md">{note || '-'}</Text>
    }

    return (
        <TextAreaField
            aria-label="Order note"
            value={localNote}
            onChange={setLocalNote}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Add note..."
            size="sm"
            variant="secondary"
            autoResize
            maxRows={3}
        />
    )
}
