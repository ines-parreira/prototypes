import { useCallback, useEffect, useRef, useState } from 'react'

import { localForageManager } from '@repo/browser-storage'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory } from 'react-router-dom'

import { useCurrentUserId } from '../hooks/useCurrentUserId'

const DRAFT_TICKET_STORE = 'ticket-drafts'
const CREATE_TICKET_PATH = '/app/ticket/new'

type RawBlock = { text: string }
type TicketDraft = {
    appliedMacro: unknown
    assignee_team: unknown
    assignee_user: unknown
    attachments: unknown[]
    custom_fields: Record<string, unknown>
    customer: unknown
    source: { type: string; to?: unknown[] }
    subject: string
    tags: unknown[]
    ticket: { contentState: { blocks: RawBlock[] } } | null
}

function isDraftEmpty(draft: TicketDraft | null): boolean {
    if (!draft) return true
    const {
        appliedMacro,
        assignee_team,
        assignee_user,
        attachments,
        custom_fields,
        customer,
        source,
        subject,
        ticket,
        tags,
    } = draft
    if (ticket?.contentState?.blocks?.some((b) => b.text.trim().length > 0))
        return false
    return (
        appliedMacro === null &&
        assignee_team === null &&
        assignee_user === null &&
        attachments.length === 0 &&
        Object.keys(custom_fields ?? {}).length === 0 &&
        customer === null &&
        source.type === 'email' &&
        (source.to?.length ?? 0) === 0 &&
        subject === '' &&
        tags.length === 0
    )
}

export function useCreateTicketDraft() {
    const history = useHistory()
    const { currentUserId } = useCurrentUserId()

    const localForageRef = useRef<LocalForage>()
    if (!localForageRef.current) {
        localForageRef.current = localForageManager.getTable(DRAFT_TICKET_STORE)
    }
    const localForage = localForageRef.current

    const [hasDraft, setHasDraft] = useState(false)

    const checkDraft = useCallback(async () => {
        const draft = (await localForage.getItem('new')) as TicketDraft | null
        setHasDraft(!isDraftEmpty(draft))
    }, [localForage])

    useEffect(() => {
        let subscription: Subscription | undefined
        const setupSubscription = async () => {
            await localForage.ready()
            subscription = localForageManager.observeTable(
                DRAFT_TICKET_STORE,
                checkDraft,
            )
        }
        void setupSubscription()
        return () => subscription?.unsubscribe()
    }, [localForage, checkDraft])

    useEffectOnce(() => {
        void checkDraft()
    })

    const onCreateTicket = useCallback(() => {
        history.push(CREATE_TICKET_PATH)
    }, [history])

    const onResumeDraft = useCallback(() => {
        history.push(CREATE_TICKET_PATH)
        logEvent(SegmentEvent.DraftTicket, {
            type: 'resume',
            user_id: currentUserId,
        })
    }, [currentUserId, history])

    const onDiscardDraft = useCallback(async () => {
        await localForage.clear()
        history.push(CREATE_TICKET_PATH)
        logEvent(SegmentEvent.DraftTicket, {
            type: 'discard',
            user_id: currentUserId,
        })
    }, [currentUserId, history, localForage])

    return { hasDraft, onCreateTicket, onResumeDraft, onDiscardDraft }
}
